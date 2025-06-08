import { useState } from "react";
import { 
  XMarkIcon, 
  DocumentTextIcon, 
  CalendarIcon, 
  UserIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  CloudIcon,
  ClockIcon,
  ShieldCheckIcon,
  EyeIcon,
  PencilIcon
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { toast } from "react-hot-toast";

export const ClaimDetailModal = ({ claim, isOpen, onClose, onApprove, onReject, onClaimUpdate }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [actionNotes, setActionNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !claim) return null;

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMM, yyyy 'at' HH:mm");
    } catch (error) {
      return dateString;
    }
  };

  const formatSimpleDate = (dateString) => {
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

  const handleApprove = async () => {
    if (!actionNotes.trim()) {
      toast.error("Please add notes before approving the claim");
      return;
    }
    
    setIsProcessing(true);
    try {
      console.log(`Approving claim ${claim.claimId}`);
      
      const response = await fetch(`http://localhost:8082/api/claims/${claim.claimId}/decision`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision: "APPROVED",
          reason: actionNotes.trim()
        })
      });

      if (response.ok) {
        toast.success("Claim approved successfully!");
        
        // Update the claim in parent component
        if (onClaimUpdate) {
          onClaimUpdate(claim.claimId, 'APPROVED');
        }
        
        // Call the onApprove callback if provided
        if (onApprove) {
          onApprove(claim.id, actionNotes);
        }
        
        onClose();
      } else {
        const errorText = await response.text();
        console.error(`Failed to approve claim: ${response.status} - ${errorText}`);
        toast.error(`Failed to approve claim: ${response.status}`);
      }
    } catch (error) {
      console.error('Error approving claim:', error);
      toast.error("Failed to approve claim");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!actionNotes.trim()) {
      toast.error("Please add notes before rejecting the claim");
      return;
    }
    
    setIsProcessing(true);
    try {
      console.log(`Rejecting claim ${claim.claimId}`);
      
      const response = await fetch(`http://localhost:8082/api/claims/${claim.claimId}/decision`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision: "REJECTED",
          reason: actionNotes.trim()
        })
      });

      if (response.ok) {
        toast.success("Claim rejected successfully!");
        
        // Update the claim in parent component
        if (onClaimUpdate) {
          onClaimUpdate(claim.claimId, 'REJECTED');
        }
        
        // Call the onReject callback if provided
        if (onReject) {
          onReject(claim.id, actionNotes);
        }
        
        onClose();
      } else {
        const errorText = await response.text();
        console.error(`Failed to reject claim: ${response.status} - ${errorText}`);
        toast.error(`Failed to reject claim: ${response.status}`);
      }
    } catch (error) {
      console.error('Error rejecting claim:', error);
      toast.error("Failed to reject claim");
    } finally {
      setIsProcessing(false);
    }
  };

  const canTakeAction = (claim.status === "FILED" || claim.status === "UNDER_REVIEW");

  const tabs = [
    { id: "overview", name: "Overview", icon: DocumentTextIcon },
    { id: "incident", name: "Incident", icon: ExclamationTriangleIcon },
    ...(canTakeAction ? [{ id: "action", name: "Action", icon: PencilIcon }] : [])
  ];

  // Safe formatting function for numbers
  const formatAmount = (amount) => {
    const num = Number(amount);
    return isNaN(num) ? "0" : num.toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 py-8">
        <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
          {/* Header - Fixed */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Claim {claim.id}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(claim.status)}`}>
                    {claim.status}
                  </span>
                </div>
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
                  {/* Claim Summary */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-100">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Claim Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Claim Amount</p>
                        <p className="text-2xl font-bold text-indigo-600">₹{formatAmount(claim.amount)}</p>
                        {claim.estimatedAmount && claim.estimatedAmount !== claim.amount && (
                          <p className="text-sm text-gray-500">Est: ₹{formatAmount(claim.estimatedAmount)}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date Filed</p>
                        <p className="text-lg font-semibold text-gray-800">{formatSimpleDate(claim.submittedDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Incident Date</p>
                        <p className="text-lg font-semibold text-gray-800">{formatSimpleDate(claim.incidentDate || claim.submittedDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-800">Customer Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Name</label>
                          <p className="text-gray-800">{claim.customerName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email</label>
                          <p className="text-gray-800">{claim.customerEmail || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Customer ID</label>
                          <p className="text-gray-800">{claim.customerId || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Policy Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-800">Policy Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Policy Name</label>
                          <p className="text-gray-800">{claim.policyName || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Policy ID</label>
                          <p className="text-gray-800">{claim.policyId || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Vehicle Registration</label>
                          <p className="text-gray-800">{claim.vehicleRegNo || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Vehicle</label>
                          <p className="text-gray-800">{claim.vehicle || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Agent Information */}
                  {(claim.agentName || claim.agentId) && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-800">Assigned Agent</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Agent Name</label>
                            <p className="text-gray-800">{claim.agentName || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">Agent ID</label>
                            <p className="text-gray-800">{claim.agentId || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800">Timeline</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>• Submitted: {formatDate(claim.submittedDate)}</p>
                        {claim.lastUpdated && (
                          <p>• Last Updated: {formatDate(claim.lastUpdated)}</p>
                        )}
                        <p>• Current Status: {claim.status}</p>
                        {claim.verified !== undefined && (
                          <p>• Verified: {claim.verified ? 'Yes' : 'No'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "incident" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-800">Incident Details</h3>
                  
                  {/* Basic Incident Information */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="flex items-center text-md font-medium text-gray-800 mb-4">
                      <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Incident Date</label>
                          <p className="text-gray-800 flex items-center mt-1">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {formatSimpleDate(claim.incidentDate || claim.submittedDate)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Claim Type</label>
                          <p className="text-gray-800">{claim.claimType || 'Vehicle Insurance Claim'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Status</label>
                          <p className="text-gray-800">{claim.status}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Estimated Repair Cost</label>
                          <p className="text-gray-800">₹{formatAmount(claim.estimatedRepairCost || claim.amount)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Incident Details (if available) */}
                  {claim.accidentDetails && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="flex items-center text-md font-medium text-gray-800 mb-4">
                        <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                        Accident Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          {claim.accidentDetails.location && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Location</label>
                              <p className="text-gray-800 flex items-center mt-1">
                                <MapPinIcon className="h-4 w-4 mr-2" />
                                {claim.accidentDetails.location}
                              </p>
                            </div>
                          )}
                          {claim.accidentDetails.weather && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Weather Conditions</label>
                              <p className="text-gray-800 flex items-center mt-1">
                                <CloudIcon className="h-4 w-4 mr-2" />
                                {claim.accidentDetails.weather}
                              </p>
                            </div>
                          )}
                          {claim.accidentDetails.timeOfDay && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Time of Day</label>
                              <p className="text-gray-800 flex items-center mt-1">
                                <ClockIcon className="h-4 w-4 mr-2" />
                                {claim.accidentDetails.timeOfDay}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-4">
                          {claim.accidentDetails.policeReport !== undefined && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Police Report Filed</label>
                              <p className={`font-medium mt-1 ${claim.accidentDetails.policeReport === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>
                                {claim.accidentDetails.policeReport}
                              </p>
                            </div>
                          )}
                          {claim.accidentDetails.witnesses !== undefined && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Number of Witnesses</label>
                              <p className="text-gray-800 mt-1">{claim.accidentDetails.witnesses}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="flex items-center text-md font-medium text-gray-800 mb-4">
                      <DocumentTextIcon className="h-5 w-5 mr-2" />
                      Incident Description
                    </h4>
                    <p className="text-gray-700 leading-relaxed bg-white p-4 rounded border">
                      {claim.description || claim.briefDescription || 'No description provided'}
                    </p>
                  </div>

                  {/* Verification Comments */}
                  {claim.verificationComments && (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="flex items-center text-md font-medium text-gray-800 mb-4">
                        <ShieldCheckIcon className="h-5 w-5 mr-2" />
                        Verification Comments
                      </h4>
                      <p className="text-gray-700 leading-relaxed bg-white p-4 rounded border">
                        {claim.verificationComments}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "action" && canTakeAction && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-800">Take Action</h3>
                  
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border border-amber-200">
                    <div className="flex items-start space-x-3">
                      <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800">Action Required</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          This claim requires your review and decision. Please add your assessment notes before approving or rejecting.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Assessment Notes (Required)
                        </label>
                        <textarea
                          value={actionNotes}
                          onChange={(e) => setActionNotes(e.target.value)}
                          rows={5}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Add your detailed assessment, reasons for approval/rejection, additional instructions, or any other relevant notes..."
                        />
                      </div>
                      
                      <div className="flex space-x-4">
                        <button
                          onClick={handleApprove}
                          disabled={isProcessing || !actionNotes.trim()}
                          className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isProcessing ? (
                            <>
                              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="h-5 w-5 mr-2" />
                              Approve Claim
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleReject}
                          disabled={isProcessing || !actionNotes.trim()}
                          className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isProcessing ? (
                            <>
                              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <XMarkIcon className="h-5 w-5 mr-2" />
                              Reject Claim
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Fixed */}
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