import { TopNavigation } from "@/components/layout/top-navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart3, CreditCard, ArrowLeftRight, Wallet2, LayoutDashboard, Settings, HelpCircle, Plus } from "lucide-react";

const Help = () => {
  return (
    <div>
      <TopNavigation 
        title="Help & Support" 
        subtitle="Get assistance with Budget Planner" 
      />
      
      <div className="container px-6 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview">System Overview</TabsTrigger>
              <TabsTrigger value="instructions">How to Use</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>
            
            {/* System Overview */}
            <TabsContent value="overview">
              <Card className="rounded-xl border-[#E0E0E0] shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[#212B36]">Budget Planner System Overview</CardTitle>
                  <CardDescription>Understand how our budget tracking system works</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[#212B36] mb-2">System Architecture</h3>
                    <p className="text-[#637381]">
                      Budget Planner is a comprehensive personal finance management system that helps you track your income, expenses, and budget goals. The application consists of several integrated modules:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex gap-3 p-4 border border-[#E0E0E0] rounded-lg">
                        <LayoutDashboard className="h-6 w-6 text-[#4E60FF]" />
                        <div>
                          <h4 className="font-medium text-[#212B36]">Dashboard</h4>
                          <p className="text-sm text-[#637381]">Central overview of your financial health with summary cards and visualization charts.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 p-4 border border-[#E0E0E0] rounded-lg">
                        <CreditCard className="h-6 w-6 text-[#4E60FF]" />
                        <div>
                          <h4 className="font-medium text-[#212B36]">Accounts</h4>
                          <p className="text-sm text-[#637381]">Manage your bank accounts, credit cards, and other financial accounts in one place.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 p-4 border border-[#E0E0E0] rounded-lg">
                        <ArrowLeftRight className="h-6 w-6 text-[#4E60FF]" />
                        <div>
                          <h4 className="font-medium text-[#212B36]">Transactions</h4>
                          <p className="text-sm text-[#637381]">Record, categorize, and review all your financial transactions.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 p-4 border border-[#E0E0E0] rounded-lg">
                        <Wallet2 className="h-6 w-6 text-[#4E60FF]" />
                        <div>
                          <h4 className="font-medium text-[#212B36]">Budgets</h4>
                          <p className="text-sm text-[#637381]">Create and manage budgets for different categories and timeframes.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 p-4 border border-[#E0E0E0] rounded-lg">
                        <BarChart3 className="h-6 w-6 text-[#4E60FF]" />
                        <div>
                          <h4 className="font-medium text-[#212B36]">Reports</h4>
                          <p className="text-sm text-[#637381]">Generate detailed reports and analytics about your spending habits.</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 p-4 border border-[#E0E0E0] rounded-lg">
                        <Settings className="h-6 w-6 text-[#4E60FF]" />
                        <div>
                          <h4 className="font-medium text-[#212B36]">Settings</h4>
                          <p className="text-sm text-[#637381]">Personalize the app according to your preferences.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-[#212B36] mb-2">Data Flow</h3>
                    <p className="text-[#637381] mb-4">
                      The system processes your financial data in the following way:
                    </p>
                    <ol className="space-y-2 text-[#637381] list-decimal pl-4">
                      <li>You add transactions manually or connect your bank accounts for automatic imports.</li>
                      <li>Transactions are categorized based on predefined or custom categories.</li>
                      <li>Your spending is compared against your budget allocations.</li>
                      <li>The system generates reports and visualizations based on your financial activity.</li>
                      <li>You receive notifications and alerts when approaching budget limits.</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* How to Use */}
            <TabsContent value="instructions">
              <Card className="rounded-xl border-[#E0E0E0] shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[#212B36]">How to Use Budget Planner</CardTitle>
                  <CardDescription>Step-by-step instructions to manage your finances</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[#212B36] mb-4">Getting Started</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 border border-[#E0E0E0] rounded-lg">
                        <h4 className="flex items-center gap-2 font-medium text-[#212B36] mb-2">
                          <span className="flex items-center justify-center w-6 h-6 bg-[#4E60FF] text-white rounded-full text-sm">1</span>
                          Set Up Your Account
                        </h4>
                        <p className="text-[#637381] ml-8">
                          Navigate to Settings and complete your profile information. Set your preferred currency and notification preferences.
                        </p>
                      </div>
                      
                      <div className="p-4 border border-[#E0E0E0] rounded-lg">
                        <h4 className="flex items-center gap-2 font-medium text-[#212B36] mb-2">
                          <span className="flex items-center justify-center w-6 h-6 bg-[#4E60FF] text-white rounded-full text-sm">2</span>
                          Add Your Accounts
                        </h4>
                        <p className="text-[#637381] ml-8">
                          Go to the Accounts section and add your bank accounts, credit cards, and other financial accounts. You can manually add accounts or connect to your bank for automatic syncing.
                        </p>
                      </div>
                      
                      <div className="p-4 border border-[#E0E0E0] rounded-lg">
                        <h4 className="flex items-center gap-2 font-medium text-[#212B36] mb-2">
                          <span className="flex items-center justify-center w-6 h-6 bg-[#4E60FF] text-white rounded-full text-sm">3</span>
                          Create Budget Categories
                        </h4>
                        <p className="text-[#637381] ml-8">
                          Visit the Budgets page and set up categories for your spending. Common categories include Groceries, Entertainment, Transportation, and Housing. Assign monthly limits to each category.
                        </p>
                      </div>
                      
                      <div className="p-4 border border-[#E0E0E0] rounded-lg">
                        <h4 className="flex items-center gap-2 font-medium text-[#212B36] mb-2">
                          <span className="flex items-center justify-center w-6 h-6 bg-[#4E60FF] text-white rounded-full text-sm">4</span>
                          Record Transactions
                        </h4>
                                                <p className="text-[#637381] ml-8">                          Use the "Add Transaction" button in the top navigation to record your expenses and income. Categorize each transaction and add notes if needed.                        </p>
                      </div>
                      
                      <div className="p-4 border border-[#E0E0E0] rounded-lg">
                        <h4 className="flex items-center gap-2 font-medium text-[#212B36] mb-2">
                          <span className="flex items-center justify-center w-6 h-6 bg-[#4E60FF] text-white rounded-full text-sm">5</span>
                          Monitor Your Dashboard
                        </h4>
                        <p className="text-[#637381] ml-8">
                          Check your Dashboard regularly to see a comprehensive overview of your financial status. The dashboard displays summary cards, charts, and budget progress.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-[#212B36] mb-4">Feature Instructions</h3>
                    
                    <Accordion type="single" collapsible className="space-y-2">
                      <AccordionItem value="dashboard" className="border border-[#E0E0E0] rounded-lg px-4">
                        <AccordionTrigger className="text-[#212B36] hover:no-underline">
                          <div className="flex items-center gap-2">
                            <LayoutDashboard className="h-5 w-5 text-[#4E60FF]" />
                            <span>Using the Dashboard</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-[#637381]">
                          <p className="mb-2">The Dashboard provides a complete overview of your finances:</p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li><strong>Summary Cards:</strong> Quick view of your budget categories</li>
                            <li><strong>Allocation Budget:</strong> Visual breakdown of your spending</li>
                            <li><strong>Budget Category Table:</strong> Detailed list of your budget categories</li>
                            <li><strong>Savings Budget:</strong> Overview of your savings accounts</li>
                            <li><strong>Running Budget:</strong> Real-time budget tracking with remaining amounts</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="transactions" className="border border-[#E0E0E0] rounded-lg px-4">
                        <AccordionTrigger className="text-[#212B36] hover:no-underline">
                          <div className="flex items-center gap-2">
                            <ArrowLeftRight className="h-5 w-5 text-[#4E60FF]" />
                            <span>Managing Transactions</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-[#637381]">
                          <p className="mb-2">To manage your transactions effectively:</p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Click the <strong>"Add Transaction"</strong> button in the top navigation</li>
                            <li>Select transaction type (Income or Expense)</li>
                            <li>Enter the amount and select a category</li>
                            <li>Add a description and date</li>
                            <li>Save the transaction</li>
                            <li>View all transactions in the Transactions page</li>
                            <li>Filter transactions by date, category, or amount</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="budgets" className="border border-[#E0E0E0] rounded-lg px-4">
                        <AccordionTrigger className="text-[#212B36] hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Wallet2 className="h-5 w-5 text-[#4E60FF]" />
                            <span>Creating and Managing Budgets</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-[#637381]">
                          <p className="mb-2">To set up and manage your budgets:</p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Navigate to the Budgets page</li>
                            <li>Click "Add Category" to create a new budget category</li>
                            <li>Set a monthly spending limit for each category</li>
                            <li>Monitor your spending against these limits</li>
                            <li>Adjust budget allocations as needed</li>
                            <li>View budget performance in the Budget Category table</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="reports" className="border border-[#E0E0E0] rounded-lg px-4">
                        <AccordionTrigger className="text-[#212B36] hover:no-underline">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-[#4E60FF]" />
                            <span>Generating Reports</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-[#637381]">
                          <p className="mb-2">To generate and analyze financial reports:</p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li>Go to the Reports page</li>
                            <li>Select the type of report (Spending, Income, or Budget)</li>
                            <li>Choose a time period (week, month, year)</li>
                            <li>View visual representations of your financial data</li>
                            <li>Export reports using the Export button</li>
                            <li>Compare spending trends over time</li>
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* FAQ */}
            <TabsContent value="faq">
              <Card className="rounded-xl border-[#E0E0E0] shadow-sm">
                <CardHeader>
                  <CardTitle className="text-[#212B36]">Frequently Asked Questions</CardTitle>
                  <CardDescription>Common questions and answers about Budget Planner</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    <AccordionItem value="setup" className="border border-[#E0E0E0] rounded-lg px-4">
                      <AccordionTrigger className="text-[#212B36] hover:no-underline">How do I set up my budget categories?</AccordionTrigger>
                      <AccordionContent className="text-[#637381]">
                        Navigate to the Budgets page and click on the "Edit" button near the Budget Category section. 
                        From there, you can add new categories, set monthly limits, and customize your budget structure. 
                        We recommend starting with essential categories like Housing, Food, Transportation, and Entertainment.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="sync" className="border border-[#E0E0E0] rounded-lg px-4">
                      <AccordionTrigger className="text-[#212B36] hover:no-underline">Can I connect my bank accounts automatically?</AccordionTrigger>
                      <AccordionContent className="text-[#637381]">
                        Yes, Budget Planner supports automatic bank syncing. Go to the Accounts page and click "Connect Bank Account." 
                        Follow the prompts to securely connect your financial institutions. Once connected, your transactions will 
                        be automatically imported and categorized based on your settings.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="notifications" className="border border-[#E0E0E0] rounded-lg px-4">
                      <AccordionTrigger className="text-[#212B36] hover:no-underline">How do I set up budget alerts?</AccordionTrigger>
                      <AccordionContent className="text-[#637381]">
                        To set up alerts, go to Settings and select the "Notifications" tab. You can configure alerts 
                        for when you're approaching budget limits (e.g., 80% of budget used), when you exceed budgets, 
                        or for large transactions. You can receive these alerts via email or push notifications.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="recurring" className="border border-[#E0E0E0] rounded-lg px-4">
                      <AccordionTrigger className="text-[#212B36] hover:no-underline">How do I set up recurring transactions?</AccordionTrigger>
                      <AccordionContent className="text-[#637381]">
                        When adding a new transaction, check the "Make recurring" option. You can then specify the frequency 
                        (weekly, monthly, yearly) and duration. This is useful for regular expenses like rent/mortgage payments, 
                        subscriptions, or regular income sources.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="export" className="border border-[#E0E0E0] rounded-lg px-4">
                      <AccordionTrigger className="text-[#212B36] hover:no-underline">Can I export my financial data?</AccordionTrigger>
                      <AccordionContent className="text-[#637381]">
                        Yes, you can export your data in various formats (CSV, PDF, Excel). Look for the Export button 
                        in the Reports section or on specific pages like Transactions. You can export all data or filter 
                        by date range and categories.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="categories" className="border border-[#E0E0E0] rounded-lg px-4">
                      <AccordionTrigger className="text-[#212B36] hover:no-underline">How can I create custom categories?</AccordionTrigger>
                      <AccordionContent className="text-[#637381]">
                        Go to the Budget section and click on "Edit" near the Budget Category table. Select "Add Category" 
                        and enter a name, icon, and monthly limit for your new category. You can also create sub-categories 
                        for more detailed tracking.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="savings" className="border border-[#E0E0E0] rounded-lg px-4">
                      <AccordionTrigger className="text-[#212B36] hover:no-underline">How do I track my savings goals?</AccordionTrigger>
                      <AccordionContent className="text-[#637381]">
                        In the Savings Budget section, click the "+" button to add a new savings goal. Enter the target amount, 
                        timeline, and purpose. The system will track your progress and suggest monthly contributions to reach your goal 
                        on time. You can view your progress in the Savings section of the Dashboard.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Help;
