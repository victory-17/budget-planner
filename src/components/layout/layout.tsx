
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";

export function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
