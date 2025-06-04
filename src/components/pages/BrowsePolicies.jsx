import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { DashboardLayout } from "../layout/DashboardLayout";
import { PolicyCard } from "../components/PolicyCard";
import { customerMenuItems } from "../../constants/data";

export const BrowsePolicies = () => {
  const [filter, setFilter] = useState("All");
  const [policies, setPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch policies from backend API
  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await axios.get("http://localhost:8084/api/policies");
      
      console.log("Policies API Response:", response.data);

      // Map API response to frontend format
      const mappedPolicies = response.data.map(policy => ({
        id: policy.id,
        name: policy.pname, // Map pname to name
        type: policy.type,
        premium: policy.premium,
        coverage: policy.coverageDetails, // Map coverageDetails to coverage
        validity: policy.validity,
        details: policy.coverageDetails // Use coverageDetails for details as well
      }));

      setPolicies(mappedPolicies);
    } catch (error) {
      console.error("Error fetching policies:", error);
      
      let errorMessage = "Failed to fetch policies. Please try again.";
      
      if (error.response?.status === 404) {
        errorMessage = "No policies found.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = "Cannot connect to server. Please check if the backend is running.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch policies when component mounts
  useEffect(() => {
    fetchPolicies();
  }, []);

  // Filter policies by type
  const filteredPolicies = filter === "All" 
    ? policies 
    : policies.filter(policy => policy.type === filter);

  const handlePurchasePolicy = (policy) => {
    // In a real app, this would navigate to a purchase flow
    toast.success(`Initiating purchase for ${policy.name}`);
  };

  // Retry function for error state
  const handleRetry = () => {
    fetchPolicies();
  };

  return (
    <DashboardLayout menuItems={customerMenuItems}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Browse Available Policies</h1>
        <p className="text-gray-600">Find the perfect insurance policy for your vehicle</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-100">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          <div className="flex space-x-2">
            {["All", "Two-Wheeler", "Four-Wheeler"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                disabled={isLoading}
                className={`px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  filter === type 
                    ? "bg-indigo-600 text-white" 
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
                      <div className="h-5 bg-gray-200 rounded w-32 mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                      <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-28"></div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <div className="h-9 bg-gray-200 rounded w-24"></div>
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

      {/* Policy Cards Grid */}
      {!isLoading && !error && (
        <>
          {filteredPolicies.length > 0 ? (
            <>
              {/* Results count */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Showing {filteredPolicies.length} of {policies.length} policies
                  {filter !== "All" && ` for ${filter}`}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPolicies.map((policy) => (
                  <PolicyCard
                    key={policy.id}
                    policy={policy}
                    onPurchase={handlePurchasePolicy}
                  />
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
                  {filter === "All" 
                    ? "No policies are available at the moment." 
                    : `No policies found for ${filter} category.`
                  }
                </p>
                {filter !== "All" && (
                  <button
                    onClick={() => setFilter("All")}
                    className="px-4 py-2 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    View All Policies
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