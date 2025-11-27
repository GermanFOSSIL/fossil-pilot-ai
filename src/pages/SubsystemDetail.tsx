import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSubsystemKpis, SubsystemKpis } from "@/lib/kpis";
import { ArrowLeft, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const SubsystemDetail = () => {
  const { systemId, subsystemId } = useParams();
  const navigate = useNavigate();
  const [subsystem, setSubsystem] = useState<any>(null);
  const [kpis, setKpis] = useState<SubsystemKpis | null>(null);
  const [itrs, setItrs] = useState<any[]>([]);
  const [punchItems, setPunchItems] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [subsystemId]);

  const loadData = async () => {
    if (!subsystemId) return;

    const { data: subsystemData } = await supabase
      .from("subsystems")
      .select("*, system:systems(*, project:projects(*))")
      .eq("id", subsystemId)
      .single();

    setSubsystem(subsystemData);

    const kpisData = await getSubsystemKpis(subsystemId);
    setKpis(kpisData);

    const { data: itrsData } = await supabase
      .from("itrs")
      .select("*")
      .eq("subsystem_id", subsystemId)
      .order("itr_code");

    setItrs(itrsData || []);

    const { data: punchData } = await supabase
      .from("punch_items")
      .select("*")
      .eq("subsystem_id", subsystemId)
      .order("category", { ascending: true });

    setPunchItems(punchData || []);

    const { data: tagsData } = await supabase
      .from("tags")
      .select("*")
      .eq("subsystem_id", subsystemId)
      .order("tag_code");

    setTags(tagsData || []);
    setLoading(false);
  };

  if (loading || !subsystem || !kpis) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(`/systems/${systemId}`)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Sistema
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{subsystem.code}</h1>
          <p className="text-xl text-muted-foreground mb-4">{subsystem.name}</p>
          <div className="flex gap-2">
            <StatusBadge status={subsystem.status} type="system" />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <KpiCard
            title="ITR A Completado"
            value={`${kpis.percentItrACompleted}%`}
            subtitle={`${kpis.completedItrA} de ${kpis.totalItrA}`}
            icon={CheckCircle}
          />
          <KpiCard
            title="ITR B Completado"
            value={`${kpis.percentItrBCompleted}%`}
            subtitle={`${kpis.completedItrB} de ${kpis.totalItrB}`}
            icon={Clock}
          />
          <KpiCard
            title="Punch / Preservación"
            value={kpis.punchOpen}
            subtitle={`${kpis.preservationOverdueCount} preservaciones vencidas`}
            icon={AlertTriangle}
            badge={
              kpis.punchOpen > 0 || kpis.preservationOverdueCount > 0
                ? { text: "Requiere atención", variant: "destructive" }
                : { text: "Al día", variant: "outline" }
            }
          />
        </div>

        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">ITRs</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Comentarios</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itrs.map((itr) => (
                <TableRow key={itr.id}>
                  <TableCell className="font-medium">{itr.itr_code}</TableCell>
                  <TableCell>{itr.itr_type}</TableCell>
                  <TableCell>{itr.discipline}</TableCell>
                  <TableCell>
                    <StatusBadge status={itr.status} type="itr" />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{itr.comments || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Punch Items</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoría</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Vencimiento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {punchItems.map((punch) => (
                <TableRow key={punch.id}>
                  <TableCell>
                    <StatusBadge status={punch.category} type="criticality" />
                  </TableCell>
                  <TableCell>{punch.description}</TableCell>
                  <TableCell>
                    <StatusBadge status={punch.status} type="punch" />
                  </TableCell>
                  <TableCell className="text-sm">{punch.raised_by}</TableCell>
                  <TableCell className="text-sm">{punch.due_date || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Tags Asociados ({tags.length})</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Criticidad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">{tag.tag_code}</TableCell>
                  <TableCell>{tag.description}</TableCell>
                  <TableCell>{tag.discipline}</TableCell>
                  <TableCell className="text-sm">{tag.device_type}</TableCell>
                  <TableCell>
                    <StatusBadge status={tag.criticality} type="criticality" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default SubsystemDetail;
