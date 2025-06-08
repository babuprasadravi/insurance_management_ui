import { useState } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardNavbar } from "./DashboardNavbar";

export const DashboardLayout = ({ menuItems, children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        menuItems={menuItems}
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <DashboardNavbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};
