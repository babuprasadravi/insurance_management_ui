import {
    DocumentTextIcon,
    UserGroupIcon,
    ClipboardDocumentListIcon,
    CurrencyRupeeIcon,
  } from "@heroicons/react/24/outline";
  import { DashboardLayout } from "../layout/DashboardLayout";
  import { OverviewCard } from "../ui/OverviewCard";
  import { WelcomeBanner } from "../ui/WelcomeBanner";
  import { useAgent } from "../../context/AgentContext";
  import { AgentMenuItems } from "../../constants/data";
  
  export const AgentDashboard = () => {
    const { assignedPolicies, pendingClaims, commissionSummary } = useAgent();
  
    const agent = {
      name: "Rahul Sharma",
      role: "Insurance Agent"
    };
  
    // Get policies expiring in next 30 days
    const upcomingRenewals = assignedPolicies.filter(policy => {
      const expiryDate = new Date(policy.validityEnd);
      const today = new Date();
      const diffTime = expiryDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    }).length;
  
    return (
      <DashboardLayout menuItems={AgentMenuItems} >
        {/* Welcome Banner */}
        <WelcomeBanner customer={agent} />
  
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <OverviewCard
            title="Assigned Policies"
            value={assignedPolicies.length}
            icon={DocumentTextIcon}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
          />
          <OverviewCard
            title="Pending Claims"
            value={pendingClaims.length}
            icon={ClipboardDocumentListIcon}
            className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100"
          />
          <OverviewCard
            title="Upcoming Renewals"
            value={upcomingRenewals}
            icon={UserGroupIcon}
            className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100"
          />
          <OverviewCard
            title="Total Commission"
            value={`₹${commissionSummary.totalEarned.toLocaleString()}`}
            icon={CurrencyRupeeIcon}
            className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100"
          />
        </div>
  
        {/* Recent Activity Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y">
            {/* Add recent activities here */}
          </div>
        </div>
      </DashboardLayout>
    );
  };