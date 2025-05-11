
import { TopNavigation } from "@/components/layout/top-navigation";

const Help = () => {
  return (
    <div>
      <TopNavigation 
        title="Help & Support" 
        subtitle="Get assistance with Budget Planner" 
      />
      
      <div className="container px-6 py-8 mx-auto">
        <div className="grid place-items-center h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Help & Support</h2>
            <p className="text-muted-foreground">
              This page will provide help resources and support options
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
