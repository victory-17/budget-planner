
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// Mock data for the charts
const monthlyData = [
  { name: "Jan", groceries: 250, shopping: 150, homeNeeds: 100, leisure: 200 },
  { name: "Feb", groceries: 300, shopping: 100, homeNeeds: 150, leisure: 180 },
  { name: "Mar", groceries: 280, shopping: 200, homeNeeds: 120, leisure: 220 },
  { name: "Apr", groceries: 340, shopping: 180, homeNeeds: 160, leisure: 190 },
  { name: "May", groceries: 390, shopping: 220, homeNeeds: 140, leisure: 240 },
  { name: "Jun", groceries: 320, shopping: 250, homeNeeds: 180, leisure: 210 },
  { name: "Jul", groceries: 360, shopping: 190, homeNeeds: 150, leisure: 230 },
  { name: "Aug", groceries: 400, shopping: 240, homeNeeds: 170, leisure: 250 },
  { name: "Sep", groceries: 380, shopping: 210, homeNeeds: 140, leisure: 220 },
  { name: "Oct", groceries: 410, shopping: 230, homeNeeds: 160, leisure: 240 },
];

const weeklyData = [
  { name: "Week 1", groceries: 90, shopping: 60, homeNeeds: 40, leisure: 70 },
  { name: "Week 2", groceries: 75, shopping: 50, homeNeeds: 35, leisure: 65 },
  { name: "Week 3", groceries: 85, shopping: 55, homeNeeds: 45, leisure: 60 },
  { name: "Week 4", groceries: 95, shopping: 65, homeNeeds: 50, leisure: 75 },
];

interface BudgetChartProps {
  className?: string;
}

export function BudgetChart({ className }: BudgetChartProps) {
  const [view, setView] = useState<"monthly" | "weekly">("monthly");
  const data = view === "monthly" ? monthlyData : weeklyData;

  const exportChartData = () => {
    console.log("Exporting chart data...");
    // Placeholder: Connect to GET /api/charts/allocation-budget?period=${view}
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Allocation Budget</CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-none ${view === 'monthly' ? 'bg-primary text-primary-foreground' : ''}`}
              onClick={() => setView("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-none ${view === 'weekly' ? 'bg-primary text-primary-foreground' : ''}`}
              onClick={() => setView("weekly")}
            >
              Weekly
            </Button>
          </div>
          <Button variant="outline" size="icon" onClick={exportChartData}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="groceries" stackId="a" fill="#4CAF50" />
              <Bar dataKey="shopping" stackId="a" fill="#2196F3" />
              <Bar dataKey="homeNeeds" stackId="a" fill="#FFC107" />
              <Bar dataKey="leisure" stackId="a" fill="#9C27B0" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-budget-green"></div>
            <span className="text-sm">Groceries</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-budget-blue"></div>
            <span className="text-sm">Shopping</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-budget-yellow"></div>
            <span className="text-sm">Home Needs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-budget-purple"></div>
            <span className="text-sm">Leisure</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
