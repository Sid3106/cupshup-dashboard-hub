import { NavLink } from "react-router-dom";
import { CalendarDays, ListChecks, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function VendorNavigation() {
  return (
    <>
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
        to="/dashboard/my-activities"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 font-montserrat",
            isActive && "bg-white/10"
          )
        }
      >
        <ListChecks className="h-4 w-4" />
        <span>My Activities</span>
      </NavLink>
      <NavLink
        to="/dashboard/my-tasks"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 font-montserrat",
            isActive && "bg-white/10"
          )
        }
      >
        <ClipboardCheck className="h-4 w-4" />
        <span>My Tasks</span>
      </NavLink>
    </>
  );
}