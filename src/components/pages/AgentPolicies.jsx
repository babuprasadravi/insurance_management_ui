import { useState } from "react";
import { DashboardLayout } from "../layout/DashboardLayout";
import { AgentMenuItems } from "../../constants/data";
import { useAgent } from "../../context/AgentContext";
import { 
  EyeIcon, 
  ArrowPathIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  UserIcon,
  TruckIcon
} from "@heroicons/react/24/outline";
import { format, isAfter } from "date-fns";
import { toast } from "react-hot-toast";

export const AgentPolicies = () => {
  const { assignedPolicies } = useAgent();
  const [searchTerm, setSearchTerm] = useState("");

  // Auto-determine status based on validity end date
  const getPolicyStatus = (policy) => {
    const today = new Date();
    const expiryDate = new Date(policy.validityEnd);
    
    if (isAfter(today, expiryDate)) {
      return "Expired";
    }
    return policy.status || "Active";
  };

  // Filter policies based on search term
  const filteredPolicies = assignedPolicies.filter(policy => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      policy.name.toLowerCase().includes(searchLower) ||
      policy.id.toLowerCase().includes(searchLower) ||
      policy.vehicleRegNo.toLowerCase().includes(searchLower) ||
      policy.customerName.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMM, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      Active: "bg-green-100 text-green-700 border-green-200",
      Expired: "bg-red-100 text-red-700 border-red-200",
      "Pending Renewal": "bg-amber-100 text-amber-700 border-amber-200",
    };
    
    return statusClasses[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const handleViewPolicy = (policy) => {
    toast.success(`Viewing policy details for ${policy.name}`);
    // TODO: Navigate to policy details or open modal
  };

  const handleRenewPolicy = (policy) => {
    toast.success(`Initiating renewal process for ${policy.customerName}'s policy`);
    // TODO: Navigate to renewal form
  };

  const getExpiryWarning = (validityEnd) => {
    const today = new Date();
    const expiryDate = new Date(validityEnd);
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return null;
    if (diffDays <= 30) {
      return {
        message: `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}`,
        className: "text-amber-600 bg-amber-50 border-amber-200"
      };
    }
    return null;
  };

  return (
    <DashboardLayout menuItems={AgentMenuItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Agent Policies</h1>
            <p className="text-gray-600 mt-1">Manage policies assigned to your customers</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <div className="bg-blue-50 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-blue-700">
                Total: {assignedPolicies.length} Policies
              </span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Search by policy ID, customer name, or vehicle registration..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Policies Grid */}
        {filteredPolicies.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPolicies.map((policy) => {
              const status = getPolicyStatus(policy);
              const expiryWarning = getExpiryWarning(policy.validityEnd);
              
              return (
                <div key={policy.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                  {/* Policy Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(status)}`}>
                            {status}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            policy.type === "Two-Wheeler" 
                              ? "bg-emerald-100 text-emerald-700" 
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {policy.type}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {policy.name}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center">
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          Policy ID: {policy.id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Premium Amount</p>
                        <p className="text-xl font-bold text-indigo-600">
                          ₹{policy.premiumPaid.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Expiry Warning */}
                    {expiryWarning && (
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${expiryWarning.className} mb-4`}>
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {expiryWarning.message}
                      </div>
                    )}
                  </div>

                  {/* Policy Details */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      {/* Customer Info */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center">
                          <UserIcon className="h-3 w-3 mr-1" />
                          Customer
                        </p>
                        <p className="font-medium text-gray-800">{policy.customerName}</p>
                        <p className="text-sm text-gray-600">{policy.customerEmail}</p>
                      </div>

                      {/* Vehicle Info */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center">
                          <TruckIcon className="h-3 w-3 mr-1" />
                          Vehicle Details
                        </p>
                        <p className="font-medium text-gray-800">{policy.vehicleRegNo}</p>
                        <p className="text-sm text-gray-600">
                          {policy.manufacturer} {policy.model}
                        </p>
                      </div>

                      {/* Validity Period */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          Valid From
                        </p>
                        <p className="font-medium text-gray-800">
                          {formatDate(policy.validityStart)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          Valid Until
                        </p>
                        <p className={`font-medium ${status === 'Expired' ? 'text-red-600' : 'text-gray-800'}`}>
                          {formatDate(policy.validityEnd)}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => handleViewPolicy(policy)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 hover:border-indigo-300 transition-colors"
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View Policy
                      </button>
                      
                      <button 
                        onClick={() => handleRenewPolicy(policy)}
                        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          status === 'Expired' || expiryWarning
                            ? 'text-white bg-amber-600 hover:bg-amber-700 border border-amber-600'
                            : 'text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        Renew Policy
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
            <div className="text-center">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                {searchTerm ? "No policies found" : "No policies assigned yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? "Try adjusting your search criteria" 
                  : "Start by creating policies for your assigned customers"}
              </p>
              {!searchTerm && (
                <button 
                  onClick={() => window.location.href = '/agentDashboard/create-policy'}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create New Policy
                </button>
              )}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {filteredPolicies.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Portfolio Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">
                  {filteredPolicies.filter(p => getPolicyStatus(p) === 'Active').length}
                </p>
                <p className="text-sm text-gray-600">Active Policies</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {filteredPolicies.filter(p => getPolicyStatus(p) === 'Expired').length}
                </p>
                <p className="text-sm text-gray-600">Expired Policies</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {filteredPolicies.filter(p => getExpiryWarning(p.validityEnd)).length}
                </p>
                <p className="text-sm text-gray-600">Expiring Soon</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  ₹{filteredPolicies.reduce((sum, p) => sum + p.premiumPaid, 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Premium</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};