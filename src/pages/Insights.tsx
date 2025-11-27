import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Loader2 } from "lucide-react";
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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
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
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Proyecto</h3>
                          <p className="text-sm">{insight.project?.code} - {insight.project?.name}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Sistema</h3>
                          <p className="text-sm">{insight.system?.code} - {insight.system?.name}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">Análisis</h3>
                          <div className="prose prose-sm max-w-none whitespace-pre-wrap bg-muted/50 p-4 rounded-md">
                            {insight.content}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Generado el {format(new Date(insight.created_at), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
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
          <div className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No hay insights generados todavía
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Insights;
