import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  iconBgColor?: string;
  className?: string;
  subtitle?: string;
}

export function SummaryCard({ 
  title, 
  amount, 
  icon, 
  iconBgColor, 
  className, 
  subtitle = "Budget" 
}: SummaryCardProps) {
  return (
    <Card className={cn("overflow-hidden rounded-xl border-[#E0E0E0] shadow-sm", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-[#212B36]">{title}</h3>
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", 
            iconBgColor || "bg-primary/10")}>
            {icon}
          </div>
        </div>
        
        <div>
          <p className="text-2xl font-bold text-[#212B36]">
            ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-[#637381] mt-1">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}
