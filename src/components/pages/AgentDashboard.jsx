import {
  DocumentTextIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";
import { DashboardLayout } from "../layout/DashboardLayout";
import { OverviewCard } from "../ui/OverviewCard";
import { WelcomeBanner } from "../ui/WelcomeBanner";
import { AgentMenuItems } from "../../constants/data";

export const AgentDashboard = () => {
  return (
    <DashboardLayout menuItems={AgentMenuItems}>
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <OverviewCard
          title="Assigned Policies"
          value={3}
          icon={DocumentTextIcon}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
        />
        <OverviewCard
          title="Pending Claims"
          value={2}
          icon={ClipboardDocumentListIcon}
          className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100"
        />
        <OverviewCard
          title="Upcoming Renewals"
          value={1}
          icon={UserGroupIcon}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100"
        />
        <OverviewCard
          title="Total Commission"
          value={`₹${35000}`}
          icon={CurrencyRupeeIcon}
          className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100"
        />
      </div>
    </DashboardLayout>
  );
};