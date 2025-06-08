import {
    UsersIcon,
    UserGroupIcon,
    DocumentTextIcon,
    ClipboardDocumentListIcon,
    BanknotesIcon,
  } from "@heroicons/react/24/outline";
  import { DashboardLayout } from "../layout/DashboardLayout";
  import { OverviewCard } from "../ui/OverviewCard";
  import { WelcomeBanner } from "../ui/WelcomeBanner";
  import { AdminMenuItems } from "../../constants/data";
  
  export const AdminDashboard = () => {
    return (
      <DashboardLayout menuItems={AdminMenuItems}>
        {/* Welcome Banner */}
        <WelcomeBanner />
  
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <OverviewCard
            title="Total Customers"
            value={150}
            icon={UsersIcon}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
          />
          <OverviewCard
            title="Total Agents"
            value={12}
            icon={UserGroupIcon}
            className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100"
          />
          <OverviewCard
            title="Active Policies"
            value={180}
            icon={DocumentTextIcon}
            className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100"
          />
          <OverviewCard
            title="Pending Claims"
            value={8}
            icon={ClipboardDocumentListIcon}
            className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100"
          />
          <OverviewCard
            title="Total Revenue"
            value="₹4.2M"
            icon={BanknotesIcon}
            className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100"
          />
        </div>
      </DashboardLayout>
    );
  };