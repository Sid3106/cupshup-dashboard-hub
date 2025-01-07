import { NavLink } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardNavLink() {
  return (
    <NavLink
      to="/dashboard"
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 font-montserrat",
          isActive && "bg-white/10"
        )
      }
    >
      <LayoutDashboard className="h-4 w-4" />
      <span>Dashboard</span>
    </NavLink>
  );
}