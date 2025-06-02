import { useState } from "react";
import { DashboardLayout } from "../layout/DashboardLayout";
import { toast } from "react-hot-toast";
import { PolicyCard } from "../components/PolicyCard";

// Sample policies data
const policiesData = [
  {
    id: "TW-1001",
    name: "Basic Two-Wheeler Insurance",
    type: "Two-Wheeler",
    premium: 1200,
    coverage: "Third-party liability, Own damage, Personal accident cover",
    validity: "1 year with option to renew",
    details: "Covers damages up to ₹50,000 for two-wheelers with engine capacity under 150cc.",
  },
  {
    id: "TW-1002",
    name: "Premium Two-Wheeler Insurance",
    type: "Two-Wheeler",
    premium: 2500,
    coverage: "Comprehensive coverage with zero depreciation, Roadside assistance",
    validity: "1 year with option to renew",
    details: "Ideal for high-end two-wheelers with complete protection against damages and theft.",
  },
  {
    id: "TW-1003",
    name: "Student Two-Wheeler Plan",
    type: "Two-Wheeler",
    premium: 800,
    coverage: "Basic third-party liability, Limited own damage cover",
    validity: "1 year with option to renew",
    details: "Special plan for students with affordable premiums and essential coverage.",
  },
  {
    id: "TW-1004",
    name: "Electric Scooter Insurance",
    type: "Two-Wheeler",
    premium: 1800,
    coverage: "Battery cover, Electrical damages, Charging station accidents",
    validity: "1 year with option to renew",
    details: "Specialized coverage for electric two-wheelers including battery protection.",
  },
  {
    id: "TW-1005",
    name: "Delivery Partner Insurance",
    type: "Two-Wheeler",
    premium: 3200,
    coverage: "Commercial usage, Enhanced third-party, Accident cover",
    validity: "1 year with option to renew",
    details: "Designed for delivery partners with extended coverage for commercial usage.",
  },
  {
    id: "FW-2001",
    name: "Basic Car Insurance",
    type: "Four-Wheeler",
    premium: 5500,
    coverage: "Third-party liability, Basic own damage cover",
    validity: "1 year with option to renew",
    details: "Mandatory coverage for all cars with basic protection against damages.",
  },
  {
    id: "FW-2002",
    name: "Premium Sedan Insurance",
    type: "Four-Wheeler",
    premium: 12000,
    coverage: "Comprehensive coverage, Zero depreciation, 24/7 roadside assistance",
    validity: "1 year with option to renew",
    details: "Complete protection for sedans with premium features and addon benefits.",
  },
  {
    id: "FW-2003",
    name: "SUV Special Coverage",
    type: "Four-Wheeler",
    premium: 18000,
    coverage: "All-terrain coverage, Flood damage, Engine protection",
    validity: "1 year with option to renew",
    details: "Specialized coverage for SUVs with protection against various terrains and conditions.",
  },
  {
    id: "FW-2004",
    name: "Electric Car Insurance",
    type: "Four-Wheeler",
    premium: 15000,
    coverage: "Battery cover, Charging accidents, Special electric components",
    validity: "1 year with option to renew",
    details: "Tailored for electric vehicles with special coverage for EV-specific components.",
  },
  {
    id: "FW-2005",
    name: "Luxury Vehicle Insurance",
    type: "Four-Wheeler",
    premium: 35000,
    coverage: "Premium comprehensive, Import parts coverage, Valet parking",
    validity: "1 year with option to renew",
    details: "Elite coverage for luxury vehicles with specialized service and import parts protection.",
  },
];

export const BrowsePolicies = () => {
  const [filter, setFilter] = useState("All");
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const filteredPolicies = filter === "All" 
    ? policiesData 
    : policiesData.filter(policy => policy.type === filter);


  const handlePurchasePolicy = (policy) => {
    // In a real app, this would navigate to a purchase flow
    toast.success(`Initiating purchase for ${policy.name}`);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Browse Available Policies</h1>
        <p className="text-gray-600">Find the perfect insurance policy for your vehicle</p>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-100">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          <div className="flex space-x-2">
            {["All", "Two-Wheeler", "Four-Wheeler"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  filter === type 
                    ? "bg-indigo-600 text-white" 
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Policy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPolicies.map((policy) => (
          <PolicyCard
            key={policy.id}
            policy={policy}
            onPurchase={handlePurchasePolicy}
          />
        ))}
      </div>
      
      {filteredPolicies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No policies found for the selected filter.</p>
        </div>
      )}
    </DashboardLayout>
  );
};