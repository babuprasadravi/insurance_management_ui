import { useNavigate } from "react-router-dom";

export const PolicyCard = ({ policy }) => {
  const navigate = useNavigate();
  const handlePurchase = () => {
    navigate("/dashboard/policy-application", { state: { policy } });
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              policy.type === "Two-Wheeler"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            {policy.type}
          </span>
          <h3 className="mt-2 text-lg font-semibold text-gray-800">
            {policy.name}
          </h3>
          <p className="text-sm text-gray-500">Policy ID: {policy.id}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-indigo-600">
            ₹{policy.premium}
            <span className="text-sm font-normal text-gray-500">/year</span>
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-700">
            Coverage Details
          </h4>
          <p className="text-sm text-gray-600">{policy.coverage}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700">Validity</h4>
          <p className="text-sm text-gray-600">{policy.validity}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={handlePurchase}
          className="text-sm px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Purchase Policy
        </button>
      </div>
    </div>
  );
};
