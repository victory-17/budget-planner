
import { TopNavigation } from "@/components/layout/top-navigation";

const Dashboard = () => {
  return (
    <div>
      <TopNavigation 
        title="Dashboard" 
        subtitle="Your financial overview at a glance" 
      />
      
      <div className="container px-6 py-8 mx-auto">
        <div className="grid place-items-center h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome to Budget Planner</h2>
            <p className="text-muted-foreground mb-4">
              Your personal finance dashboard is being set up
            </p>
            <p className="text-muted-foreground">
              Visit the Budgets page to see your detailed budget planning
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
