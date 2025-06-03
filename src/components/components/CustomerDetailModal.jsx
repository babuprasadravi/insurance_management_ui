import { useState } from "react";
import { XMarkIcon, UserIcon, DocumentTextIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";

export const CustomerDetailModal = ({ customer, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMM, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      "Active": "bg-green-50 text-green-700 border-green-200",
      "Expired": "bg-red-50 text-red-700 border-red-200",
      "Under Review": "bg-amber-50 text-amber-700 border-amber-200",
      "Approved": "bg-green-50 text-green-700 border-green-200",
      "Rejected": "bg-red-50 text-red-700 border-red-200",
      "Pending Documentation": "bg-blue-50 text-blue-700 border-blue-200"
    };
    
    return statusClasses[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: UserIcon },
    { id: "policies", name: "Policies", icon: DocumentTextIcon, count: customer.policies?.length || 0 },
    { id: "claims", name: "Claims", icon: ClipboardDocumentListIcon, count: customer.claims?.length || 0 }
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 py-8">
        <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
          {/* Header - Fixed */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold text-lg">
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{customer.name}</h2>
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

          {/* Tabs - Fixed */}
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
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.id ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-800">Contact Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-gray-800">{customer.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone</label>
                          <p className="text-gray-800">{customer.phone}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Address</label>
                          <p className="text-gray-800">{customer.address}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-800">Account Summary</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Total Policies</span>
                          <span className="text-gray-800 font-semibold">{customer.policies?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Total Claims</span>
                          <span className="text-gray-800 font-semibold">{customer.claims?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Active Policies</span>
                          <span className="text-gray-800 font-semibold">
                            {customer.policies?.filter(p => p.status === "Active").length || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "policies" && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Policy History</h3>
                  {customer.policies && customer.policies.length > 0 ? (
                    <div className="space-y-4">
                      {customer.policies.map((policy) => (
                        <div key={policy.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-800">{policy.name}</h4>
                              <p className="text-sm text-gray-500">Policy ID: {policy.id}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(policy.status)}`}>
                              {policy.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Type</span>
                              <p className="font-medium">{policy.type}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Vehicle</span>
                              <p className="font-medium">{policy.vehicleRegNo}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Valid Until</span>
                              <p className="font-medium">{formatDate(policy.validityEnd)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Premium</span>
                              <p className="font-medium">₹{policy.premiumPaid?.toLocaleString()}</p>
                            </div>
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
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Claims History</h3>
                  {customer.claims && customer.claims.length > 0 ? (
                    <div className="space-y-4">
                      {customer.claims.map((claim) => (
                        <div key={claim.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-800">Claim #{claim.id}</h4>
                              <p className="text-sm text-gray-500">Policy: {claim.policyId}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(claim.status)}`}>
                              {claim.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-500">Claim Amount</span>
                              <p className="font-medium">₹{claim.amount?.toLocaleString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Incident Date</span>
                              <p className="font-medium">{formatDate(claim.incidentDate)}</p>
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Description</span>
                            <p className="text-sm mt-1 bg-gray-50 p-2 rounded">{claim.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No Claims Found"
                      description="This customer hasn't filed any insurance claims yet."
                      icon={ClipboardDocumentListIcon}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer - Fixed with more margin */}
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