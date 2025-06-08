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

  // Calculate policy status based on validity dates
  const calculateStatus = (validFrom, validUntil) => {
    const today = new Date();
    const startDate = new Date(validFrom);
    const endDate = new Date(validUntil);
    if (today < startDate) return "Pending";
    if (today > endDate) return "Expired";
    return "Active";
  };

  // Fetch policies from backend API
  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      setError("");

      if (!user?.id) throw new Error("User not authenticated");
      
      const response = await axios.get(`http://localhost:8084/api/policies/customer/${user.id}`);
      const mappedPolicies = response.data.map(policy => ({
        id: policy.id,
        name: policy.policyName,
        vehicleRegNo: policy.licenceNo,
        vehicle: policy.vehicle,
        validityStart: policy.validFrom,
        validityEnd: policy.validUntil,
        premiumPaid: policy.premium,
        agentName: policy.agentAssigned,
        status: calculateStatus(policy.validFrom, policy.validUntil),
        manufacturer: policy.vehicle?.split(' ')[0] || "Unknown",
        model: policy.vehicle?.split(' ').slice(1).join(' ') || "Unknown",
        insuredValue: 0
      }));

      setPolicies(mappedPolicies);
    } catch (error) {
      console.error("Error fetching customer policies:", error);
      const errorMessage = error.response?.data?.message || "Failed to fetch policies. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch policies when component mounts or user changes
  useEffect(() => {
    if (user?.id) fetchPolicies();
  }, [user?.id]);

  // Filter policies by search term
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
  const handleRetry = () => fetchPolicies();

  return (
    <DashboardLayout menuItems={customerMenuItems}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">My Insurance Policies</h1>
        <p className="text-gray-600">View and manage all your active insurance policies</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <input
          type="text"
          className="w-full pl-10 pr-3 py-2 border rounded-lg"
          placeholder="Search by policy name, ID, or vehicle number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-5 bg-gray-200 rounded w-32 mb-1"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && policies.length === 0 && (
        <div className="bg-red-50 border rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Policies</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={handleRetry} className="px-4 py-2 bg-red-600 text-white rounded-lg">
            Try Again
          </button>
        </div>
      )}

      {/* Policies Content */}
      {!isLoading && !error && (
        <>
          {filteredPolicies.length > 0 ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Showing {filteredPolicies.length} of {policies.length} policies
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredPolicies.map(policy => (
                  <PurchasedPolicyCard key={policy.id} policy={policy} />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              title="No Policies Found"
              description={
                searchTerm
                  ? "No policies match your search criteria. Try adjusting your search terms."
                  : "You haven't purchased any insurance policies yet."
              }
              actionText={!searchTerm ? "Browse Available Policies" : null}
              actionLink={!searchTerm ? "/dashboard/browse-policies" : null}
            />
          )}
        </>
      )}
    </DashboardLayout>
  );
};