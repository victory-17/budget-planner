import { useNavigate } from "react-router-dom";
import { 
  Download,
  LogOut,
  Plus
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/providers/auth-provider";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface TopNavigationProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function TopNavigation({ title, subtitle, action }: TopNavigationProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const exportData = () => {
    // Export functionality placeholder
    console.log("Exporting data...");
    // TODO: Connect to backend endpoint: GET /api/export
  };

  const addTransaction = () => {
    navigate("/transactions", { state: { openAddTransaction: true } });
  };
  
  // Safely get user display name from metadata or use email as fallback
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || '';
  
  // Generate user initials from name or email
  const userInitials = userName 
    ? userName.split(' ').map(part => part[0]?.toUpperCase()).slice(0, 2).join('')
    : user?.email?.[0].toUpperCase() || "U";

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="border-b border-border bg-background py-4">
      <div className="container px-6 mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3">
            {/* Export Button */}
            <Button variant="outline" onClick={exportData} className="gap-2 text-sm">
              <Download className="h-4 w-4" />
              Export
            </Button>

            {/* Custom Action or Default Add Transaction Button */}
            {action || (
              <Button onClick={addTransaction} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Transaction
              </Button>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/avatar.png" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
