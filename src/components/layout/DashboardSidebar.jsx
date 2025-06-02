import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  UserCircleIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const menuItems = [
  {
    name: "Account Settings",
    icon: UserCircleIcon,
    path: "/dashboard/settings",
  },
  {
    name: "Browse Policies",
    icon: DocumentTextIcon,
    path: "/dashboard/browse-policies",
  },
  {
    name: "My Policies",
    icon: ClipboardDocumentListIcon,
    path: "/dashboard/my-policies",
  },
  {
    name: "File a Claim",
    icon: DocumentTextIcon,
    path: "/dashboard/file-claim",
  },
  { name: "Notifications", icon: BellIcon, path: "/dashboard/notifications" },
];

export const DashboardSidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      className={`bg-slate-800 text-white h-screen transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      } fixed left-0 top-0`}
    >
      <div
        className="flex justify-between items-center p-4 border-b border-slate-700/50"
        onClick={() => navigate("/dashboard")}
      >
        <h2 className={`font-bold ${collapsed ? "hidden" : "block"}`}>
          SecureWheel
        </h2>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
        >
          {collapsed ? (
            <ChevronRightIcon className="h-6 w-6" />
          ) : (
            <ChevronLeftIcon className="h-6 w-6" />
          )}
        </button>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex items-center px-4 py-3 transition-colors ${
              location.pathname === item.path
                ? "bg-slate-700 border-r-4 border-slate-300"
                : "hover:bg-slate-700/50"
            }`}
          >
            <item.icon className="h-6 w-6" />
            <span className={`ml-3 ${collapsed ? "hidden" : "block"}`}>
              {item.name}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
};
