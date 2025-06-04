import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { DashboardLayout } from "../layout/DashboardLayout";
import { PurchasedPolicyCard } from "../components/PurchasedPolicyCard";
import { EmptyState } from "../components/EmptyState";
import { customerMenuItems } from "../../constants/data";
import { useAuth } from "../../context/AuthProvider";

export const MyPolicies = () => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate status based on validity dates
  const calculateStatus = (validFrom, validUntil) => {
    const today = new Date();
    const startDate = new Date(validFrom);
    const endDate = new Date(validUntil);
    
    if (today < startDate) {
      return "Pending";
    } else if (today > endDate) {
      return "Expired";
    } else {
      return "Active";
    }
  };

  // Fetch policies from backend API
  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      setError("");

      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const response = await axios.get(`http://localhost:8084/api/policies/customer/${user.id}`);
      
      console.log("Customer Policies API Response:", response.data);

      // Map API response to frontend format
      const mappedPolicies = response.data.map(policy => ({
        id: policy.id,
        name: policy.policyName, // Map policyName to name
        vehicleRegNo: policy.licenceNo, // Map licenceNo to vehicleRegNo
        vehicle: policy.vehicle, // Use for manufacturer/model display
        validityStart: policy.validFrom, // Map validFrom to validityStart
        validityEnd: policy.validUntil, // Map validUntil to validityEnd
        premiumPaid: policy.premium, // Map premium to premiumPaid
        agentName: policy.agentAssigned, // Map agentAssigned to agentName
        agentId: policy.agentId,
        customerId: policy.customerId,
        status: calculateStatus(policy.validFrom, policy.validUntil), // Calculate status
        // Set default values for missing fields
        manufacturer: policy.vehicle?.split(' ')[0] || "Unknown", // Extract first word as manufacturer
        model: policy.vehicle?.split(' ').slice(1).join(' ') || "Unknown", // Rest as model
        insuredValue: 0 // Default value
      }));

      setPolicies(mappedPolicies);
    } catch (error) {
      console.error("Error fetching customer policies:", error);
      
      let errorMessage = "Failed to fetch policies. Please try again.";
      
      if (error.response?.status === 404) {
        errorMessage = "No policies found for your account.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = "Cannot connect to server. Please check if the backend is running.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message === "User not authenticated") {
        errorMessage = "Please log in to view your policies.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch policies when component mounts or user changes
  useEffect(() => {
    if (user?.id) {
      fetchPolicies();
    }
  }, [user?.id]);

  // Filter policies by search term (removed type filter as requested)
  const filteredPolicies = policies.filter(policy => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      policy.name.toLowerCase().includes(searchLower) ||
      policy.id.toString().toLowerCase().includes(searchLower) ||
      policy.vehicleRegNo.toLowerCase().includes(searchLower) ||
      policy.vehicle.toLowerCase().includes(searchLower)
    );
  });

  // Retry function for error state
  const handleRetry = () => {
    fetchPolicies();
  };

  return (
    <DashboardLayout menuItems={customerMenuItems}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">My Insurance Policies</h1>
        <p className="text-gray-600">View and manage all your active insurance policies</p>
      </div>

      {/* Search Bar (removed filter section) */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search by policy name, ID, or vehicle number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-5 bg-gray-200 rounded w-32 mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-gray-100">
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                    <div className="flex space-x-2">
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && policies.length === 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-red-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Policies</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Policies Content */}
      {!isLoading && !error && (
        <>
          {filteredPolicies.length > 0 ? (
            <>
              {/* Results count */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredPolicies.length} of {policies.length} policies
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              </div>
              
              {/* Policies Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredPolicies.map((policy) => (
                  <PurchasedPolicyCard key={policy.id} policy={policy} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Policies Found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? "No policies match your search criteria. Try adjusting your search terms." 
                    : "You haven't purchased any insurance policies yet."
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => window.location.href = '/dashboard/browse-policies'}
                    className="px-4 py-2 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    Browse Available Policies
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};