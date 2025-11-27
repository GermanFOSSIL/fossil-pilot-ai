import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Layers, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";

interface System {
  id: string;
  code: string;
  name: string;
  status: string;
  criticality: string;
  description: string | null;
  project_id: string;
  projects: {
    name: string;
    code: string;
  };
}

export default function Systems() {
  const [systems, setSystems] = useState<System[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSystems();
  }, []);

  const loadSystems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("systems")
        .select(`
          id,
          code,
          name,
          status,
          criticality,
          description,
          project_id,
          projects (
            name,
            code
          )
        `)
        .order("code");

      if (error) throw error;
      setSystems(data || []);
    } catch (error: any) {
      console.error("Error loading systems:", error);
      toast.error("Error al cargar los sistemas");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Explora todos los sistemas del proyecto y accede a sus dashboards detallados.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systems.map((system) => (
          <Card key={system.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{system.code}</CardTitle>
                </div>
                <StatusBadge status={system.status} />
              </div>
              <CardDescription className="line-clamp-2">
                {system.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {system.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {system.description}
                </p>
              )}
              
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Proyecto:</span> {system.projects.code}
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate(`/system/${system.id}`)}
                  className="gap-2"
                >
                  Ver Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {systems.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Layers className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No se encontraron sistemas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
