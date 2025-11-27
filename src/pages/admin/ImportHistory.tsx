import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";

export default function ImportHistory() {
  const { data: imports, isLoading } = useQuery({
    queryKey: ["import_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("import_logs")
        .select(`
          *,
          project:projects(code, name)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "processing":
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      failed: "destructive",
      processing: "secondary",
      pending: "outline",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status === "completed" && "Completado"}
        {status === "failed" && "Fallido"}
        {status === "processing" && "Procesando"}
        {status === "pending" && "Pendiente"}
      </Badge>
    );
  };

  if (isLoading) {
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
          Registro completo de todas las importaciones de datos
        </p>
      </div>

      <Card>
          <CardHeader>
            <CardTitle>Importaciones Recientes</CardTitle>
            <CardDescription>
              Vista detallada de importaciones con registros procesados, exitosos y fallidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Cargando...</p>
            ) : imports && imports.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Entidad</TableHead>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Procesados</TableHead>
                    <TableHead>Exitosos</TableHead>
                    <TableHead>Fallidos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {imports.map((importLog: any) => (
                    <TableRow key={importLog.id}>
                      <TableCell>
                        {format(new Date(importLog.created_at), "dd/MM/yyyy HH:mm", {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {importLog.import_type === "csv" && "CSV"}
                          {importLog.import_type === "excel" && "Excel"}
                          {importLog.import_type === "api" && "API"}
                          {importLog.import_type === "sap" && "SAP"}
                          {importLog.import_type === "gotechnology" && "GoTech"}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{importLog.entity_type}</TableCell>
                      <TableCell>
                        {importLog.project ? (
                          <div>
                            <p className="font-medium">{importLog.project.code}</p>
                            <p className="text-sm text-muted-foreground">
                              {importLog.project.name}
                            </p>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{importLog.file_name || "-"}</TableCell>
                      <TableCell>{importLog.records_processed}</TableCell>
                      <TableCell className="text-green-600">{importLog.records_success}</TableCell>
                      <TableCell className="text-red-600">{importLog.records_failed}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(importLog.status)}
                          {getStatusBadge(importLog.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No hay importaciones registradas
              </p>
            )}
          </CardContent>
        </Card>
    </div>
  );
}