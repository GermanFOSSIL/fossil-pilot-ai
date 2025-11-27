import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";

export default function DataManagement() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("code");
      if (error) throw error;
      return data;
    },
  });

  const { data: itrs } = useQuery({
    queryKey: ["itrs", selectedProject],
    queryFn: async () => {
      if (!selectedProject) return [];
      const { data, error } = await supabase
        .from("itrs")
        .select(`
          *,
          subsystem:subsystems(
            code,
            name,
            system:systems(project_id)
          )
        `)
        .order("itr_code");
      
      if (error) throw error;
      return data.filter((itr: any) => itr.subsystem?.system?.project_id === selectedProject);
    },
    enabled: !!selectedProject,
  });

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkEdit = () => {
    if (selectedIds.length === 0) {
      toast.error("Selecciona al menos un registro");
      return;
    }
    toast.info(`Editando ${selectedIds.length} registros...`);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error("Selecciona al menos un registro");
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar ${selectedIds.length} registros?`)) {
      return;
    }

    try {
      const { error } = await supabase.from("itrs").delete().in("id", selectedIds);
      
      if (error) throw error;
      
      toast.success(`${selectedIds.length} registros eliminados`);
      setSelectedIds([]);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar registros");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Datos</h1>
          <p className="text-muted-foreground">
            Edición masiva, validación y eliminación de datos importados
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-64">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.code} - {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="itrs" className="w-full">
          <TabsList>
            <TabsTrigger value="itrs">ITRs</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="punch">Punch Items</TabsTrigger>
            <TabsTrigger value="preservation">Preservation</TabsTrigger>
          </TabsList>

          <TabsContent value="itrs">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>ITRs</CardTitle>
                    <CardDescription>
                      {selectedIds.length > 0
                        ? `${selectedIds.length} registros seleccionados`
                        : "Ningún registro seleccionado"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleBulkEdit}
                      disabled={selectedIds.length === 0}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Seleccionados
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleBulkDelete}
                      disabled={selectedIds.length === 0}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar Seleccionados
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedProject ? (
                  <p className="text-center text-muted-foreground py-8">
                    Selecciona un proyecto para ver los ITRs
                  </p>
                ) : itrs && itrs.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={itrs.length > 0 && selectedIds.length === itrs.length}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedIds(itrs.map((itr: any) => itr.id));
                              } else {
                                setSelectedIds([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Disciplina</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Subsistema</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itrs.map((itr: any) => (
                        <TableRow key={itr.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.includes(itr.id)}
                              onCheckedChange={() => toggleSelection(itr.id)}
                            />
                          </TableCell>
                          <TableCell>{itr.itr_code}</TableCell>
                          <TableCell>{itr.itr_type}</TableCell>
                          <TableCell>{itr.discipline}</TableCell>
                          <TableCell>{itr.status}</TableCell>
                          <TableCell>
                            {itr.subsystem?.code} - {itr.subsystem?.name}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No hay ITRs para este proyecto
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Similar content for other tabs */}
          <TabsContent value="tags">
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>Gestión de tags del proyecto</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Funcionalidad en desarrollo
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="punch">
            <Card>
              <CardHeader>
                <CardTitle>Punch Items</CardTitle>
                <CardDescription>Gestión de punch items</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Funcionalidad en desarrollo
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preservation">
            <Card>
              <CardHeader>
                <CardTitle>Preservation Tasks</CardTitle>
                <CardDescription>Gestión de tareas de preservación</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Funcionalidad en desarrollo
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}