import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { ClipLoader } from "react-spinners"; // Import spinner from react-spinners

import { DashboardLayout } from "../layout/DashboardLayout";
import { EmptyState } from "../components/EmptyState";
import { useAuth } from "../../context/AuthProvider";
import { customerMenuItems } from "../../constants/data";

export const MyClaims = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

      const [claimsResponse, policiesResponse] = await Promise.all([
        axios.post("http://localhost:8082/api/claims/customer", { customerId: user.id }),
        axios.get(`http://localhost:8084/api/policies/customer/${user.id}`)
      ]);

      const claimsData = claimsResponse.data || [];
      const policiesData = policiesResponse.data || [];

      const mappedClaims = claimsData.map((claim) => {
        const matchingPolicy = policiesData.find((policy) => policy.id === claim.policyId);
        return {
          id: claim.claimId,
          policyDetails: {
            id: claim.policyId,
            name: claim.policyName,
            vehicleRegNo: matchingPolicy?.licenceNo || "N/A",
            vehicle: matchingPolicy?.vehicle || "N/A",
          },
          createdAt: claim.dateFiled,
          incidentDate: claim.dateFiled,
          claimAmount: claim.requestedAmount,
          description: claim.briefDescription,
          status: claim.status,
          verified: claim.verified,
          agentDetails: matchingPolicy
            ? { id: matchingPolicy.agentId, name: matchingPolicy.agentAssigned, assigned: true }
            : { id: claim.agentId, assigned: false },
        };
      });

      setClaims(mappedClaims);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch claims and policies. Please try again.");
      toast.error("Failed to fetch claims and policies. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMM, yyyy");
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      "FILED": "bg-blue-50 text-blue-700",
      "Under Review": "bg-amber-50 text-amber-700",
      "Approved": "bg-green-50 text-green-700",
      "Rejected": "bg-red-50 text-red-700",
    };
    return statusClasses[status] || "bg-gray-50 text-gray-700";
  };

  const renderAgentInfo = (claim) => {
    const { agentDetails } = claim;
    if (agentDetails.assigned && agentDetails.name) {
      return <div>Assigned to {agentDetails.name} (ID: {agentDetails.id})</div>;
    } else if (agentDetails.id) {
      return <div>Assigned to Agent ID: {agentDetails.id} (Name pending)</div>;
    } else {
      return <div>No agent assigned</div>;
    }
  };

  // Loading state with spinner
  if (isLoading) {
    return (
      <DashboardLayout menuItems={customerMenuItems}>
        <div className="flex flex-col items-center justify-center h-full">
          <ClipLoader size={50} color="#4F46E5" /> {/* Spinner */}
          <p className="mt-4 text-gray-600">Loading claims...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error && claims.length === 0) {
    return (
      <DashboardLayout menuItems={customerMenuItems}>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Error Loading Claims</h1>
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

  // Claims list
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
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(claim.status)}`}>
                    {claim.status}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-gray-800">Claim #{claim.id}</h3>
                  <p className="text-sm text-gray-500">Submitted on {formatDate(claim.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-500">Claim Amount</p>
                  <p className="text-xl font-bold text-indigo-600">₹{parseInt(claim.claimAmount).toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <p className="text-xs text-gray-500">Policy</p>
                  <p className="font-medium">{claim.policyDetails.name}</p>
                  <p className="text-sm text-gray-500">ID: {claim.policyDetails.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Vehicle</p>
                  <p className="font-medium">{claim.policyDetails.vehicleRegNo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Incident Date</p>
                  <p className="font-medium">{formatDate(claim.incidentDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Verification Status</p>
                  <p className="font-medium">
                    {claim.verified ? <span className="text-green-600">Verified</span> : <span className="text-amber-600">Pending</span>}
                  </p>
                </div>
              </div>
              <div className="mb-5">
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-sm mt-1 bg-gray-50 p-3 rounded-lg">{claim.description}</p>
              </div>
              {renderAgentInfo(claim)}
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