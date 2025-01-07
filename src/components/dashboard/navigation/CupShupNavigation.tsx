import { NavLink } from "react-router-dom";
import { CalendarDays, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

export function CupShupNavigation() {
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
    </>
  );
}