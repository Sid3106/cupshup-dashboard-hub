import { NavLink } from "react-router-dom";
import { Users, Building2, UserSquare2, CalendarDays, ListChecks, TestTubes } from "lucide-react";
import { cn } from "@/lib/utils";

export function CupShupNavigation() {
  return (
    <>
      <NavLink
        to="/dashboard/users"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 font-montserrat",
            isActive && "bg-white/10"
          )
        }
      >
        <Users className="h-4 w-4" />
        <span>Users</span>
      </NavLink>
      <NavLink
        to="/dashboard/vendors"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 font-montserrat",
            isActive && "bg-white/10"
          )
        }
      >
        <Building2 className="h-4 w-4" />
        <span>Vendors</span>
      </NavLink>
      <NavLink
        to="/dashboard/clients"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 font-montserrat",
            isActive && "bg-white/10"
          )
        }
      >
        <UserSquare2 className="h-4 w-4" />
        <span>Clients</span>
      </NavLink>
      <NavLink
        to="/dashboard/activities"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 font-montserrat",
            isActive && "bg-white/10"
          )
        }
      >
        <CalendarDays className="h-4 w-4" />
        <span>Activities</span>
      </NavLink>
      <NavLink
        to="/dashboard/mapped-activities"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 font-montserrat",
            isActive && "bg-white/10"
          )
        }
      >
        <ListChecks className="h-4 w-4" />
        <span>Mapped Activities</span>
      </NavLink>
      <NavLink
        to="/dashboard/test"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 font-montserrat",
            isActive && "bg-white/10"
          )
        }
      >
        <TestTubes className="h-4 w-4" />
        <span>Test</span>
      </NavLink>
    </>
  );
}