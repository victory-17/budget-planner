
import { TopNavigation } from "@/components/layout/top-navigation";

const Settings = () => {
  return (
    <div>
      <TopNavigation 
        title="Settings" 
        subtitle="Customize your Budget Planner experience" 
      />
      
      <div className="container px-6 py-8 mx-auto">
        <div className="grid place-items-center h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Settings Page</h2>
            <p className="text-muted-foreground">
              This page will allow you to configure your Budget Planner settings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
