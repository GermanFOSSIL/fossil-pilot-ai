import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Upload, Download, Database, Settings } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function DataImport() {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedSystem, setSelectedSystem] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("code");
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
        toast.error("Solo se permiten archivos CSV o Excel");
        return;
      }
      setSelectedFile(file);
      toast.success(`Archivo seleccionado: ${file.name}`);
    }
  };

  const handleUpload = async (entityType: string) => {
    if (!selectedFile) {
      toast.error("Por favor selecciona un archivo");
      return;
    }
    if (!selectedProject) {
      toast.error("Por favor selecciona un proyecto");
      return;
    }

    setIsUploading(true);
    try {
      // Create FormData to send file
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('entity_type', entityType);
      formData.append('project_id', selectedProject);
      if (selectedSystem) formData.append('system_id', selectedSystem);

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al procesar el archivo');
      }

      toast.success(`Importación completada: ${result.records_success} registros exitosos, ${result.records_failed} fallidos`);
      setSelectedFile(null);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al importar datos');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = (entityType: string) => {
    // Mock template download
    toast.info(`Descargando plantilla para ${entityType}...`);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground">
          Carga masiva de datos desde archivos Excel/CSV o integraciones API
        </p>
      </div>

      <Card>
          <CardHeader>
            <CardTitle>Contexto de Importación</CardTitle>
            <CardDescription>Selecciona el proyecto y sistema destino</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Proyecto</Label>
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

              <div>
                <Label>Sistema (opcional)</Label>
                <Select value={selectedSystem} onValueChange={setSelectedSystem} disabled={!selectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sistema" />
                  </SelectTrigger>
                  <SelectContent>
                    {systems?.map((system) => (
                      <SelectItem key={system.id} value={system.id}>
                        {system.code} - {system.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              Carga Manual
            </TabsTrigger>
            <TabsTrigger value="api">
              <Database className="w-4 h-4 mr-2" />
              Integración API
            </TabsTrigger>
            <TabsTrigger value="external">
              <Settings className="w-4 h-4 mr-2" />
              Sistemas Externos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {/* ... content continues ... */}
            <Card>
              <CardHeader>
                <CardTitle>Carga de Archivos Excel/CSV</CardTitle>
                <CardDescription>Sube archivos con datos de ITRs, Tags, Punch Items, etc.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="file">Seleccionar archivo</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleFileSelect}
                    disabled={!selectedProject}
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Archivo seleccionado: {selectedFile.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="cursor-pointer hover:bg-accent" onClick={() => handleUpload('itrs')}>
                    <CardHeader>
                      <CardTitle className="text-sm">ITRs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button disabled={!selectedFile || isUploading} className="w-full" size="sm">
                        Importar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadTemplate('itrs');
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Plantilla
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:bg-accent" onClick={() => handleUpload('tags')}>
                    <CardHeader>
                      <CardTitle className="text-sm">Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button disabled={!selectedFile || isUploading} className="w-full" size="sm">
                        Importar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadTemplate('tags');
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Plantilla
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:bg-accent" onClick={() => handleUpload('punch_items')}>
                    <CardHeader>
                      <CardTitle className="text-sm">Punch Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button disabled={!selectedFile || isUploading} className="w-full" size="sm">
                        Importar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadTemplate('punch_items');
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Plantilla
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:bg-accent" onClick={() => handleUpload('preservation')}>
                    <CardHeader>
                      <CardTitle className="text-sm">Preservation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button disabled={!selectedFile || isUploading} className="w-full" size="sm">
                        Importar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadTemplate('preservation');
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Plantilla
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>Documentación de API</CardTitle>
                <CardDescription>Endpoints REST para integración con sistemas externos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Endpoint Base</h3>
                  <code className="block p-2 bg-muted rounded">
                    {import.meta.env.VITE_SUPABASE_URL}/functions/v1/api-import
                  </code>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Autenticación</h3>
                  <p className="text-sm text-muted-foreground">
                    Incluir header: <code>Authorization: Bearer YOUR_API_KEY</code>
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Ejemplo: Importar ITRs</h3>
                  <pre className="p-4 bg-muted rounded text-sm overflow-x-auto">
{`POST /api-import
Content-Type: application/json

{
  "entity_type": "itrs",
  "project_id": "uuid",
  "data": [
    {
      "itr_code": "ITR-001",
      "discipline": "ELEC",
      "itr_type": "A",
      "status": "IN_PROGRESS"
    }
  ]
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="external">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Integración SAP</CardTitle>
                  <CardDescription>Sincronización automática con SAP PM/PS</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Estado: <span className="text-yellow-500">Simulación</span></p>
                      <p className="text-sm text-muted-foreground">Última sincronización: Nunca</p>
                    </div>
                    <Button onClick={() => toast.info("Simulando sincronización con SAP...")}>
                      Sincronizar Ahora
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integración GoTechnology®</CardTitle>
                  <CardDescription>Importar datos de completitud mecánica</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Estado: <span className="text-yellow-500">Simulación</span></p>
                      <p className="text-sm text-muted-foreground">Última sincronización: Nunca</p>
                    </div>
                    <Button onClick={() => toast.info("Simulando sincronización con GoTechnology...")}>
                      Sincronizar Ahora
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integración SharePoint</CardTitle>
                  <CardDescription>Sincronizar documentos y registros</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Estado: <span className="text-yellow-500">Simulación</span></p>
                      <p className="text-sm text-muted-foreground">Última sincronización: Nunca</p>
                    </div>
                    <Button onClick={() => toast.info("Simulando sincronización con SharePoint...")}>
                      Sincronizar Ahora
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
}