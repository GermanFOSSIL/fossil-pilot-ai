import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Copilot = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [systems, setSystems] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedSystem, setSelectedSystem] = useState("");
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadSystems(selectedProject);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    const { data } = await supabase.from("projects").select("*").order("code");
    setProjects(data || []);
    if (data && data.length > 0) {
      setSelectedProject(data[0].id);
    }
  };

  const loadSystems = async (projectId: string) => {
    const { data } = await supabase.from("systems").select("*").eq("project_id", projectId).order("code");
    setSystems(data || []);
    if (data && data.length > 0) {
      setSelectedSystem(data[0].id);
    }
  };

  const quickQuestions = [
    "¿Qué falta para que este sistema esté listo para energización?",
    "Mostrame un resumen de ITR B pendientes por disciplina",
    "¿Cuáles son los punch críticos A que bloquean el handover?",
    "¿Hay preservaciones vencidas que requieran atención inmediata?",
  ];

  const handleAskQuestion = async (q: string = question) => {
    if (!q.trim() || !selectedSystem) {
      toast({ title: "Error", description: "Ingresa una pregunta y selecciona un sistema", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResponse("");
    setContext("");

    try {
      const { data, error } = await supabase.functions.invoke("ai-query", {
        body: {
          question: q,
          projectId: selectedProject,
          systemId: selectedSystem,
        },
      });

      if (error) throw error;

      setResponse(data.response);
      setContext(data.context);
      toast({ title: "Respuesta generada", description: "El copiloto ha analizado los datos" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-accent" />
            Copiloto IA
          </h1>
          <p className="text-muted-foreground">Analiza sistemas, ITRs y punch lists con inteligencia artificial</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium mb-2">Proyecto</label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar proyecto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sistema</label>
            <Select value={selectedSystem} onValueChange={setSelectedSystem}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar sistema" />
              </SelectTrigger>
              <SelectContent>
                {systems.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Preguntas rápidas</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {quickQuestions.map((q, idx) => (
              <Button key={idx} variant="outline" onClick={() => handleAskQuestion(q)} disabled={loading} className="justify-start text-left h-auto py-3">
                {q}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Tu pregunta</h2>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ej: ¿Cuál es el estado general del sistema? ¿Qué falta para completar el precomisionado?"
            className="min-h-[100px] mb-4"
            disabled={loading}
          />
          <Button onClick={() => handleAskQuestion()} disabled={loading || !question.trim()}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Generar Respuesta
              </>
            )}
          </Button>
        </Card>

        {response && (
          <Card className="p-6 mb-6 bg-accent/5 border-accent/20">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              Respuesta del Copiloto
            </h2>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">{response}</div>
          </Card>
        )}

        {context && (
          <Card className="p-6 bg-muted/30">
            <h2 className="text-sm font-semibold mb-2 text-muted-foreground">Datos utilizados para el análisis</h2>
            <pre className="text-xs text-muted-foreground overflow-auto">{context}</pre>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Copilot;
