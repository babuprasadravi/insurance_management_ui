import { useState } from "react";
import {
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

export const DashboardNavbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const notifications = [
    { id: 1, message: "Your claim has been approved", date: "2h ago" },
    { id: 2, message: "Policy renewal reminder", date: "1d ago" },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
      {/* Company Name/Logo */}
      <div className="flex items-center cursor-pointer" onClick={() => navigate("/dashboard")}>
        <h1 className="text-xl font-semibold text-slate-700">SecureWheel</h1>
      </div>

      {/* Right Side Items */}
      <div className="flex items-center space-x-6">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 hover:bg-slate-50 rounded-full relative"
          >
            <BellIcon className="h-6 w-6 text-slate-600" />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 bg-rose-500 rounded-full w-2 h-2"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 border border-slate-100">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-slate-800">
                  Notifications
                </h3>
                {notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="flex items-start space-x-3 p-2 hover:bg-slate-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm text-slate-800">
                            {notif.message}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {notif.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No new notifications</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-3 hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors"
          >
            <UserCircleIcon className="h-8 w-8 text-slate-600" />
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-700">{user?.username || 'User'}</p>
              <p className="text-xs text-slate-500">{user?.role || 'Customer'}</p>
            </div>
            <ChevronDownIcon className="h-4 w-4 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-slate-100">
              <div className="py-2">
                <button
                  onClick={() => navigate(user?.role === 'AGENT' ? "/agentDashboard/profile" : "/dashboard/settings")}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                >
                  <span>Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                >
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};