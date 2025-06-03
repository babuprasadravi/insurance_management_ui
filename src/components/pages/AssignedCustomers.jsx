import { DashboardLayout } from "../layout/DashboardLayout";
import { AgentMenuItems } from "../../constants/data";
import { useAgent } from "../../context/AgentContext";

export const AssignedCustomers = () => {
  const { assignedCustomers } = useAgent();

  return (
    <DashboardLayout menuItems={AgentMenuItems}>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">Assigned Customers</h1>
        <div className="bg-white rounded-xl shadow-sm">
          {/* Add customer list UI here */}
        </div>
      </div>
    </DashboardLayout>
  );
};