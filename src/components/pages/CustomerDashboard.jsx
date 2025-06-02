import {
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { DashboardLayout } from "../layout/DashboardLayout";
import { OverviewCard } from "../ui/OverviewCard";

export const CustomerDashboard = () => {
  const customer = {
    name: "Arul",
    policies: 2,
    activeClaims: 1,
  };

  return (
    <DashboardLayout>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-6 mb-6 shadow-lg">
        <h1 className="text-2xl font-semibold">
          Welcome back, {customer.name}
        </h1>
        <p className="text-blue-100 mt-1">Here's your insurance overview</p>
      </div>

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
