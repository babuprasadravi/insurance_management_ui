import { DashboardLayout } from "../layout/DashboardLayout";
import { AgentMenuItems } from "../../constants/data";
import { useAgent } from "../../context/AgentContext";

export const AgentPolicies = () => {
  const { assignedPolicies } = useAgent();

  return (
    <DashboardLayout menuItems={AgentMenuItems}>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">My Policies</h1>
        {/* Add policies list UI here */}
      </div>
    </DashboardLayout>
  );
};