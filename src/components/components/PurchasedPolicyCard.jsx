import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export const PurchasedPolicyCard = ({ policy }) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMM, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const handleFileClaim = () => {
    // Navigate to file claim form with policy data
    navigate("/dashboard/file-claim", { 
      state: { 
        selectedPolicy: policy 
      } 
    });
  };
  
  const getStatusBadge = (status) => {
    const statusClasses = {
      "Active": "bg-green-50 text-green-700",
      "Pending": "bg-amber-50 text-amber-700",
      "Expired": "bg-red-50 text-red-700"
    };
    
    return statusClasses[status] || "bg-gray-50 text-gray-700";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      {/* Policy Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(policy.status)}`}>
            {policy.status}
          </span>
          <h3 className="mt-2 text-lg font-semibold text-gray-800">
            {policy.name}
          </h3>
          <p className="text-sm text-gray-500">Policy ID: {policy.id}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Premium Paid</p>
          <p className="text-xl font-bold text-indigo-600">₹{policy.premiumPaid?.toLocaleString()}</p>
        </div>
      </div>

      {/* Policy Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-xs text-gray-500">Vehicle Registration</p>
          <p className="font-medium">{policy.vehicleRegNo}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Vehicle</p>
          <p className="font-medium">{policy.vehicle}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Valid From</p>
          <p className="font-medium">{formatDate(policy.validityStart)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Valid Until</p>
          <p className="font-medium">{formatDate(policy.validityEnd)}</p>
        </div>
      </div>

      {/* Agent Information */}
      <div className="mb-5">
        <p className="text-xs text-gray-500">Assigned Agent</p>
        <p className="font-medium">{policy.agentName}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex space-x-2">
          <button
            onClick={handleFileClaim}
            className="text-sm px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            disabled={policy.status !== "Active"}
          >
            File Claim
          </button>
        </div>
      </div>
    </div>
  );
};