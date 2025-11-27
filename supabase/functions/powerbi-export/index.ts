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

    const url = new URL(req.url);
    const projectId = url.searchParams.get('project_id');
    const systemId = url.searchParams.get('system_id');

    if (!projectId) {
      throw new Error('project_id is required');
    }

    // Fetch comprehensive project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) throw projectError;

    // Fetch systems
    let systemsQuery = supabase
      .from('systems')
      .select('*')
      .eq('project_id', projectId);

    if (systemId) {
      systemsQuery = systemsQuery.eq('id', systemId);
    }

    const { data: systems, error: systemsError } = await systemsQuery;
    if (systemsError) throw systemsError;

    const systemIds = systems.map(s => s.id);

    // Fetch subsystems
    const { data: subsystems } = await supabase
      .from('subsystems')
      .select('*')
      .in('system_id', systemIds);

    const subsystemIds = subsystems?.map(s => s.id) || [];

    // Fetch ITRs
    const { data: itrs } = await supabase
      .from('itrs')
      .select('*')
      .in('subsystem_id', subsystemIds);

    // Fetch Tags
    const { data: tags } = await supabase
      .from('tags')
      .select('*')
      .in('subsystem_id', subsystemIds);

    const tagIds = tags?.map(t => t.id) || [];

    // Fetch Punch Items
    const { data: punchItems } = await supabase
      .from('punch_items')
      .select('*')
      .in('subsystem_id', subsystemIds);

    // Fetch Preservation Tasks
    const { data: preservationTasks } = await supabase
      .from('preservation_tasks')
      .select('*')
      .in('tag_id', tagIds);

    // Build PowerBI compatible response
    const powerBIData = {
      metadata: {
        project: project,
        export_date: new Date().toISOString(),
        systems_count: systems.length,
        subsystems_count: subsystems?.length || 0,
      },
      systems: systems,
      subsystems: subsystems || [],
      itrs: itrs || [],
      tags: tags || [],
      punch_items: punchItems || [],
      preservation_tasks: preservationTasks || [],
      kpis: {
        total_itrs: itrs?.length || 0,
        completed_itrs: itrs?.filter(i => i.status === 'COMPLETED').length || 0,
        total_punch_a: punchItems?.filter(p => p.category === 'A').length || 0,
        open_punch_a: punchItems?.filter(p => p.category === 'A' && p.status === 'OPEN').length || 0,
        overdue_preservation: preservationTasks?.filter(p => p.status === 'OVERDUE').length || 0,
      },
    };

    return new Response(
      JSON.stringify(powerBIData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="powerbi-export-${projectId}.json"`,
        } 
      }
    );

  } catch (error) {
    console.error('Error in powerbi-export function:', error);
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