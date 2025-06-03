import { useState } from "react";
import { DashboardLayout } from "../layout/DashboardLayout";
import { usePolicy } from "../../context/PolicyProvider";
import { PurchasedPolicyCard } from "../components/PurchasedPolicyCard";
import { EmptyState } from "../components/EmptyState";
import { customerMenuItems } from "../../constants/data";

export const MyPolicies = () => {
  const { purchasedPolicies } = usePolicy();
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter by type and search term
  const filteredPolicies = purchasedPolicies
    .filter(policy => {
      if (filter === "All") return true;
      return policy.type === filter;
    })
    .filter(policy => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        policy.name.toLowerCase().includes(searchLower) ||
        policy.id.toLowerCase().includes(searchLower) ||
        policy.vehicleRegNo.toLowerCase().includes(searchLower)
      );
    });

  return (
    <DashboardLayout menuItems={customerMenuItems} >
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">My Insurance Policies</h1>
        <p className="text-gray-600">View and manage all your active insurance policies</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg"
              placeholder="Search by policy ID or vehicle number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex space-x-2">
              {["All", "Two-Wheeler", "Four-Wheeler"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
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
      </div>

      {/* Policies Grid */}
      {filteredPolicies.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPolicies.map((policy) => (
            <PurchasedPolicyCard key={policy.id} policy={policy} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No policies found" 
          description={searchTerm ? "Try adjusting your search or filter criteria" : "You haven't purchased any policies yet"}
          actionText={!searchTerm && "Browse Policies"}
          actionLink="/dashboard/browse-policies"
        />
      )}
    </DashboardLayout>
  );
};