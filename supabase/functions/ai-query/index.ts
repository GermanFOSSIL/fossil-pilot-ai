import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, projectId, systemId, subsystemId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch system data
    const { data: system } = await supabase
      .from("systems")
      .select("*, project:projects(*)")
      .eq("id", systemId)
      .single();

    // Fetch subsystems
    const { data: subsystems } = await supabase
      .from("subsystems")
      .select("id, code, name, status")
      .eq("system_id", systemId);

    const subsystemIds = subsystems?.map((s) => s.id) || [];

    // Fetch ITRs
    const { data: itrs } = await supabase
      .from("itrs")
      .select("itr_type, status, discipline")
      .in("subsystem_id", subsystemIds);

    const itrA = itrs?.filter((i) => i.itr_type === "A") || [];
    const itrB = itrs?.filter((i) => i.itr_type === "B") || [];

    const itrACompleted = itrA.filter((i) => i.status === "COMPLETED").length;
    const itrBCompleted = itrB.filter((i) => i.status === "COMPLETED").length;
    const itrBPending = itrB.filter((i) => i.status !== "COMPLETED");

    // Fetch Punch items
    const { data: punchItems } = await supabase
      .from("punch_items")
      .select("category, status, description, due_date")
      .in("subsystem_id", subsystemIds);

    const punchCategoryA = punchItems?.filter(
      (p) => p.category === "A" && (p.status === "OPEN" || p.status === "IN_PROGRESS")
    ) || [];

    // Fetch preservation tasks
    const { data: tags } = await supabase
      .from("tags")
      .select("id, tag_code")
      .in("subsystem_id", subsystemIds);

    const tagIds = tags?.map((t) => t.id) || [];

    const { data: preservationTasks } = await supabase
      .from("preservation_tasks")
      .select("*, tag:tags(tag_code)")
      .in("tag_id", tagIds)
      .eq("status", "OVERDUE");

    // Build context
    const context = `
Proyecto: ${system?.project?.name} (${system?.project?.code})
Sistema: ${system?.name} (${system?.code})
Estado del sistema: ${system?.status}

RESUMEN DE ITRs:
- ITR A: ${itrACompleted} de ${itrA.length} completados (${Math.round((itrACompleted / itrA.length) * 100)}%)
- ITR B: ${itrBCompleted} de ${itrB.length} completados (${Math.round((itrBCompleted / itrB.length) * 100)}%)
- ITR B pendientes por disciplina:
${Object.entries(
  itrBPending.reduce((acc: any, itr: any) => {
    acc[itr.discipline] = (acc[itr.discipline] || 0) + 1;
    return acc;
  }, {})
)
  .map(([disc, count]) => `  - ${disc}: ${count}`)
  .join("\n")}

PUNCH ITEMS CRÍTICOS (Categoría A abiertos):
${punchCategoryA.length > 0 ? punchCategoryA.map((p: any) => `- ${p.description} (vence: ${p.due_date})`).join("\n") : "No hay punch categoría A abiertos"}

PRESERVACIONES VENCIDAS:
${preservationTasks && preservationTasks.length > 0 ? preservationTasks.map((p: any) => `- Tag ${p.tag?.tag_code}: ${p.description} (vencida desde ${p.next_due_date})`).join("\n") : "No hay preservaciones vencidas"}

SUBSISTEMAS:
${subsystems?.map((s: any) => `- ${s.code}: ${s.name} (${s.status})`).join("\n")}
`;

    let response: string;

    if (lovableApiKey) {
      // Use Lovable AI
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "Eres un asistente experto en gestión de completions para proyectos Oil & Gas. Analizas ITRs, punch lists y preservación de equipos. Proporciona respuestas claras, concisas y accionables basadas en los datos proporcionados.",
            },
            {
              role: "user",
              content: `Contexto del proyecto:\n${context}\n\nPregunta del usuario: ${question}`,
            },
          ],
        }),
      });

      if (!aiResponse.ok) {
        console.error("Lovable AI error:", aiResponse.status, await aiResponse.text());
        throw new Error("Error al consultar Lovable AI");
      }

      const aiData = await aiResponse.json();
      response = aiData.choices[0].message.content;
    } else {
      // Fallback: rule-based response
      response = generateRuleBasedResponse(question, {
        system,
        itrA,
        itrB,
        itrACompleted,
        itrBCompleted,
        itrBPending,
        punchCategoryA,
        preservationTasks,
      });
    }

    // Save insight
    await supabase.from("ai_insights").insert({
      project_id: projectId,
      system_id: systemId,
      subsystem_id: subsystemId || null,
      title: question.substring(0, 100),
      content: response,
    });

    return new Response(JSON.stringify({ response, context }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-query function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function generateRuleBasedResponse(question: string, data: any): string {
  const { itrACompleted, itrA, itrBCompleted, itrB, punchCategoryA, preservationTasks } = data;

  let response = "**[Modo sin IA externa - Respuesta basada en datos estructurados]**\n\n";

  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes("energización") || lowerQuestion.includes("listo")) {
    if (punchCategoryA.length > 0) {
      response += `⚠️ El sistema NO está listo para energización:\n`;
      response += `- Hay ${punchCategoryA.length} punch items categoría A pendientes\n`;
    }
    if (itrBCompleted < itrB.length) {
      response += `- Faltan ${itrB.length - itrBCompleted} ITR B por completar\n`;
    }
    if (punchCategoryA.length === 0 && itrBCompleted === itrB.length) {
      response += `✅ El sistema cumple requisitos básicos para energización (todos los ITR B completados y sin punch A)\n`;
    }
  } else if (lowerQuestion.includes("itr")) {
    response += `📊 Estado de ITRs:\n`;
    response += `- ITR A: ${itrACompleted}/${itrA.length} completados (${Math.round((itrACompleted / itrA.length) * 100)}%)\n`;
    response += `- ITR B: ${itrBCompleted}/${itrB.length} completados (${Math.round((itrBCompleted / itrB.length) * 100)}%)\n`;
  } else if (lowerQuestion.includes("punch")) {
    response += `📋 Punch items críticos:\n`;
    if (punchCategoryA.length > 0) {
      response += `- ${punchCategoryA.length} punch categoría A abiertos que requieren atención inmediata\n`;
    } else {
      response += `- No hay punch categoría A abiertos\n`;
    }
  } else if (lowerQuestion.includes("preserv")) {
    response += `🔧 Preservación:\n`;
    if (preservationTasks && preservationTasks.length > 0) {
      response += `- ${preservationTasks.length} tareas de preservación vencidas que requieren atención\n`;
    } else {
      response += `- No hay tareas de preservación vencidas\n`;
    }
  } else {
    response += `Resumen general del sistema:\n`;
    response += `- ITR A: ${Math.round((itrACompleted / itrA.length) * 100)}% completado\n`;
    response += `- ITR B: ${Math.round((itrBCompleted / itrB.length) * 100)}% completado\n`;
    response += `- Punch A abiertos: ${punchCategoryA.length}\n`;
    response += `- Preservaciones vencidas: ${preservationTasks?.length || 0}\n`;
  }

  return response;
}
