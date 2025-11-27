import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar = ({ value, label, showPercentage = true, className }: ProgressBarProps) => {
  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">{label}</span>
          {showPercentage && <span className="text-sm text-muted-foreground">{value}%</span>}
        </div>
      )}
      <Progress value={value} className="h-2" />
    </div>
  );
};
