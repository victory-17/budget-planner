import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

// Define consistent colors
const COLORS = {
  groceries: "#00C896", // Vibrant green
  shopping: "#4E60FF", // Vibrant blue
  homeNeeds: "#FF8F00", // Vibrant amber/orange
  leisure: "#E91E63", // Vibrant pink
};

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

// TODO: Connect to backend endpoint: GET /api/charts/allocation?type=monthly

interface BudgetChartProps {
  className?: string;
}

export function BudgetChart({ className }: BudgetChartProps) {
  const [view, setView] = useState<"monthly" | "weekly">("monthly");
  const data = view === "monthly" ? monthlyData : weeklyData;

  const exportChartData = () => {
    console.log("Exporting chart data...");
    // TODO: Connect to backend endpoint: GET /api/charts/allocation-budget?period=monthly
  };

  return (
    <Card className={cn("rounded-xl border-[#E0E0E0] shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-[#212B36]">Allocation Budget</CardTitle>
        <div className="flex items-center gap-4">
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-none ${view === 'monthly' ? 'bg-[#4E60FF] text-white' : ''}`}
              onClick={() => setView("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`rounded-none ${view === 'weekly' ? 'bg-[#4E60FF] text-white' : ''}`}
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#637381' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#637381' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E0E0E0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                }} 
              />
              <Bar dataKey="groceries" stackId="a" fill={COLORS.groceries} radius={[4, 4, 0, 0]} />
              <Bar dataKey="shopping" stackId="a" fill={COLORS.shopping} radius={[4, 4, 0, 0]} />
              <Bar dataKey="homeNeeds" stackId="a" fill={COLORS.homeNeeds} radius={[4, 4, 0, 0]} />
              <Bar dataKey="leisure" stackId="a" fill={COLORS.leisure} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.groceries }}></div>
            <span className="text-sm text-[#637381]">Groceries</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.shopping }}></div>
            <span className="text-sm text-[#637381]">Shopping</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.homeNeeds }}></div>
            <span className="text-sm text-[#637381]">Home Needs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.leisure }}></div>
            <span className="text-sm text-[#637381]">Leisure</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
