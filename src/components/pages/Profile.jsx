import { useState } from "react";
import { PhotoIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { DashboardLayout } from "../layout/DashboardLayout";
import { customerMenuItems } from "../../constants/data";

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "Arul",
    email: "arul@example.com",
    phone: "+91 9876543210",
    address: "123 Main Street, Chennai, Tamil Nadu, India",
  });
  const [tempData, setTempData] = useState({ ...formData });

  const handleEdit = () => {
    setTempData({ ...formData });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempData({ ...formData });
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setFormData({ ...tempData });
    setIsEditing(false);
    setIsLoading(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <DashboardLayout menuItems={customerMenuItems}>
      {" "}
      <div className="max-w-2xl mx-auto">
        {/* Success Message */}
        {showSuccess && (
          <div className="fixed top-4 right-4 bg-green-50 text-green-800 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg z-50">
            <CheckCircleIcon className="h-5 w-5" />
            Profile updated successfully
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Profile Image */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src="https://api.dicebear.com/7.x/initials/svg?seed=AK&backgroundColor=0369a1&textColor=ffffff"
                alt="Profile"
                className="w-28 h-28 rounded-full border-4 border-gray-50 shadow-md"
              />
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md">
                <PhotoIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={tempData.name}
                  onChange={(e) =>
                    setTempData({ ...tempData, name: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isEditing
                      ? "border-indigo-300 bg-white"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled={true}
                  value={tempData.email}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  disabled={!isEditing}
                  value={tempData.phone}
                  onChange={(e) =>
                    setTempData({ ...tempData, phone: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isEditing
                      ? "border-indigo-300 bg-white"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  disabled={!isEditing}
                  value={tempData.address}
                  onChange={(e) =>
                    setTempData({ ...tempData, address: e.target.value })
                  }
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isEditing
                      ? "border-indigo-300 bg-white"
                      : "border-gray-200 bg-gray-50"
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Updating...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};
