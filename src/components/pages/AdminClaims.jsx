import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { DashboardLayout } from "../layout/DashboardLayout";
import { AdminMenuItems } from "../../constants/data";
import { ClipLoader } from "react-spinners";
import { InformationCircleIcon, CheckCircleIcon, XCircleIcon, ClockIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

export const AdminClaims = () => {
  const [claims, setClaims] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredClaim, setHoveredClaim] = useState(null);
  const [hoveredComments, setHoveredComments] = useState(null);

  // Fetch claims from backend API
  const fetchClaims = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await axios.get("http://localhost:8082/api/claims/myclaims");
      setClaims(response.data);
    } catch (error) {
      let errorMessage = "Failed to fetch claims. Please try again.";
      if (error.response?.status === 404) errorMessage = "No claims found.";
      else if (error.response?.status === 500) errorMessage = "Server error.";
      else if (error.code === "ECONNREFUSED") errorMessage = "Cannot connect to server.";
      else if (error.response?.data?.message) errorMessage = error.response.data.message;

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Retry fetching claims
  const handleRetry = () => {
    fetchClaims();
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format currency with Indian rupee symbol
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Truncate text with length limit
  const truncateText = (text, maxLength = 35) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          icon: CheckCircleIcon
        };
      case 'REJECTED':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          icon: XCircleIcon
        };
      case 'UNDER_REVIEW':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          icon: ClockIcon
        };
      case 'FILED':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          icon: DocumentTextIcon
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          icon: InformationCircleIcon
        };
    }
  };

  // Fetch claims when component mounts
  useEffect(() => {
    fetchClaims();
  }, []);

  return (
    <DashboardLayout menuItems={AdminMenuItems}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Claims Management</h1>
        <p className="text-gray-600">View and manage all insurance claims</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <ClipLoader size={50} color="#6366F1" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && claims.length === 0 && (
        <div className="bg-red-50 border rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Claims</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Claims Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {claims.length > 0 ? (
            <>
              <div className="p-4 border-b">
                <p className="text-sm text-gray-600">
                  Total Claims: {claims.length}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                        Claim ID
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                        Policy Name
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        Date Filed
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                        Requested Amount
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Status
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        Verified
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Brief Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {claims.map((claim) => {
                      const statusBadge = getStatusBadge(claim.status);
                      const StatusIcon = statusBadge.icon;
                      
                      return (
                        <tr key={claim.claimId} className="hover:bg-gray-50">
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 w-16">
                            {claim.claimId}
                          </td>
                          <td className="px-3 py-4 text-sm font-medium text-gray-900 w-48">
                            <div className="truncate" title={claim.policyName}>
                              {claim.policyName}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 w-24">
                            {formatDate(claim.dateFiled)}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 font-medium w-28">
                            <div className="text-indigo-600">
                              {formatCurrency(claim.requestedAmount)}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 w-32 relative">
                            <div className="space-y-1">
                              <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {claim.status.replace('_', ' ')}
                              </span>
                              
                              {/* Verification Comments */}
                              {claim.verificationComments && (
                                <div
                                  className="cursor-help flex items-center space-x-1"
                                  onMouseEnter={() => setHoveredComments(claim.claimId)}
                                  onMouseLeave={() => setHoveredComments(null)}
                                >
                                  <InformationCircleIcon className="h-4 w-4 text-orange-500" />
                                  <span className="text-xs text-orange-600">Comments</span>
                                </div>
                              )}
                              
                              {/* Comments Tooltip */}
                              {hoveredComments === claim.claimId && claim.verificationComments && (
                                <div className="absolute z-20 bg-gray-900 text-white text-xs rounded-lg p-3 max-w-sm left-0 top-full mt-2 shadow-lg">
                                  <div className="font-medium mb-1">Verification Comments:</div>
                                  <div className="break-words">{claim.verificationComments}</div>
                                  <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 w-20">
                            <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                              claim.verified 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {claim.verified ? (
                                <>
                                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                                  Yes
                                </>
                              ) : (
                                <>
                                  <XCircleIcon className="h-3 w-3 mr-1" />
                                  No
                                </>
                              )}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900 relative min-w-0 flex-1">
                            <div 
                              className="truncate cursor-help flex items-center space-x-1 max-w-xs"
                              onMouseEnter={() => setHoveredClaim(claim.claimId)}
                              onMouseLeave={() => setHoveredClaim(null)}
                            >
                              <span className="truncate">{truncateText(claim.briefDescription)}</span>
                              <InformationCircleIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            </div>
                            
                            {/* Description Tooltip */}
                            {hoveredClaim === claim.claimId && (
                              <div className="absolute z-20 bg-gray-900 text-white text-xs rounded-lg p-3 max-w-sm left-0 top-full mt-2 shadow-lg">
                                <div className="font-medium mb-1">Full Description:</div>
                                <div className="break-words">{claim.briefDescription}</div>
                                <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile-friendly cards view */}
              <div className="block md:hidden">
                <div className="p-4 space-y-4">
                  {claims.map((claim) => {
                    const statusBadge = getStatusBadge(claim.status);
                    const StatusIcon = statusBadge.icon;
                    
                    return (
                      <div key={claim.claimId} className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{claim.policyName}</h3>
                            <p className="text-sm text-gray-500">Claim ID: {claim.claimId}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-indigo-600">{formatCurrency(claim.requestedAmount)}</div>
                            <div className="text-xs text-gray-500">{formatDate(claim.dateFiled)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${statusBadge.bg} ${statusBadge.text}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {claim.status.replace('_', ' ')}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                            claim.verified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {claim.verified ? 'Verified' : 'Not Verified'}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Description:</span>
                          <p className="mt-1">{claim.briefDescription}</p>
                        </div>
                        
                        {claim.verificationComments && (
                          <div className="text-sm bg-orange-50 p-2 rounded border-l-4 border-orange-200">
                            <span className="font-medium text-orange-800">Comments:</span>
                            <p className="text-orange-700 mt-1">{claim.verificationComments}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No Claims Found</h3>
              <p className="text-gray-600">No insurance claims are available at the moment.</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};