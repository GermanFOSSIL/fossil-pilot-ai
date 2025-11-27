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
  const [selectedSystem, setSelectedSystem] = useState<string>("");
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>("");

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*").order("code");
      if (error) throw error;
      return data;
    },
  });

  const { data: systems } = useQuery({
    queryKey: ["systems", selectedProject],
    queryFn: async () => {
      if (!selectedProject) return [];
      const { data, error } = await supabase
        .from("systems")
        .select("*")
        .eq("project_id", selectedProject)
        .order("code");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedProject,
  });

  const { data: subsystems } = useQuery({
    queryKey: ["subsystems", selectedSystem],
    queryFn: async () => {
      if (!selectedSystem) return [];
      const { data, error } = await supabase
        .from("subsystems")
        .select("*")
        .eq("system_id", selectedSystem)
        .order("code");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedSystem,
  });

  const { data: itrs } = useQuery({
    queryKey: ["itrs", selectedProject, selectedSystem, selectedSubsystem],
    queryFn: async () => {
      let query = supabase
        .from("itrs")
        .select(`
          *,
          subsystem:subsystems(
            id,
            code,
            name,
            system:systems(
              id,
              code,
              name,
              project_id
            )
          ),
          tag:tags(
            tag_code,
            description
          )
        `)
        .order("itr_code");
      
      const { data, error } = await query;
      if (error) throw error;
      
      // Filter based on hierarchy
      return data.filter((itr: any) => {
        if (!itr.subsystem?.system) return false;
        
        const matchesProject = !selectedProject || itr.subsystem.system.project_id === selectedProject;
        const matchesSystem = !selectedSystem || itr.subsystem.system.id === selectedSystem;
        const matchesSubsystem = !selectedSubsystem || itr.subsystem.id === selectedSubsystem;
        
        return matchesProject && matchesSystem && matchesSubsystem;
      });
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
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Edición masiva, validación y eliminación de datos importados
        </p>
      </div>

      <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Jerarquía: Proyecto → Sistema → Subsistema → Tag → ITR</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Proyecto</label>
                <Select 
                  value={selectedProject} 
                  onValueChange={(value) => {
                    setSelectedProject(value);
                    setSelectedSystem("");
                    setSelectedSubsystem("");
                    setSelectedIds([]);
                  }}
                >
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

              <div>
                <label className="text-sm font-medium mb-2 block">Sistema</label>
                <Select 
                  value={selectedSystem} 
                  onValueChange={(value) => {
                    setSelectedSystem(value);
                    setSelectedSubsystem("");
                    setSelectedIds([]);
                  }}
                  disabled={!selectedProject}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sistema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los sistemas</SelectItem>
                    {systems?.map((system) => (
                      <SelectItem key={system.id} value={system.id}>
                        {system.code} - {system.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Subsistema</label>
                <Select 
                  value={selectedSubsystem} 
                  onValueChange={(value) => {
                    setSelectedSubsystem(value);
                    setSelectedIds([]);
                  }}
                  disabled={!selectedSystem}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar subsistema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los subsistemas</SelectItem>
                    {subsystems?.map((subsystem) => (
                      <SelectItem key={subsystem.id} value={subsystem.id}>
                        {subsystem.code} - {subsystem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {itrs.length} ITRs
                    </div>
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
                        <TableHead>Código ITR</TableHead>
                        <TableHead>Tag</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Disciplina</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Sistema</TableHead>
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
                          <TableCell className="font-mono text-sm">{itr.itr_code}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {itr.tag?.tag_code || '-'}
                          </TableCell>
                          <TableCell>
                            <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                              {itr.itr_type}
                            </span>
                          </TableCell>
                          <TableCell>{itr.discipline}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              itr.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              itr.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              itr.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                            }`}>
                              {itr.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">
                            {itr.subsystem?.system?.code}
                          </TableCell>
                          <TableCell className="text-sm">
                            {itr.subsystem?.code}
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
                  </div>
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
  );
}