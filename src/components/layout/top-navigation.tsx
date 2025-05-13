import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Bell, 
  Calendar, 
  Download,
  LogOut,
  Plus,
  ChevronDown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useAuth } from "@/lib/providers/auth-provider";
import { cn } from "@/lib/utils";
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
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality placeholder
    console.log("Search for:", searchValue);
    // TODO: Connect to backend endpoint: GET /api/search?query=${searchValue}
  };

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

  const formattedDate = date ? date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }) : 'Select date';

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

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="search-input w-full sm:w-[200px] pl-8 rounded-full"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </form>

            {/* Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 rounded-md text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{formattedDate}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

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

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-[1.2rem] w-[1.2rem]" />
            </Button>

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
