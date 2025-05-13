import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TopNavigation } from "@/components/layout/top-navigation";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3 } from "lucide-react";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { Transaction } from "@/lib/services/transaction-service";
import { useTransactions } from "@/hooks/use-transactions";
import { useBudgets } from "@/hooks/use-budgets";
import { useAuth } from "@/lib/providers/auth-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Transactions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [redirectToDashboard, setRedirectToDashboard] = useState(false);
  const [editTransactionData, setEditTransactionData] = useState<{id: string, data: Transaction} | null>(null);
  
  // Get the current user ID from auth
  const { user } = useAuth();
  const userId = user?.id || 'guest-user';
  
  // Use our transactions hook
  const {
    transactions,
    loading,
    filters,
    pagination,
    actions: {
      createTransaction,
      updateTransaction,
      deleteTransaction,
      applyFilters,
      changePage,
      exportTransactions,
      refreshTransactions
    }
  } = useTransactions(userId);
  
  // Use budgets hook to be able to refresh budgets when transactions change
  const { actions: { refreshBudgets } } = useBudgets(userId);

  // Check for state from navigation to open the add transaction dialog
  useEffect(() => {
    if (location.state?.openAddTransaction) {
      setAddTransactionOpen(true);
      // Clear the state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Handler for adding a new transaction
  const handleAddTransaction = async (data: Transaction) => {
    await createTransaction(data);
    setAddTransactionOpen(false);
    
    // Refresh both transactions and budgets to update the dashboard
    refreshTransactions();
    refreshBudgets();
    
    // Navigate to dashboard if redirectToDashboard is true
    if (redirectToDashboard) {
      navigate("/dashboard");
      setRedirectToDashboard(false);
    }
  };

  // Handler for editing a transaction
  const handleEditTransaction = async (id: string, data: Transaction) => {
    await updateTransaction(id, data);
    setEditTransactionData(null);
    
    // Refresh both transactions and budgets to update the dashboard
    refreshTransactions();
    refreshBudgets();
  };

  // Handler for deleting a transaction
  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
    
    // Refresh both transactions and budgets to update the dashboard
    refreshTransactions();
    refreshBudgets();
  };

  // Handler to go to dashboard after adding a transaction
  const handleAddAndViewDashboard = () => {
    setRedirectToDashboard(true);
    setAddTransactionOpen(true);
  };

  return (
    <div>
      <TopNavigation 
        title="Transactions" 
        subtitle="View and manage your financial transactions" 
      />
      
      <div className="container px-6 py-8 mx-auto">
        <div className="flex justify-end mb-6 gap-3">
          {/* Add Transaction Button */}
          <Button 
            onClick={() => setAddTransactionOpen(true)}
            className="bg-[#4E60FF] hover:bg-[#4E60FF]/90 text-white"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Transaction
          </Button>
          
          {/* Add and View Charts Button */}
          <Button 
            onClick={handleAddAndViewDashboard}
            variant="outline"
            className="border-[#4E60FF] text-[#4E60FF] hover:bg-[#4E60FF]/10"
          >
            <BarChart3 className="mr-1 h-4 w-4" />
            Add & View Charts
          </Button>
        </div>

        {/* Transaction List */}
        <TransactionList
          transactions={transactions}
          loading={loading}
          onEdit={(id, data) => setEditTransactionData({ id, data })}
          onDelete={handleDeleteTransaction}
          onFilter={applyFilters}
          onExport={exportTransactions}
          pagination={pagination}
          onPageChange={changePage}
        />
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={addTransactionOpen} onOpenChange={setAddTransactionOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>
              Record a new income or expense transaction
            </DialogDescription>
          </DialogHeader>
          <TransactionForm 
            userId={userId}
            onSave={handleAddTransaction}
            onCancel={() => {
              setAddTransactionOpen(false);
              setRedirectToDashboard(false); // Reset the redirect flag if canceled
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Transaction Dialog */}
      <Dialog 
        open={editTransactionData !== null} 
        onOpenChange={(open) => !open && setEditTransactionData(null)}
      >
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Update this transaction's details
            </DialogDescription>
          </DialogHeader>
          {editTransactionData && (
            <TransactionForm 
              userId={userId}
              initialData={editTransactionData.data}
              onSave={(data) => handleEditTransaction(editTransactionData.id, data)}
              onCancel={() => setEditTransactionData(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
