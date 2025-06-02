import {
    DocumentArrowDownIcon,
    ArrowPathIcon,
    DocumentTextIcon
  } from "@heroicons/react/24/outline";
  import { format } from "date-fns";
  import { toast } from "react-hot-toast";
  import { useNavigate } from "react-router-dom";
  
  export const PurchasedPolicyCard = ({ policy }) => {
    const navigate = useNavigate();
    const formatDate = (dateString) => {
      try {
        return format(new Date(dateString), "dd MMM, yyyy");
      } catch (error) {
        return dateString;
      }
    };
    
    const handleViewPolicy = () => {
      // In a real app, this would download or view a PDF
      toast.success("Generating policy PDF document...");
      setTimeout(() => {
        toast.success("Policy document downloaded successfully");
      }, 1500);
    };
    
    const handleRenew = () => {
      // In a real app, this would open a renewal flow
      toast.success("Initiating policy renewal process");
    };
    
    const handleFileClaim = () => {
      // In a real app, this would navigate to claim form
      toast.success("Redirecting to claim filing form");
      navigate("/dashboard/file-claim", { state: { policyId: policy.id } });
    };
    
    const getStatusBadge = (status) => {
      const statusClasses = {
        Active: "bg-green-50 text-green-700",
        Expired: "bg-red-50 text-red-700",
        "Pending Renewal": "bg-amber-50 text-amber-700",
      };
      
      return statusClasses[status] || "bg-gray-50 text-gray-700";
    };
  
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        {/* Header */}
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
            <p className="font-medium text-gray-500">Premium Paid</p>
            <p className="text-xl font-bold text-indigo-600">₹{policy.premiumPaid.toLocaleString()}</p>
          </div>
        </div>
        
        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-xs text-gray-500">Vehicle Reg. No</p>
            <p className="font-medium">{policy.vehicleRegNo}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Vehicle</p>
            <p className="font-medium">{policy.manufacturer} {policy.model}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Valid From</p>
            <p className="font-medium">{formatDate(policy.validityStart)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Valid Until</p>
            <p className="font-medium">{formatDate(policy.validityEnd)}</p>
          </div>
          {policy.agentName && (
            <div className="col-span-2">
              <p className="text-xs text-gray-500">Agent</p>
              <p className="font-medium">{policy.agentName}</p>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <button 
            onClick={handleViewPolicy}
            className="inline-flex items-center text-sm px-3 py-2 text-indigo-600 font-medium border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
            View Policy
          </button>
          
          <div className="flex space-x-2">
            <button 
              onClick={handleRenew}
              className="inline-flex items-center text-sm px-3 py-2 text-green-600 font-medium border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4 mr-1" />
              Renew
            </button>
            
            <button 
              onClick={handleFileClaim}
              className="inline-flex items-center text-sm px-3 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              File a Claim
            </button>
          </div>
        </div>
      </div>
    );
  };