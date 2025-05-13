import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface SummaryCardProps {
  title: string;
  subtitle?: string;
  amount: number;
  icon: React.ReactNode;
  iconBgColor?: string;
  bgColor?: string;
  className?: string;
}

export function SummaryCard({ 
  title, 
  subtitle, 
  amount, 
  icon, 
  iconBgColor,
  bgColor,
  className
}: SummaryCardProps) {
  return (
    <Card className={cn("border-[#E0E0E0] shadow-sm", className)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{title}</h3>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
            <div className="font-bold text-lg mt-2">${amount.toFixed(2)}</div>
          </div>
          <div className={cn("p-2 rounded-md", iconBgColor || bgColor || "bg-[#4E60FF]")}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
