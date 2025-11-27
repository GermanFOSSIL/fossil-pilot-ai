import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('No autorizado');
    }

    const { entity_type, project_id, system_id, data } = await req.json();

    if (!entity_type || !project_id || !data || !Array.isArray(data)) {
      throw new Error('Parámetros inválidos');
    }

    console.log(`API Import: ${data.length} records for ${entity_type}`);

    // Create import log
    const { data: importLog, error: logError } = await supabase
      .from('import_logs')
      .insert({
        user_id: user.id,
        import_type: 'api',
        entity_type,
        project_id,
        system_id,
        records_processed: data.length,
        status: 'processing',
      })
      .select()
      .single();

    if (logError) throw logError;

    let successCount = 0;
    let failCount = 0;
    const errors: any[] = [];

    // Process records
    for (const record of data) {
      try {
        const { error } = await supabase.from(entity_type).insert(record);
        
        if (error) throw error;
        successCount++;
      } catch (err) {
        failCount++;
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        errors.push({ record, error: errorMessage });
      }
    }

    // Update import log
    await supabase
      .from('import_logs')
      .update({
        status: failCount === 0 ? 'completed' : 'failed',
        records_success: successCount,
        records_failed: failCount,
        error_details: errors.length > 0 ? errors : null,
      })
      .eq('id', importLog.id);

    return new Response(
      JSON.stringify({
        success: true,
        import_id: importLog.id,
        records_processed: data.length,
        records_success: successCount,
        records_failed: failCount,
        errors: errors.slice(0, 10),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in api-import function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});