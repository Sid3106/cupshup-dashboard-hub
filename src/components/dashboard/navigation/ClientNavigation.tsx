import { NavLink } from "react-router-dom";
import { 
  PresentationChart, 
  Bot, 
  Tool, 
  FileSpreadsheet 
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ClientNavigation() {
  return (
    <>
      <NavLink
        to="/dashboard/campaign-management"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 font-montserrat",
            isActive && "bg-white/10"
          )
        }
      >
        <PresentationChart className="h-4 w-4" />
        <span>Campaign Management</span>
      </NavLink>
      <NavLink
        to="/dashboard/ai-agents"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 font-montserrat",
            isActive && "bg-white/10"
          )
        }
      >
        <Bot className="h-4 w-4" />
        <span>AI Agents</span>
      </NavLink>
      <NavLink
        to="/dashboard/ai-tools"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 font-montserrat",
            isActive && "bg-white/10"
          )
        }
      >
        <Tool className="h-4 w-4" />
        <span>AI Tools</span>
      </NavLink>
      <NavLink
        to="/dashboard/create-media-plan"
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 font-montserrat",
            isActive && "bg-white/10"
          )
        }
      >
        <FileSpreadsheet className="h-4 w-4" />
        <span>Create Media Plan</span>
      </NavLink>
    </>
  );
}