import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Bell, 
  Share2, 
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
    // TODO: Connect to backend endpoint: GET /api/search?query=${searchValue}
  };

  const exportData = () => {
    // Export functionality placeholder
    console.log("Exporting data...");
    // TODO: Connect to backend endpoint: GET /api/export
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
            <h1 className="text-2xl font-bold text-[#212B36]">{title}</h1>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full sm:w-[200px] pl-8 rounded-full bg-[#F9FAFB] border-[#E0E0E0]"
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

            {/* Add Payment Button */}
            <Button 
              onClick={addPayment} 
              className="bg-[#4E60FF] hover:bg-[#4E60FF]/90 text-white gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Payment
            </Button>

            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              <Button variant="ghost" size="icon" className="rounded-full text-[#212B36]">
                <Bell className="h-5 w-5" />
              </Button>

              {/* Share Button */}
              <Button variant="ghost" size="icon" className="rounded-full text-[#212B36]">
                <Share2 className="h-5 w-5" />
              </Button>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-9 w-9 cursor-pointer">
                    <AvatarImage src="" alt={user?.email || "User"} />
                    <AvatarFallback className="bg-[#4E60FF] text-white">{userInitials}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-md shadow-md">
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
