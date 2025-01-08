import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function MobileNav() {
  return (
    <SidebarTrigger asChild className="lg:hidden">
      <Button variant="ghost" size="icon" className="text-gray-600 hover:text-[#00A979] hover:bg-[#00A979]/5">
        <Menu className="h-5 w-5" />
      </Button>
    </SidebarTrigger>
  );
}