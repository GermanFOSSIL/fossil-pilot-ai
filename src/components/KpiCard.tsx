import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  icon?: LucideIcon;
  className?: string;
}

export const KpiCard = ({ title, value, subtitle, badge, icon: Icon, className }: KpiCardProps) => {
  return (
    <Card className={`p-6 ${className || ""}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
      </div>
      <p className="text-3xl font-bold mb-2">{value}</p>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      {badge && (
        <Badge className="mt-2" variant={badge.variant || "outline"}>
          {badge.text}
        </Badge>
      )}
    </Card>
  );
};
