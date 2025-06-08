import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { DashboardLayout } from "../layout/DashboardLayout";
import { PolicyCard } from "../components/PolicyCard";
import { customerMenuItems } from "../../constants/data";
import { ClipLoader } from "react-spinners"; // Third-party spinner

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
      const mappedPolicies = response.data.map(policy => ({
        id: policy.id,
        name: policy.pname,
        type: policy.type,
        premium: policy.premium,
        coverage: policy.coverageDetails,
        validity: policy.validity,
        details: policy.coverageDetails,
      }));

      setPolicies(mappedPolicies);
    } catch (error) {
      let errorMessage = "Failed to fetch policies. Please try again.";
      if (error.response?.status === 404) errorMessage = "No policies found.";
      else if (error.response?.status === 500) errorMessage = "Server error.";
      else if (error.code === "ECONNREFUSED") errorMessage = "Cannot connect to server.";
      else if (error.response?.data?.message) errorMessage = error.response.data.message;

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

  // Handle policy purchase
  const handlePurchasePolicy = (policy) => {
    toast.success(`Initiating purchase for ${policy.name}`);
  };

  // Retry fetching policies
  const handleRetry = () => {
    fetchPolicies();
  };

  return (
    <DashboardLayout menuItems={customerMenuItems}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Browse Available Policies</h1>
        <p>Find the perfect insurance policy for your vehicle</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Filter by:</span>
          <div className="flex space-x-2">
            {["All", "Two-Wheeler", "Four-Wheeler"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                disabled={isLoading}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  filter === type 
                    ? "bg-indigo-600 text-white" 
                    : "bg-gray-50 hover:bg-gray-100"
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
        <div className="flex justify-center items-center py-12">
          <ClipLoader size={50} color="#6366F1" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && policies.length === 0 && (
        <div className="bg-red-50 border rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Policies</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Policy Cards Grid */}
      {!isLoading && !error && (
        <>
          {filteredPolicies.length > 0 ? (
            <>
              <p className="text-sm mb-4">
                Showing {filteredPolicies.length} of {policies.length} policies
                {filter !== "All" && ` for ${filter}`}
              </p>
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
              <h3 className="text-lg font-medium">No Policies Found</h3>
              <p>
                {filter === "All" 
                  ? "No policies are available at the moment." 
                  : `No policies found for ${filter} category.`}
              </p>
              {filter !== "All" && (
                <button
                  onClick={() => setFilter("All")}
                  className="px-4 py-2 text-indigo-600 border rounded-lg hover:bg-indigo-50"
                >
                  View All Policies
                </button>
              )}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};