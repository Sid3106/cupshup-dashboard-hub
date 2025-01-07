import { Users, Briefcase, ClipboardList, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back to your CupShup dashboard
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value="25"
            icon={Users}
            description="+2 since last month"
          />
          <StatsCard
            title="Active Activities"
            value="12"
            icon={Briefcase}
            description="4 pending approval"
          />
          <StatsCard
            title="Completed Tasks"
            value="128"
            icon={ClipboardList}
            description="24 this week"
          />
          <StatsCard
            title="Success Rate"
            value="92%"
            icon={TrendingUp}
            description="+5.2% from last month"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}