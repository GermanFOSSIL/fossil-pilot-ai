import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, FileText, BarChart3 } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [systems, setSystems] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedSystem, setSelectedSystem] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) {
        navigate("/auth");
      } else {
        loadData();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadData = async () => {
    const { data: projectsData } = await supabase.from("projects").select("*").order("code");
    setProjects(projectsData || []);
    
    if (projectsData && projectsData.length > 0) {
      setSelectedProject(projectsData[0].id);
      const { data: systemsData } = await supabase
        .from("systems")
        .select("*")
        .eq("project_id", projectsData[0].id)
        .order("code");
      setSystems(systemsData || []);
      if (systemsData && systemsData.length > 0) {
        setSelectedSystem(systemsData[0].id);
      }
    }
  };

  useEffect(() => {
    if (selectedProject) {
      const loadSystems = async () => {
        const { data } = await supabase
          .from("systems")
          .select("*")
          .eq("project_id", selectedProject)
          .order("code");
        setSystems(data || []);
        if (data && data.length > 0) {
          setSelectedSystem(data[0].id);
        }
      };
      loadSystems();
    }
  }, [selectedProject]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentSystem = systems.find((s) => s.id === selectedSystem);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">FOSSIL Completions AI Pilot</h1>
          <p className="text-muted-foreground mt-2">Capa de inteligencia para Systems Completions e ITRs</p>
        </div>
        <div className="flex gap-2">
          <Link to="/copilot">
            <Button variant="outline">
              <Sparkles className="mr-2 h-4 w-4" />
              Copiloto IA
            </Button>
          </Link>
          <Link to="/insights">
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Insights
            </Button>
          </Link>
          <Button onClick={handleSignOut} variant="outline">
            Cerrar Sesión
          </Button>
        </div>
      </div>

        <Card className="p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
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
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard
            title="ITR A Completado"
            value="78%"
            badge={{ text: "En progreso", variant: "outline" }}
          />
          <KpiCard
            title="ITR B Completado"
            value="52%"
            badge={{ text: "Precomisionado", variant: "outline" }}
          />
          <KpiCard
            title="Punch Abiertos"
            value="7"
            subtitle="5 A / 4 B / 3 C"
            badge={{ text: "Críticos", variant: "destructive" }}
          />
          <KpiCard
            title="Preservación Vencida"
            value="2"
            badge={{ text: "Requiere atención", variant: "destructive" }}
          />
        </div>

      {currentSystem && (
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {currentSystem.code} – {currentSystem.name}
              </h2>
              <div className="flex gap-2">
                <StatusBadge status={currentSystem.status} type="system" />
                <StatusBadge status={currentSystem.criticality} type="criticality" />
              </div>
            </div>
            <Link to={`/systems/${selectedSystem}`}>
              <Button>
                <BarChart3 className="mr-2 h-4 w-4" />
                Ver Dashboard Completo
              </Button>
            </Link>
          </div>
          <p className="text-muted-foreground">{currentSystem.description}</p>
        </Card>
      )}
    </div>
  );
};

export default Index;
