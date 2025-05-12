import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { SidebarModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/lib/providers/auth-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  CreditCard, 
  ArrowLeftRight, 
  Wallet2, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Sun,
  Moon
} from "lucide-react";

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  isActive?: boolean;
}

const SidebarLink = ({ to, icon, label, isCollapsed, isActive }: SidebarLinkProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive: routeIsActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          (isActive || routeIsActive) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "",
          isCollapsed ? "justify-center" : ""
        )
      }
    >
      {icon}
      {!isCollapsed && <span>{label}</span>}
    </NavLink>
  );
};

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { signOut } = useAuth();

  // Auto-collapse on mobile screens
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border h-screen transition-all duration-300 sticky top-0 left-0",
        isCollapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center gap-2 px-3 h-16">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-budget-green flex items-center justify-center">
              <Wallet2 className="text-white h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">Budget Planner</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-md bg-budget-green flex items-center justify-center">
              <Wallet2 className="text-white h-5 w-5" />
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto", isCollapsed ? "mx-auto" : "")}
          onClick={toggleSidebar}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="px-3 py-4">
        {!isCollapsed && <p className="text-xs font-semibold text-sidebar-foreground/60 mb-2">GENERAL MENU</p>}
        <nav className="flex flex-col gap-1">
          <SidebarLink
            to="/dashboard"
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Dashboard"
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            to="/accounts"
            icon={<CreditCard className="h-5 w-5" />}
            label="Accounts"
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            to="/transactions"
            icon={<ArrowLeftRight className="h-5 w-5" />}
            label="Transactions"
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            to="/budgets"
            icon={<Wallet2 className="h-5 w-5" />}
            label="Budgets"
            isCollapsed={isCollapsed}
            isActive={true}
          />
          <SidebarLink
            to="/reports"
            icon={<BarChart3 className="h-5 w-5" />}
            label="Reports"
            isCollapsed={isCollapsed}
          />
        </nav>
      </div>

      <div className="px-3 py-4 mt-auto">
        {!isCollapsed && <p className="text-xs font-semibold text-sidebar-foreground/60 mb-2">SUPPORT</p>}
        <nav className="flex flex-col gap-1">
          <SidebarLink
            to="/settings"
            icon={<Settings className="h-5 w-5" />}
            label="Settings"
            isCollapsed={isCollapsed}
          />
          <SidebarLink
            to="/help"
            icon={<HelpCircle className="h-5 w-5" />}
            label="Help"
            isCollapsed={isCollapsed}
          />
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer",
              isCollapsed ? "justify-center" : ""
            )}
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span>Log Out</span>}
          </div>
        </nav>
      </div>

      <div className="px-3 py-4 border-t border-sidebar-border">
        {!isCollapsed && <SidebarModeToggle />}
        {isCollapsed && (
          <div className="flex justify-center">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
