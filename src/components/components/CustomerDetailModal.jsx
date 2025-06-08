import { useState } from "react";
import {
  XMarkIcon,
  UserIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

export const CustomerDetailModal = ({
  customer,
  isOpen,
  onClose,
  policies,
  claims,
}) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!isOpen || !customer) return null;

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMM, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const getPolicyStatus = (validUntil) => {
    try {
      const endDate = new Date(validUntil);
      const today = new Date();
      return endDate > today ? "Active" : "Expired";
    } catch (error) {
      return "Unknown";
    }
  };

  const calculateTotalClaimAmount = (claimsData) => {
    if (!Array.isArray(claimsData)) return 0;
    return claimsData.reduce((sum, claim) => sum + claim.requestedAmount, 0);
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: UserIcon },
    {
      id: "policies",
      name: "Policies",
      icon: DocumentTextIcon,
      count: policies?.data?.length || 0,
    },
    {
      id: "claims",
      name: "Claims",
      icon: ClipboardDocumentListIcon,
      count: claims?.data?.length || 0,
    },
  ];

  const EmptyState = ({ title, description, icon: Icon }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-gray-50 p-4 mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md">{description}</p>
    </div>
  );

  const LoadingState = () => (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      <span className="ml-3 text-gray-600">Loading...</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 py-8">
        <div
          className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold text-lg">
                  {customer.username
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {customer.username}
                </h2>
                <p className="text-gray-600">Customer ID: {customer.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex-shrink-0 border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        activeTab === tab.id
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-800">
                        Contact Information
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Email
                          </label>
                          <p className="text-gray-800">{customer.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Phone
                          </label>
                          <p className="text-gray-800">
                            {customer.phonenumber}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Address
                          </label>
                          <p className="text-gray-800">{customer.address}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-800">
                        Account Summary
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">
                            Total Policies
                          </span>
                          <span className="text-gray-800 font-semibold">
                            {policies?.data?.length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">
                            Total Premium Amount
                          </span>
                          <span className="text-gray-800 font-semibold">
                            ₹
                            {policies?.data
                              ?.reduce((sum, policy) => sum + policy.premium, 0)
                              ?.toLocaleString() || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">
                            Total Claims
                          </span>
                          <span className="text-gray-800 font-semibold">
                            {Array.isArray(claims?.data)
                              ? claims.data.length
                              : 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">
                            Total Claim Amount
                          </span>
                          <span className="text-gray-800 font-semibold">
                            ₹
                            {calculateTotalClaimAmount(
                              claims?.data
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "policies" && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Policy History
                  </h3>
                  {policies.isLoading ? (
                    <LoadingState />
                  ) : policies.error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="ml-3">
                          <p className="text-sm text-red-700">
                            {policies.error}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : policies.data?.length > 0 ? (
                    <div className="space-y-4">
                      {policies.data.map((policy) => (
                        <div
                          key={policy.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-800">
                                  {policy.policyName}
                                </h4>
                                <span
                                  className={`px-2 py-0.5 text-xs rounded-full ${
                                    getPolicyStatus(policy.validUntil) ===
                                    "Active"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {getPolicyStatus(policy.validUntil)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                Policy ID: {policy.id}
                              </p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              ₹{policy.premium.toLocaleString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Vehicle</span>
                              <p className="font-medium">{policy.vehicle}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">License No</span>
                              <p className="font-medium">{policy.licenceNo}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Valid From</span>
                              <p className="font-medium">{policy.validFrom}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Valid Until</span>
                              <p className="font-medium">{policy.validUntil}</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <span className="text-sm text-gray-500">
                              Agent Assigned:{" "}
                            </span>
                            <span className="text-sm font-medium text-gray-700">
                              {policy.agentAssigned}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No Policies Found"
                      description="This customer hasn't purchased any insurance policies yet."
                      icon={DocumentTextIcon}
                    />
                  )}
                </div>
              )}

              {activeTab === "claims" && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Claims History
                  </h3>
                  {claims.isLoading ? (
                    <LoadingState />
                  ) : claims.error ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{claims.error}</p>
                        </div>
                      </div>
                    </div>
                  ) : claims.data?.length > 0 ? (
                    <div className="space-y-4">
                      {claims.data.map((claim) => (
                        <div
                          key={claim.claimId}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-800">
                                  {claim.policyName}
                                </h4>
                                <span
                                  className={`px-2 py-0.5 text-xs rounded-full ${
                                    claim.status === "FILED"
                                      ? "bg-amber-100 text-amber-800"
                                      : claim.verified
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {claim.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">
                                Claim ID: {claim.claimId} • Policy ID:{" "}
                                {claim.policyId}
                              </p>
                            </div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              ₹{claim.requestedAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            <p className="font-medium mb-1">Description:</p>
                            <p className="bg-gray-50 p-3 rounded-lg">
                              {claim.briefDescription}
                            </p>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
                            <div>
                              <span className="text-gray-500">Filed on: </span>
                              <span className="font-medium">
                                {formatDate(claim.dateFiled)}
                              </span>
                            </div>
                            {claim.verificationComments && (
                              <div className="text-right">
                                <span className="text-gray-500">
                                  Agent Comments:{" "}
                                </span>
                                <span className="font-medium">
                                  {claim.verificationComments}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No Claims Found"
                      description="This customer hasn't filed any claims yet."
                      icon={ClipboardDocumentListIcon}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 px-6 py-6 bg-gray-50">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
