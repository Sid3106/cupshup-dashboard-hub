import { UserNav } from "./UserNav";
import { MobileNav } from "./MobileNav";

export function DashboardHeader() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center gap-4">
          <img 
            src="/cupshup-logo.png" 
            alt="CupShup Logo" 
            className="h-8 w-auto"
          />
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <UserNav />
          <MobileNav />
        </div>
      </div>
    </div>
  );
}