import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) {
        navigate("/auth");
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">FOSSIL Completions AI Pilot</h1>
            <p className="text-muted-foreground mt-2">Capa de inteligencia para Systems Completions e ITRs</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Cerrar Sesión
          </Button>
        </div>

        <Card className="p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Proyecto</label>
              <Select defaultValue="EPF-LACA32">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EPF-LACA32">EPF Bajada de Añelo – LACA32</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sistema</label>
              <Select defaultValue="101P_02C">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar sistema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="101P_02C">101P_02C – Oil Processing Train</SelectItem>
                  <SelectItem value="101EL_02E">101EL_02E – Power Distribution</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">ITR A Completado</h3>
            <p className="text-3xl font-bold text-primary">78%</p>
            <Badge className="mt-2" variant="outline">En progreso</Badge>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">ITR B Completado</h3>
            <p className="text-3xl font-bold text-secondary">52%</p>
            <Badge className="mt-2" variant="outline">En progreso</Badge>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Punch Abiertos</h3>
            <p className="text-3xl font-bold text-warning">7</p>
            <p className="text-sm text-muted-foreground mt-1">5 A / 4 B / 3 C</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Preservación Vencida</h3>
            <p className="text-3xl font-bold text-destructive">2</p>
            <Badge className="mt-2" variant="destructive">Requiere atención</Badge>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Estado del Sistema: 101P_02C – Oil Processing Train</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-semibold">101P_02C-01 – Desalinador System</p>
                <p className="text-sm text-muted-foreground">68% completado</p>
              </div>
              <Badge>En progreso</Badge>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-semibold">101P_02C-02 – Stabilizer System</p>
                <p className="text-sm text-muted-foreground">95% completado</p>
              </div>
              <Badge>En progreso</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
