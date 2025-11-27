import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Subsystem = Tables<"subsystems">;
type System = Tables<"systems">;

export default function SubsystemsAdmin() {
  const [subsystems, setSubsystems] = useState<Subsystem[]>([]);
  const [systems, setSystems] = useState<System[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubsystem, setEditingSubsystem] = useState<Subsystem | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    description: string;
    system_id: string;
    status: "NOT_STARTED" | "IN_PROGRESS" | "READY_FOR_ENERGIZATION" | "ENERGIZED";
  }>({
    name: "",
    code: "",
    description: "",
    system_id: "",
    status: "NOT_STARTED",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: subsystemsData } = await supabase.from("subsystems").select("*").order("code");
    const { data: systemsData } = await supabase.from("systems").select("*").order("code");
    setSubsystems(subsystemsData || []);
    setSystems(systemsData || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSubsystem) {
        await supabase.from("subsystems").update(formData).eq("id", editingSubsystem.id);
        toast({ title: "Subsistema actualizado" });
      } else {
        await supabase.from("subsystems").insert(formData);
        toast({ title: "Subsistema creado" });
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (subsystem: Subsystem) => {
    setEditingSubsystem(subsystem);
    setFormData({
      name: subsystem.name,
      code: subsystem.code,
      description: subsystem.description || "",
      system_id: subsystem.system_id,
      status: subsystem.status || "NOT_STARTED",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este subsistema?")) return;
    try {
      await supabase.from("subsystems").delete().eq("id", id);
      toast({ title: "Subsistema eliminado" });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingSubsystem(null);
    setFormData({ name: "", code: "", description: "", system_id: "", status: "NOT_STARTED" });
  };

  const getSystemName = (systemId: string) => {
    return systems.find((s) => s.id === systemId)?.code || "";
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Administración de Subsistemas</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Nuevo Subsistema</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingSubsystem ? "Editar" : "Nuevo"} Subsistema</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Sistema</Label>
                    <Select value={formData.system_id} onValueChange={(v) => setFormData({ ...formData, system_id: v })} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar sistema" />
                      </SelectTrigger>
                      <SelectContent>
                        {systems.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.code} - {s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Código</Label>
                    <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Nombre</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Select value={formData.status} onValueChange={(v: any) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NOT_STARTED">NOT_STARTED</SelectItem>
                        <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
                        <SelectItem value="READY_FOR_ENERGIZATION">READY_FOR_ENERGIZATION</SelectItem>
                        <SelectItem value="ENERGIZED">ENERGIZED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Guardar</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sistema</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subsystems.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono">{getSystemName(s.system_id)}</TableCell>
                  <TableCell className="font-mono">{s.code}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.status}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(s)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(s.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
