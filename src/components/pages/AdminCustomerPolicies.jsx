import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { DashboardLayout } from "../layout/DashboardLayout";
import { AdminMenuItems } from "../../constants/data";
import { ClipLoader } from "react-spinners";

export const AdminCustomerPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch applied policies from backend API
  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await axios.get("http://localhost:8084/api/policies/applied-policies");
      setPolicies(response.data);
    } catch (error) {
      let errorMessage = "Failed to fetch customer policies. Please try again.";
      if (error.response?.status === 404) errorMessage = "No customer policies found.";
      else if (error.response?.status === 500) errorMessage = "Server error.";
      else if (error.code === "ECONNREFUSED") errorMessage = "Cannot connect to server.";
      else if (error.response?.data?.message) errorMessage = error.response.data.message;

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Retry fetching policies
  const handleRetry = () => {
    fetchPolicies();
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

  // Fetch policies when component mounts
  useEffect(() => {
    fetchPolicies();
  }, []);

  return (
    <DashboardLayout menuItems={AdminMenuItems}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Customer Policies Management</h1>
        <p className="text-gray-600">View all applied customer insurance policies</p>
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
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Customer Policies</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Policies Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {policies.length > 0 ? (
            <>
              <div className="p-4 border-b">
                <p className="text-sm text-gray-600">
                  Total Applied Policies: {policies.length}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                        ID
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                        Policy Name
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        Premium
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                        License No
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Vehicle Details
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                        Ex-showroom Price
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        Year
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        IDV
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        Term
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Validity Period
                      </th>
                      <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Agent Assigned
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {policies.map((policy) => (
                      <tr key={policy.id} className="hover:bg-gray-50">
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 w-12">
                          {policy.id}
                        </td>
                        <td className="px-2 py-4 text-sm font-medium text-gray-900 w-40">
                          <div className="truncate" title={policy.policyName}>
                            {policy.policyName}
                          </div>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 font-medium w-24">
                          <div className="text-green-600">
                            {formatCurrency(policy.premium)}
                          </div>
                        </td>
                        <td className="px-2 py-4 text-sm text-gray-900 w-28">
                          <div className="truncate font-mono text-xs" title={policy.licenceNo}>
                            {policy.licenceNo}
                          </div>
                        </td>
                        <td className="px-2 py-4 text-sm text-gray-900 w-32">
                          <div className="space-y-1">
                            <div className="font-medium truncate" title={policy.manufacturer}>
                              {policy.manufacturer}
                            </div>
                            <div className="text-xs text-gray-500 truncate" title={policy.model}>
                              {policy.model}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 w-28">
                          <div className="text-xs">
                            {formatCurrency(policy.exshowroomPrice)}
                          </div>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 w-20">
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {policy.yearOfPurchase}
                          </span>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 w-24">
                          <div className="text-xs font-medium text-indigo-600">
                            {formatCurrency(policy.idv)}
                          </div>
                        </td>
                        <td className="px-2 py-4 text-sm text-gray-900 w-20">
                          <div className="truncate text-xs" title={policy.policyTerm}>
                            {policy.policyTerm}
                          </div>
                        </td>
                        <td className="px-2 py-4 text-sm text-gray-900 w-32">
                          <div className="space-y-1">
                            <div className="text-xs">
                              <span className="text-green-600">From:</span> {formatDate(policy.validFrom)}
                            </div>
                            <div className="text-xs">
                              <span className="text-red-600">Until:</span> {formatDate(policy.validUntil)}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-4 text-sm text-gray-900 w-32">
                          <div className="truncate" title={policy.agentAssigned}>
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                              {policy.agentAssigned}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile-friendly cards view for smaller screens */}
              <div className="block md:hidden">
                <div className="p-4 space-y-4">
                  {policies.map((policy) => (
                    <div key={policy.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{policy.policyName}</h3>
                          <p className="text-sm text-gray-500">ID: {policy.id}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{formatCurrency(policy.premium)}</div>
                          <div className="text-xs text-gray-500">{policy.policyTerm}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">License:</span>
                          <div className="font-mono text-xs">{policy.licenceNo}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Vehicle:</span>
                          <div>{policy.manufacturer} {policy.model}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Year:</span>
                          <div>{policy.yearOfPurchase}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">IDV:</span>
                          <div className="font-medium text-indigo-600">{formatCurrency(policy.idv)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Valid From:</span>
                          <div className="text-green-600">{formatDate(policy.validFrom)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Valid Until:</span>
                          <div className="text-red-600">{formatDate(policy.validUntil)}</div>
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <span className="text-gray-500 text-sm">Agent:</span>
                        <div className="font-medium">{policy.agentAssigned}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No Customer Policies Found</h3>
              <p className="text-gray-600">No applied insurance policies are available at the moment.</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};