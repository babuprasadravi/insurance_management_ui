import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../layout/DashboardLayout";
import { useClaim } from "../../context/ClaimContext";
import { format } from "date-fns";
import { EmptyState } from "../components/EmptyState";
import { DocumentTextIcon, DocumentArrowUpIcon } from "@heroicons/react/24/outline";
import { customerMenuItems } from "../../constants/data";


export const MyClaims = () => {
  const { claims } = useClaim();
  const navigate = useNavigate();

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
      "Under Review": "bg-amber-50 text-amber-700",
      "Approved": "bg-green-50 text-green-700",
      "Rejected": "bg-red-50 text-red-700",
      "Pending Documentation": "bg-blue-50 text-blue-700"
    };
    
    return statusClasses[status] || "bg-gray-50 text-gray-700";
  };

  return (
    <DashboardLayout menuItems={customerMenuItems} >
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
                </div>
                <div>
                  <p className="text-xs text-gray-500">Incident Date</p>
                  <p className="font-medium">{formatDate(claim.incidentDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Attachments</p>
                  <p className="font-medium">{claim.evidence.length} files</p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-5">
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-sm mt-1 bg-gray-50 p-3 rounded-lg">{claim.description}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end pt-4 border-t border-gray-100">
                <button
                  className="inline-flex items-center text-sm px-4 py-2 text-indigo-600 font-medium border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
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