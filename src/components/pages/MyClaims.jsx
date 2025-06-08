import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { DocumentTextIcon, DocumentArrowUpIcon } from "@heroicons/react/24/outline";

import { DashboardLayout } from "../layout/DashboardLayout";
import { EmptyState } from "../components/EmptyState";
import { useAuth } from "../../context/AuthProvider";
import { customerMenuItems } from "../../constants/data";

export const MyClaims = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [error, setError] = useState("");

  // Fetch claims and policies data
  const fetchData = async () => {
    if (!user?.id) {
      setError("User not authenticated");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Fetch both claims and policies concurrently
      const [claimsResponse, policiesResponse] = await Promise.all([
        axios.post(
          "http://localhost:8082/api/claims/customer",
          {
            customerId: user.id
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        ),
        axios.get(`http://localhost:8084/api/policies/customer/${user.id}`)
      ]);

      console.log("Claims API Response:", claimsResponse.data);
      console.log("Policies API Response:", policiesResponse.data);

      // Store policies data for agent matching
      setPolicies(policiesResponse.data || []);

      // Check if claims response is empty or null
      const claimsData = claimsResponse.data;
      if (!claimsData || claimsData.length === 0) {
        setClaims([]);
        setIsLoading(false);
        return;
      }

      // Map claims data and enhance with agent details
      const mappedClaims = claimsData.map(claim => {
        // Find matching policy for this claim
        const matchingPolicy = (policiesResponse.data || []).find(
          policy => policy.id === claim.policyId
        );

        return {
          id: claim.claimId,
          policyId: claim.policyId,
          policyDetails: {
            id: claim.policyId,
            name: claim.policyName,
            // Get real vehicle details from matching policy if available
            vehicleRegNo: matchingPolicy?.licenceNo || "N/A",
            vehicle: matchingPolicy?.vehicle || "N/A",
            type: "Motor Insurance"
          },
          // Use dateFiled from API as createdAt
          createdAt: claim.dateFiled,
          // Use dateFiled as incident date placeholder
          incidentDate: claim.dateFiled,
          claimAmount: claim.requestedAmount,
          description: claim.briefDescription,
          status: claim.status,
          verified: claim.verified,
          agentId: claim.agentId,
          verificationComments: claim.verificationComments,
          // Enhanced agent details from policies
          agentDetails: matchingPolicy ? {
            id: matchingPolicy.agentId,
            name: matchingPolicy.agentAssigned,
            assigned: true
          } : {
            id: claim.agentId,
            name: null,
            assigned: false
          }
        };
      });

      setClaims(mappedClaims);
    } catch (error) {
      console.error("Error fetching data:", error);
      
      let errorMessage = "Failed to fetch claims and policies. Please try again.";
      
      if (error.response?.status === 400) {
        errorMessage = "Invalid request. Please check your account details.";
      } else if (error.response?.status === 404) {
        // Handle 404 as empty state instead of error
        setClaims([]);
        setIsLoading(false);
        return;
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = "Cannot connect to server. Please check if the backend is running.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when component mounts or user changes
  useEffect(() => {
    fetchData();
  }, [user?.id]);

  // Function to format date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMM, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  // Function to get status badge styles
  const getStatusBadge = (status) => {
    const statusClasses = {
      "FILED": "bg-blue-50 text-blue-700",
      "Under Review": "bg-amber-50 text-amber-700",
      "Approved": "bg-green-50 text-green-700",
      "Rejected": "bg-red-50 text-red-700",
      "Pending Documentation": "bg-blue-50 text-blue-700"
    };
    
    return statusClasses[status] || "bg-gray-50 text-gray-700";
  };

  // Function to render agent information
  const renderAgentInfo = (claim) => {
    const { agentDetails } = claim;
    
    if (agentDetails.assigned && agentDetails.name) {
      return (
        <div className="text-sm text-gray-500">
          <span className="inline-flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            Assigned to <span className="font-medium text-gray-700 ml-1">{agentDetails.name}</span>
            <span className="text-gray-400 ml-1">(ID: {agentDetails.id})</span>
          </span>
        </div>
      );
    } else if (agentDetails.id) {
      return (
        <div className="text-sm text-gray-500">
          <span className="inline-flex items-center">
            <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
            Assigned to Agent ID: {agentDetails.id}
            <span className="text-xs text-amber-600 ml-2">(Name pending)</span>
          </span>
        </div>
      );
    } else {
      return (
        <div className="text-sm text-gray-500">
          <span className="inline-flex items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            No agent assigned
          </span>
        </div>
      );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout menuItems={customerMenuItems}>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">My Claims</h1>
            <p className="text-gray-600">Track and manage your insurance claims</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/file-claim")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span>File New Claim</span>
          </button>
        </div>

        {/* Loading Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-5 bg-gray-200 rounded w-32 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-40"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j}>
                      <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  ))}
                </div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error && claims.length === 0) {
    return (
      <DashboardLayout menuItems={customerMenuItems}>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">My Claims</h1>
            <p className="text-gray-600">Track and manage your insurance claims</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/file-claim")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span>File New Claim</span>
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Claims</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={customerMenuItems}>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">My Claims</h1>
          <p className="text-gray-600">Track and manage your insurance claims</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/file-claim")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
        >
          <DocumentTextIcon className="h-5 w-5" />
          <span>File New Claim</span>
        </button>
      </div>

      {claims.length > 0 ? (
        <div className="space-y-6">
          {claims.map((claim) => (
            <div key={claim.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              {/* Claim Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(claim.status)}`}>
                    {claim.status}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-gray-800">
                    Claim #{claim.id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Submitted on {formatDate(claim.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-500">Claim Amount</p>
                  <p className="text-xl font-bold text-indigo-600">₹{parseInt(claim.claimAmount).toLocaleString()}</p>
                </div>
              </div>

              {/* Policy & Incident Details */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <p className="text-xs text-gray-500">Policy</p>
                  <p className="font-medium">{claim.policyDetails.name}</p>
                  <p className="text-sm text-gray-500">ID: {claim.policyDetails.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Vehicle</p>
                  <p className="font-medium">{claim.policyDetails.vehicleRegNo}</p>
                  {claim.policyDetails.vehicle && claim.policyDetails.vehicle !== "N/A" && (
                    <p className="text-sm text-gray-500">{claim.policyDetails.vehicle}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Incident Date</p>
                  <p className="font-medium">{formatDate(claim.incidentDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Verification Status</p>
                  <p className="font-medium">
                    {claim.verified ? (
                      <span className="text-green-600">Verified</span>
                    ) : (
                      <span className="text-amber-600">Pending</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-5">
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-sm mt-1 bg-gray-50 p-3 rounded-lg">{claim.description}</p>
              </div>

              {/* Verification Comments (if any) */}
              {claim.verificationComments && (
                <div className="mb-5">
                  <p className="text-xs text-gray-500">Verification Comments</p>
                  <p className="text-sm mt-1 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    {claim.verificationComments}
                  </p>
                </div>
              )}

              {/* Enhanced Agent Information Section */}
              <div className="mb-5 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600 font-medium mb-2">AGENT ASSIGNMENT</p>
                {renderAgentInfo(claim)}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                <button
                  className="inline-flex items-center text-sm px-4 py-2 text-indigo-600 font-medium border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                  onClick={() => {
                    // Future: Navigate to claim details page
                    toast.info("Claim details view coming soon!");
                  }}
                >
                  <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No claims found"
          description="You haven't filed any insurance claims yet"
          actionText="File a Claim"
          actionLink="/dashboard/file-claim"
        />
      )}
    </DashboardLayout>
  );
};