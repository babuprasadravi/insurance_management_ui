import { DashboardLayout } from "../layout/DashboardLayout";
import { AgentMenuItems } from "../../constants/data";

export const CreatePolicy = () => {
  return (
    <DashboardLayout menuItems={AgentMenuItems}>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">Create New Policy</h1>
        {/* Add policy creation form here */}
      </div>
    </DashboardLayout>
  );
};