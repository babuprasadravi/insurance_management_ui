import { useState, useMemo, useEffect } from "react";
import { DashboardLayout } from "../layout/DashboardLayout";
import { AgentMenuItems } from "../../constants/data";
import { useAuth } from "../../context/AuthProvider";
import { ClaimDetailModal } from "../components/ClaimDetailModal";
import { 
  EyeIcon, 
  MagnifyingGlassIcon,
  CheckCircleIcon,
  UserIcon,
  DocumentTextIcon,
  TruckIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

export const ClaimsQueue = () => {
  const { user } = useAuth();
  
  // State management
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("submittedDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  // Helper function to safely parse JSON
  const safeJsonParse = async (response, apiName) => {
    try {
      const text = await response.text();
      if (!text || text.trim() === '') {
        console.warn(`${apiName} returned empty response`);
        return null;
      }
      return JSON.parse(text);
    } catch (error) {
      console.error(`Failed to parse JSON from ${apiName}:`, error);
      throw new Error(`Invalid JSON response from ${apiName}`);
    }
  };

  // Fetch claims data
  useEffect(() => {
    const fetchClaimsData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching claims for agent:', user.id);

        // Get customer IDs for the agent
        const customerResponse = await fetch(`http://localhost:8084/api/policies/agent/${user.id}/customers`);
        if (!customerResponse.ok) {
          throw new Error(`Failed to fetch customers: ${customerResponse.status} ${customerResponse.statusText}`);
        }
        
        const customerData = await safeJsonParse(customerResponse, 'Customer API');
        if (!customerData || !customerData.customerIds) {
          console.log('No customers found for agent');
          setClaims([]);
          return;
        }

        console.log('Found customers:', customerData.customerIds);

        let allClaims = [];

        // Fetch claims for each customer
        for (const customerId of customerData.customerIds) {
          try {
            console.log(`Fetching claims for customer: ${customerId}`);
            
            const claimsResponse = await fetch('http://localhost:8082/api/claims/customer', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ customerId })
            });

            if (!claimsResponse.ok) {
              console.warn(`Failed to fetch claims for customer ${customerId}: ${claimsResponse.status}`);
              continue;
            }

            const customerClaims = await safeJsonParse(claimsResponse, `Claims API (Customer ${customerId})`);
            if (!customerClaims || customerClaims.length === 0) {
              console.log(`No claims found for customer ${customerId}`);
              continue;
            }

            console.log(`Found ${customerClaims.length} claims for customer ${customerId}`);

            // Get customer details
            let customerDetails = { username: `Customer ${customerId}`, email: '' };
            try {
              const customerDetailsResponse = await fetch('http://localhost:8087/auth/getuser', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: customerId })
              });

              if (customerDetailsResponse.ok) {
                const details = await safeJsonParse(customerDetailsResponse, `Auth API (Customer ${customerId})`);
                if (details) {
                  customerDetails = details;
                }
              }
            } catch (error) {
              console.warn(`Failed to fetch customer details for ${customerId}:`, error.message);
            }

            // Get policies for the customer
            let policies = [];
            try {
              const policiesResponse = await fetch(`http://localhost:8084/api/policies/customer/${customerId}`);
              if (policiesResponse.ok) {
                const policiesData = await safeJsonParse(policiesResponse, `Policies API (Customer ${customerId})`);
                if (policiesData) {
                  policies = policiesData;
                }
              }
            } catch (error) {
              console.warn(`Failed to fetch policies for customer ${customerId}:`, error.message);
            }

            // Map and enrich claims data
            const enrichedClaims = customerClaims.map(claim => {
              const policy = policies.find(p => p.id === claim.policyId);
              
              return {
                id: claim.claimId.toString(),
                claimId: claim.claimId,
                policyId: claim.policyId.toString(),
                customerId: claim.customerId,
                customerName: customerDetails.username || `Customer ${customerId}`,
                customerEmail: customerDetails.email || '',
                policyName: claim.policyName || 'Unknown Policy',
                amount: claim.requestedAmount || 0,
                status: (claim.status || 'FILED').toUpperCase(),
                submittedDate: claim.dateFiled || new Date().toISOString().split('T')[0],
                description: claim.briefDescription || 'No description provided',
                vehicleRegNo: policy?.licenceNo || 'N/A',
                vehicle: policy?.vehicle || 'N/A',
                verified: claim.verified || false,
                verificationComments: claim.verificationComments || null
              };
            });

            allClaims = [...allClaims, ...enrichedClaims];
          } catch (error) {
            console.error(`Error processing customer ${customerId}:`, error.message);
            continue;
          }
        }

        console.log('Total claims loaded:', allClaims.length);
        setClaims(allClaims);
      } catch (err) {
        console.error('Error in fetchClaimsData:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchClaimsData();
    }
  }, [user?.id]);

  // Function to update claim status to "UNDER_REVIEW"
  const updateClaimToUnderReview = async (claimId) => {
    try {
      console.log(`Updating claim ${claimId} to UNDER_REVIEW`);
      
      const response = await fetch(`http://localhost:8082/api/claims/${claimId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        // Update the claim status in local state
        setClaims(prevClaims => 
          prevClaims.map(claim => 
            claim.claimId === claimId 
              ? { ...claim, status: 'UNDER_REVIEW' }
              : claim
          )
        );
        console.log(`Successfully updated claim ${claimId} to UNDER_REVIEW`);
      } else {
        console.warn(`Failed to update claim ${claimId} status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error updating claim ${claimId} status:`, error);
    }
  };

  // Filter claims by tab
  const pendingClaims = claims.filter(claim => 
    claim.status === "FILED" || claim.status === "UNDER_REVIEW"
  );
  
  const processedClaims = claims.filter(claim => 
    claim.status === "APPROVED" || claim.status === "REJECTED"
  );

  // Get all claims based on active tab
  const allClaims = activeTab === "pending" ? pendingClaims : processedClaims;

  // Filter and sort claims
  const filteredAndSortedClaims = useMemo(() => {
    let filtered = allClaims.filter(claim => {
      const matchesSearch = !searchTerm || 
        claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.policyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.vehicleRegNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || claim.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort claims
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "customerName":
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        default: // submittedDate
          aValue = new Date(a.submittedDate);
          bValue = new Date(b.submittedDate);
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [allClaims, searchTerm, statusFilter, sortField, sortDirection]);

  // Helper functions
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMM, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      "FILED": "bg-blue-100 text-blue-700 border-blue-200",
      "UNDER_REVIEW": "bg-amber-100 text-amber-700 border-amber-200",
      "APPROVED": "bg-green-100 text-green-700 border-green-200",
      "REJECTED": "bg-red-100 text-red-700 border-red-200"
    };
    return statusClasses[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusDisplayName = (status) => {
    const statusNames = {
      "FILED": "Filed",
      "UNDER_REVIEW": "Under Review",
      "APPROVED": "Approved",
      "REJECTED": "Rejected"
    };
    return statusNames[status] || status;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleViewClaim = async (claim) => {
    // Update claim status to UNDER_REVIEW if it's currently FILED
    if (claim.status === 'FILED') {
      await updateClaimToUnderReview(claim.claimId);
      // Update the claim object with new status for the modal
      claim = { ...claim, status: 'UNDER_REVIEW' };
    }
    
    setSelectedClaim(claim);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClaim(null);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? 
      <ChevronUpIcon className="h-3 w-3" /> : 
      <ChevronDownIcon className="h-3 w-3" />;
  };

  const handleClaimUpdate = (claimId, newStatus) => {
    setClaims(prevClaims => 
      prevClaims.map(claim => 
        claim.claimId === claimId 
          ? { ...claim, status: newStatus }
          : claim
      )
    );
  };


  if (loading) {
    return (
      <DashboardLayout menuItems={AgentMenuItems}>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading claims...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout menuItems={AgentMenuItems}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading claims: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={AgentMenuItems}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Claims Queue</h1>
            <p className="text-sm text-gray-600">Review and process insurance claims</p>
          </div>
          
          {/* Tabs */}
          <div className="mt-2 sm:mt-0">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex text-sm">
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  activeTab === "pending"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Pending ({pendingClaims.length})
              </button>
              <button
                onClick={() => setActiveTab("processed")}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  activeTab === "processed"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Processed ({processedClaims.length})
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center mr-2">
                <DocumentTextIcon className="h-3 w-3 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Claims</p>
                <p className="text-lg font-semibold text-gray-900">{allClaims.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center mr-2">
                <CheckCircleIcon className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Approved</p>
                <p className="text-lg font-semibold text-gray-900">
                  {processedClaims.filter(c => c.status === "APPROVED").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center mr-2">
                <span className="text-indigo-600 font-semibold text-xs">₹</span>
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Amount</p>
                <p className="text-sm font-semibold text-gray-900">
                  ₹{(allClaims.reduce((sum, claim) => sum + claim.amount, 0) / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Search claims by ID, customer, policy, or vehicle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="FILED">Filed</option>
                <option value="UNDER_REVIEW">Under Review</option>
                {activeTab === "processed" && (
                  <>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Claims Table */}
        {filteredAndSortedClaims.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("id")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Claim ID</span>
                        <SortIcon field="id" />
                      </div>
                    </th>
                    <th 
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("customerName")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Customer</span>
                        <SortIcon field="customerName" />
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Policy
                    </th>
                    <th 
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("amount")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Amount</span>
                        <SortIcon field="amount" />
                      </div>
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{claim.id}</div>
                        <div className="text-xs text-gray-500">{formatDate(claim.submittedDate)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <UserIcon className="h-4 w-4 text-indigo-600" />
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{claim.customerName}</div>
                            <div className="text-xs text-gray-500">{claim.customerEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{claim.policyName}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <TruckIcon className="h-3 w-3 mr-1" />
                          {claim.vehicleRegNo}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-semibold text-indigo-600">
                          ₹{(claim.amount / 1000).toFixed(0)}K
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(claim.status)}`}>
                          {getStatusDisplayName(claim.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewClaim(claim)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 transition-colors"
                        >
                          <EyeIcon className="h-3 w-3 mr-1" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <div className="text-center">
              <DocumentTextIcon className="mx-auto h-8 w-8 text-gray-400 mb-3" />
              <h3 className="text-sm font-medium text-gray-800 mb-1">
                {searchTerm || statusFilter !== "all" 
                  ? "No claims found" 
                  : activeTab === "pending" 
                    ? "No pending claims" 
                    : "No processed claims"
                }
              </h3>
              <p className="text-xs text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search criteria"
                  : "All claims have been processed"
                }
              </p>
            </div>
          </div>
        )}

        {/* Claim Detail Modal */}
        <ClaimDetailModal
          claim={selectedClaim}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onClaimUpdate={handleClaimUpdate}
        />
      </div>
    </DashboardLayout>
  );
};