import {
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { DashboardLayout } from "../layout/DashboardLayout";
import { OverviewCard } from "../ui/OverviewCard";
import { WelcomeBanner } from "../ui/WelcomeBanner";

export const CustomerDashboard = () => {
  const customer = {
    name: "Arul",
    policies: 2,
    activeClaims: 1,
  };

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <WelcomeBanner customer={customer} />

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
          value={customer.policies}
          icon={ClipboardDocumentListIcon}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
        />
        <OverviewCard
          title="Active Claims"
          value={customer.activeClaims}
          icon={ExclamationCircleIcon}
          className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100"
        />
      </div>
    </DashboardLayout>
  );
};
