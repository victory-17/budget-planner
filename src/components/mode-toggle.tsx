
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="w-10 h-10 rounded-full">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SidebarModeToggle() {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <div 
      className="flex items-center gap-2 cursor-pointer" 
      onClick={toggleTheme}
    >
      <div className="flex items-center">
        <div className="mr-2 text-sm font-medium">Light Mode</div>
        <div className={`relative w-10 h-5 rounded-full transition-colors ${theme === "dark" ? "bg-sidebar-accent" : "bg-budget-green"}`}>
          <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${theme === "dark" ? "translate-x-5" : "translate-x-0"}`} />
        </div>
      </div>
    </div>
  );
}
