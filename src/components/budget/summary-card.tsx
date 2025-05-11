
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  className?: string;
}

export function SummaryCard({ title, amount, icon, className }: SummaryCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{title}</h3>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
          </div>
        </div>
        
        <div>
          <p className="text-3xl font-bold">
            ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Budget</p>
        </div>
      </CardContent>
    </Card>
  );
}
