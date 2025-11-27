import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSystemKpis, SystemKpis } from "@/lib/kpis";
import { ArrowLeft, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(var(--status-completed))", "hsl(var(--status-in-progress))", "hsl(var(--status-not-started))", "hsl(var(--status-rejected))"];

const SystemDashboard = () => {
  const { systemId } = useParams();
  const navigate = useNavigate();
  const [system, setSystem] = useState<any>(null);
  const [kpis, setKpis] = useState<SystemKpis | null>(null);
  const [subsystems, setSubsystems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [systemId]);

  const loadData = async () => {
    if (!systemId) return;

    const { data: systemData } = await supabase
      .from("systems")
      .select("*, project:projects(*)")
      .eq("id", systemId)
      .single();

    setSystem(systemData);

    const kpisData = await getSystemKpis(systemId);
    setKpis(kpisData);

    const { data: subsystemsData } = await supabase
      .from("subsystems")
      .select("*")
      .eq("system_id", systemId)
      .order("code");

    setSubsystems(subsystemsData || []);
    setLoading(false);
  };

  if (loading || !system || !kpis) {
    return <div className="p-6">Cargando...</div>;
  }

  const itrAData = [
    { name: "Completado", value: kpis.completedItrA },
    { name: "Pendiente", value: kpis.totalItrA - kpis.completedItrA },
  ];

  const itrBData = [
    { name: "Completado", value: kpis.completedItrB },
    { name: "Pendiente", value: kpis.totalItrB - kpis.completedItrB },
  ];

  const punchData = [
    { name: "A", value: kpis.punchOpenByCategory.A },
    { name: "B", value: kpis.punchOpenByCategory.B },
    { name: "C", value: kpis.punchOpenByCategory.C },
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {system.project.code} – {system.code}
          </h1>
          <p className="text-xl text-muted-foreground mb-4">{system.name}</p>
          <div className="flex gap-2">
            <StatusBadge status={system.status} type="system" />
            <StatusBadge status={system.criticality} type="criticality" />
            {kpis.hasCriticalPunch && (
              <StatusBadge status="REJECTED" type="itr" />
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard
            title="ITR A Completado"
            value={`${kpis.percentItrACompleted}%`}
            subtitle={`${kpis.completedItrA} de ${kpis.totalItrA}`}
            icon={CheckCircle}
            badge={{ text: "Construcción", variant: "outline" }}
          />
          <KpiCard
            title="ITR B Completado"
            value={`${kpis.percentItrBCompleted}%`}
            subtitle={`${kpis.completedItrB} de ${kpis.totalItrB}`}
            icon={Clock}
            badge={{ text: "Precomisionado", variant: "outline" }}
          />
          <KpiCard
            title="Punch Abiertos"
            value={kpis.punchOpenByCategory.A + kpis.punchOpenByCategory.B + kpis.punchOpenByCategory.C}
            subtitle={`${kpis.punchOpenByCategory.A} A / ${kpis.punchOpenByCategory.B} B / ${kpis.punchOpenByCategory.C} C`}
            icon={AlertTriangle}
            badge={
              kpis.hasCriticalPunch
                ? { text: "Críticos pendientes", variant: "destructive" }
                : { text: "En control", variant: "outline" }
            }
          />
          <KpiCard
            title="Preservación Vencida"
            value={kpis.preservationOverdueCount}
            subtitle={`${kpis.preservationUpcomingCount} próximas (7 días)`}
            icon={AlertTriangle}
            badge={
              kpis.preservationOverdueCount > 0
                ? { text: "Requiere atención", variant: "destructive" }
                : { text: "Al día", variant: "outline" }
            }
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Estado de ITR A</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={itrAData} cx="50%" cy="50%" labelLine={false} label outerRadius={80} fill="hsl(var(--primary))" dataKey="value">
                  {itrAData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Estado de ITR B</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={itrBData} cx="50%" cy="50%" labelLine={false} label outerRadius={80} fill="hsl(var(--secondary))" dataKey="value">
                  {itrBData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Punch por Categoría</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={punchData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="hsl(var(--warning))" name="Punch Abiertos" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Subsistemas</h2>
          <div className="space-y-4">
            {subsystems.map((subsystem) => (
              <Link
                key={subsystem.id}
                to={`/systems/${systemId}/subsystems/${subsystem.id}`}
                className="block p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{subsystem.code}</p>
                    <p className="text-sm text-muted-foreground">{subsystem.name}</p>
                  </div>
                  <StatusBadge status={subsystem.status} type="system" />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <ProgressBar label="ITR A" value={75} />
                  <ProgressBar label="ITR B" value={50} />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SystemDashboard;
