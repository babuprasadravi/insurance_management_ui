import { useState, useEffect } from "react";
import ClipLoader from "react-spinners/ClipLoader"; // Import the spinner
import axios from "axios";
import toast from "react-hot-toast";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { DashboardLayout } from "../layout/DashboardLayout";
import { customerMenuItems } from "../../constants/data";
import { useAuth } from "../../context/AuthProvider";

export const Profile = () => {
  const { user } = useAuth();

  // State variables
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [tempData, setTempData] = useState({ ...formData });

  // Fetch user profile data - initial load
  // This function fetches the user profile data from the server
  const fetchUserProfile = async () => {
    setIsFetching(true);
    setFetchError("");

    try {
      const response = await axios.post("http://localhost:8087/auth/getuser", {
        id: user.id,
      });
      if (response.status === 200) {
        const userData = response.data;
        const updatedFormData = {
          name: userData.username || "",
          email: userData.email || "",
          phone: userData.phonenumber || "",
          address: userData.address || "",
        };
        setFormData(updatedFormData);
        setTempData(updatedFormData);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setFetchError("Failed to load profile data. Please try again.");
    } finally {
      setIsFetching(false);
    }
  };

  // Fetch profile data on component mount
  useEffect(() => {
    if (user?.id) fetchUserProfile();
  }, [user.id]);

  // Handle edit mode
  const handleEdit = () => {
    setTempData({ ...formData });
    setIsEditing(true);
  };

  // Handle cancel edit
  const handleCancel = () => {
    setTempData({ ...formData });
    setIsEditing(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.put(
        "http://localhost:8087/auth/update-profile",
        {
          id: user.id,
          username: tempData.name,
          phonenumber: tempData.phone,
          address: tempData.address,
        }
      );

      if (response.status === 200) {
        setFormData({ ...tempData });
        setIsEditing(false);
        toast.success("Profile updated successfully!");
        await fetchUserProfile();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while fetching data
  if (isFetching) {
    return (
      <DashboardLayout menuItems={customerMenuItems}>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <ClipLoader color="#4F46E5" size={40} />
            <p className="mt-3 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={customerMenuItems}>
      <div className="max-w-2xl mx-auto">
        {/* Fetch Error Message */}
        {fetchError && (
          <div className="mb-4 bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg border border-yellow-200 flex items-start gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Profile Load Warning</p>
              <p className="text-sm">{fetchError}</p>
              <button
                onClick={fetchUserProfile}
                className="text-sm underline hover:no-underline mt-1"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Profile Image */}
          <div className="flex justify-center mb-6">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                formData.name || "User"
              )}&backgroundColor=0369a1&textColor=ffffff`}
              alt="Profile"
              className="w-28 h-28 rounded-full border-4 border-gray-50 shadow-md"
            />
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
                  disabled
                  value={tempData.email}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
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
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isEditing
                      ? "border-indigo-300 bg-white"
                      : "border-gray-200 bg-gray-50"
                  }`}
                  placeholder={
                    isEditing ? "Enter your address..." : "No address provided"
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={handleEdit}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
                  >
                    {isLoading ? "Updating..." : "Save Changes"}
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
