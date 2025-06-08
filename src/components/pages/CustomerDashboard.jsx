import {
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { DashboardLayout } from "../layout/DashboardLayout";
import { OverviewCard } from "../ui/OverviewCard";
import { WelcomeBanner } from "../ui/WelcomeBanner";
import { customerMenuItems } from "../../constants/data";
export const CustomerDashboard = () => {
  return (
    <DashboardLayout menuItems={customerMenuItems}>
      {/* Welcome Banner */}
      <WelcomeBanner/>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OverviewCard
          title="Browse Policies"
          value="Explore"
          icon={DocumentTextIcon}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100"
        />
        <OverviewCard
          title="My Policies"
          value={3}
          icon={ClipboardDocumentListIcon}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
        />
        <OverviewCard
          title="Active Claims"
          value={2}
          icon={ExclamationCircleIcon}
          className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100"
        />
      </div>
    </DashboardLayout>
  );
};
