
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Bell, 
  Share2, 
  Calendar, 
  Download,
  LogOut
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
}

export function TopNavigation({ title, subtitle }: TopNavigationProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality placeholder
    console.log("Search for:", searchValue);
    // Placeholder: Connect to GET /api/search?query=${searchValue}
  };

  const exportData = () => {
    // Export functionality placeholder
    console.log("Exporting data...");
    // Placeholder: Connect to GET /api/export
  };

  const addPayment = () => {
    navigate("/transactions/new");
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
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4">
            <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full sm:w-[200px] pl-8 rounded-full bg-background"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </form>

            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("flex items-center gap-2", !date && "text-muted-foreground")}>
                    <Calendar className="h-4 w-4" />
                    <span>{formattedDate}</span>
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

              <Button variant="outline" onClick={exportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button onClick={addPayment} className="bg-budget-green hover:bg-budget-green/90 text-white">
                + Add Payment
              </Button>

              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" className="rounded-full">
                <Share2 className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-9 w-9 cursor-pointer">
                    <AvatarImage src="" alt={user?.email || "User"} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
