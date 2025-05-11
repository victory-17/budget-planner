
import { TopNavigation } from "@/components/layout/top-navigation";

const Reports = () => {
  return (
    <div>
      <TopNavigation 
        title="Reports" 
        subtitle="Analyze your financial data" 
      />
      
      <div className="container px-6 py-8 mx-auto">
        <div className="grid place-items-center h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Reports Page</h2>
            <p className="text-muted-foreground">
              This page will display your financial reports and analytics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
