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

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const entityType = formData.get('entity_type') as string;
    const projectId = formData.get('project_id') as string;
    const systemId = formData.get('system_id') as string | null;

    if (!file || !entityType || !projectId) {
      throw new Error('Faltan parámetros requeridos');
    }

    // Parse CSV file
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const record: any = {};
      headers.forEach((header, index) => {
        record[header] = values[index];
      });
      records.push(record);
    }

    console.log(`Processing ${records.length} records for ${entityType}`);

    // Create import log
    const { data: importLog, error: logError } = await supabase
      .from('import_logs')
      .insert({
        user_id: user.id,
        import_type: 'csv',
        entity_type: entityType,
        project_id: projectId,
        system_id: systemId,
        file_name: file.name,
        records_processed: records.length,
        status: 'processing',
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating import log:', logError);
      throw logError;
    }

    let successCount = 0;
    let failCount = 0;
    const errors: any[] = [];

    // Process records based on entity type
    try {
      if (entityType === 'itrs') {
        for (const record of records) {
          try {
            const { error } = await supabase.from('itrs').insert({
              itr_code: record.itr_code,
              itr_type: record.itr_type,
              discipline: record.discipline,
              status: record.status || 'NOT_STARTED',
              subsystem_id: record.subsystem_id,
              comments: record.comments,
            });
            
            if (error) throw error;
            successCount++;
          } catch (err) {
            failCount++;
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            errors.push({ record, error: errorMessage });
          }
        }
      } else if (entityType === 'tags') {
        for (const record of records) {
          try {
            const { error } = await supabase.from('tags').insert({
              tag_code: record.tag_code,
              discipline: record.discipline,
              subsystem_id: record.subsystem_id,
              description: record.description,
              device_type: record.device_type,
              criticality: record.criticality || 'MEDIUM',
            });
            
            if (error) throw error;
            successCount++;
          } catch (err) {
            failCount++;
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            errors.push({ record, error: errorMessage });
          }
        }
      } else if (entityType === 'punch_items') {
        for (const record of records) {
          try {
            const { error } = await supabase.from('punch_items').insert({
              subsystem_id: record.subsystem_id,
              category: record.category,
              description: record.description,
              status: record.status || 'OPEN',
              raised_by: record.raised_by,
              due_date: record.due_date,
              tag_id: record.tag_id,
            });
            
            if (error) throw error;
            successCount++;
          } catch (err) {
            failCount++;
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            errors.push({ record, error: errorMessage });
          }
        }
      } else if (entityType === 'preservation') {
        for (const record of records) {
          try {
            const { error } = await supabase.from('preservation_tasks').insert({
              tag_id: record.tag_id,
              description: record.description,
              frequency_days: parseInt(record.frequency_days),
              next_due_date: record.next_due_date,
              status: record.status || 'OK',
            });
            
            if (error) throw error;
            successCount++;
          } catch (err) {
            failCount++;
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            errors.push({ record, error: errorMessage });
          }
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
          records_processed: records.length,
          records_success: successCount,
          records_failed: failCount,
          errors: errors.slice(0, 10), // Return first 10 errors
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (err) {
      // Update log on complete failure
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      await supabase
        .from('import_logs')
        .update({
          status: 'failed',
          records_success: successCount,
          records_failed: failCount,
          error_details: { error: errorMessage },
        })
        .eq('id', importLog.id);

      throw err;
    }

  } catch (error) {
    console.error('Error in import-data function:', error);
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