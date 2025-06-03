import { useState, useMemo } from "react";
import { DashboardLayout } from "../layout/DashboardLayout";
import { AgentMenuItems } from "../../constants/data";
import { useAgent } from "../../context/AgentContext";
import { ClaimDetailModal } from "../components/ClaimDetailModal";
import { 
  EyeIcon, 
  MagnifyingGlassIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserIcon,
  DocumentTextIcon,
  TruckIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

export const ClaimsQueue = () => {
  const { pendingClaims, processedClaims, approveClaim, rejectClaim } = useAgent();
  
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortField, setSortField] = useState("submittedDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

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
      const matchesPriority = priorityFilter === "all" || claim.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sort claims
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "priority":
          const priorityOrder = { "High": 3, "Medium": 2, "Low": 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case "customerName":
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        case "incidentDate":
          aValue = new Date(a.incidentDate);
          bValue = new Date(b.incidentDate);
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
  }, [allClaims, searchTerm, statusFilter, priorityFilter, sortField, sortDirection]);

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
      "Under Review": "bg-amber-100 text-amber-700 border-amber-200",
      "Approved": "bg-green-100 text-green-700 border-green-200",
      "Rejected": "bg-red-100 text-red-700 border-red-200"
    };
    return statusClasses[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      "High": "bg-red-100 text-red-700 border-red-200",
      "Medium": "bg-amber-100 text-amber-700 border-amber-200",
      "Low": "bg-green-100 text-green-700 border-green-200"
    };
    return priorityClasses[priority] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "High":
        return <ExclamationTriangleIcon className="h-3 w-3 text-red-600" />;
      case "Medium":
        return <span className="h-3 w-3 bg-amber-500 rounded-full inline-block" />;
      case "Low":
        return <CheckCircleIcon className="h-3 w-3 text-green-600" />;
      default:
        return null;
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleViewClaim = (claim) => {
    setSelectedClaim(claim);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClaim(null);
  };

  const handleApproveClaim = (claimId, notes) => {
    approveClaim(claimId, notes);
  };

  const handleRejectClaim = (claimId, notes) => {
    rejectClaim(claimId, notes);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? 
      <ChevronUpIcon className="h-3 w-3" /> : 
      <ChevronDownIcon className="h-3 w-3" />;
  };

  return (
    <DashboardLayout menuItems={AgentMenuItems}>
      <div className="space-y-4">
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Claims Queue</h1>
            <p className="text-sm text-gray-600">Review and process insurance claims</p>
          </div>
          
          {/* Compact Tabs */}
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

        {/* Compact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center mr-2">
                <DocumentTextIcon className="h-3 w-3 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-lg font-semibold text-gray-900">{allClaims.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center mr-2">
                <ExclamationTriangleIcon className="h-3 w-3 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">High Priority</p>
                <p className="text-lg font-semibold text-gray-900">
                  {allClaims.filter(c => c.priority === "High").length}
                </p>
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
                  {processedClaims.filter(c => c.status === "Approved").length}
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
                <p className="text-xs text-gray-600">Amount</p>
                <p className="text-sm font-semibold text-gray-900">
                  ₹{(allClaims.reduce((sum, claim) => sum + claim.amount, 0) / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Search claims..."
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
                <option value="Under Review">Under Review</option>
                {activeTab === "processed" && (
                  <>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compact Claims Table */}
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
                      Priority
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
                          {claim.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(claim.priority)}`}>
                          {getPriorityIcon(claim.priority)}
                          <span className="ml-1">{claim.priority}</span>
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
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all" 
                  ? "No claims found" 
                  : activeTab === "pending" 
                    ? "No pending claims" 
                    : "No processed claims"
                }
              </h3>
              <p className="text-xs text-gray-600">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
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
          onApprove={handleApproveClaim}
          onReject={handleRejectClaim}
        />
      </div>
    </DashboardLayout>
  );
};