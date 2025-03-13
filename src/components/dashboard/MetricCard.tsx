
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

type TrendDirection = "up" | "down" | "stable";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: {
    direction: TrendDirection;
    value?: string | number;
  };
}

export const MetricCard = ({ title, value, description, icon, trend }: MetricCardProps) => {
  const renderTrendIcon = (direction: TrendDirection) => {
    switch (direction) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case "stable":
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              {renderTrendIcon(trend.direction)}
              {trend.value && <span>{trend.value}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
