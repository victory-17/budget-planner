
import { TopNavigation } from "@/components/layout/top-navigation";

const Transactions = () => {
  return (
    <div>
      <TopNavigation 
        title="Transactions" 
        subtitle="View and manage your financial transactions" 
      />
      
      <div className="container px-6 py-8 mx-auto">
        <div className="grid place-items-center h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Transactions Page</h2>
            <p className="text-muted-foreground">
              This page will display your financial transactions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
