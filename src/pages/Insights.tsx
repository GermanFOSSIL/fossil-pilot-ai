import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const Insights = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    const { data } = await supabase
      .from("ai_insights")
      .select("*, project:projects(code, name), system:systems(code, name)")
      .order("created_at", { ascending: false });

    setInsights(data || []);
    setLoading(false);
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Historial de Insights
          </h1>
          <p className="text-muted-foreground">Análisis generados por el copiloto IA</p>
        </div>

        <Card className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Proyecto</TableHead>
                <TableHead>Sistema</TableHead>
                <TableHead>Pregunta/Título</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insights.map((insight) => (
                <TableRow key={insight.id}>
                  <TableCell className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(insight.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                  </TableCell>
                  <TableCell className="text-sm">
                    {insight.project?.code}
                  </TableCell>
                  <TableCell className="text-sm">
                    {insight.system?.code}
                  </TableCell>
                  <TableCell className="font-medium max-w-md truncate">
                    {insight.title}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Ver Detalle
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{insight.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Proyecto:</span> {insight.project?.name}
                            </div>
                            <div>
                              <span className="font-medium">Sistema:</span> {insight.system?.name}
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium">Fecha:</span>{" "}
                              {format(new Date(insight.created_at), "dd MMMM yyyy, HH:mm", { locale: es })}
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <h3 className="font-semibold mb-2">Análisis:</h3>
                            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                              {insight.content}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {insights.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay insights generados aún</p>
              <p className="text-sm">Usa el Copiloto IA para generar análisis</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Insights;
