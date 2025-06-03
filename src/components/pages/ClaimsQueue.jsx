import { DashboardLayout } from "../layout/DashboardLayout";
import { AgentMenuItems } from "../../constants/data";
import { useAgent } from "../../context/AgentContext";

export const ClaimsQueue = () => {
  const { pendingClaims } = useAgent();

  return (
    <DashboardLayout menuItems={AgentMenuItems}>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">Claims Queue</h1>
        {/* Add claims list UI here */}
      </div>
    </DashboardLayout>
  );
};