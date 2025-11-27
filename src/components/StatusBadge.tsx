import { Badge } from "@/components/ui/badge";

type SystemStatus = "NOT_STARTED" | "IN_PROGRESS" | "READY_FOR_ENERGIZATION" | "ENERGIZED";
type ItrStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
type PunchStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";
type Criticality = "LOW" | "MEDIUM" | "HIGH";

interface StatusBadgeProps {
  status: SystemStatus | ItrStatus | PunchStatus | string;
  type?: "system" | "itr" | "punch" | "criticality";
}

export const StatusBadge = ({ status, type = "system" }: StatusBadgeProps) => {
  const getStatusConfig = () => {
    if (type === "system") {
      switch (status) {
        case "NOT_STARTED":
          return { label: "No iniciado", className: "bg-status-not-started" };
        case "IN_PROGRESS":
          return { label: "En progreso", className: "bg-status-in-progress" };
        case "READY_FOR_ENERGIZATION":
          return { label: "Listo para energización", className: "bg-success" };
        case "ENERGIZED":
          return { label: "Energizado", className: "bg-success" };
      }
    }

    if (type === "itr") {
      switch (status) {
        case "NOT_STARTED":
          return { label: "No iniciado", className: "bg-status-not-started" };
        case "IN_PROGRESS":
          return { label: "En progreso", className: "bg-status-in-progress" };
        case "COMPLETED":
          return { label: "Completado", className: "bg-status-completed" };
        case "REJECTED":
          return { label: "Rechazado", className: "bg-status-rejected" };
      }
    }

    if (type === "punch") {
      switch (status) {
        case "OPEN":
          return { label: "Abierto", className: "bg-destructive" };
        case "IN_PROGRESS":
          return { label: "En progreso", className: "bg-warning" };
        case "CLOSED":
          return { label: "Cerrado", className: "bg-success" };
      }
    }

    if (type === "criticality") {
      switch (status) {
        case "LOW":
          return { label: "Baja", className: "bg-muted" };
        case "MEDIUM":
          return { label: "Media", className: "bg-warning" };
        case "HIGH":
          return { label: "Alta", className: "bg-destructive" };
      }
    }

    return null;
  };

  const config = getStatusConfig();

  if (!config) {
    return <Badge>{status}</Badge>;
  }

  return (
    <Badge className={`${config.className} text-white`}>
      {config.label}
    </Badge>
  );
};
