import { useState, useEffect } from "react";
import { DashboardLayout } from "../layout/DashboardLayout";
import { AgentMenuItems } from "../../constants/data";
import { useAuth } from "../../context/AuthProvider"; // Change from useAgent to useAuth
import axios from "axios"; // Add axios import
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  TruckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { format, isAfter, parseISO } from "date-fns";
import { toast } from "react-hot-toast";

export const AgentPolicies = () => {
  const { user } = useAuth(); // Get current logged-in agent
  const [policies, setPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch policies and customer details
  useEffect(() => {
    const fetchPoliciesWithCustomerDetails = async () => {
      setIsLoading(true);
      setError("");

      try {
        // First API call - fetch agent's policies
        const policiesResponse = await axios.get(
          `http://localhost:8084/api/policies/agent/${user.id}`
        );

        console.log("Policies API Response:", policiesResponse.data);

        if (!policiesResponse.data.length) {
          setPolicies([]);
          setIsLoading(false);
          return;
        }

        // Second API call - fetch customer details for each policy
        const customerDetailsPromises = policiesResponse.data.map((policy) =>
          axios.post("http://localhost:8087/auth/getuser", {
            id: policy.customerId,
          })
        );

        const customerDetails = await Promise.allSettled(
          customerDetailsPromises
        );

        // Map policies with customer information
        const policiesWithCustomers = policiesResponse.data.map(
          (policy, index) => {
            const customerResult = customerDetails[index];
            let customerInfo = {
              customerName: "Unknown Customer",
              customerEmail: "N/A",
            };

            if (customerResult.status === "fulfilled") {
              customerInfo = {
                customerName: customerResult.value.data.username,
                customerEmail: customerResult.value.data.email,
              };
            }

            // Parse dates for calculations
            const parseDate = (dateString) => {
              try {
                // Handle format "04 Jun, 2025"
                const parsedDate = new Date(dateString);
                return isNaN(parsedDate) ? new Date() : parsedDate;
              } catch (error) {
                console.warn("Date parsing error:", dateString);
                return new Date();
              }
            };

            return {
              id: policy.id,
              name: policy.policyName,
              premiumPaid: policy.premium,
              vehicleRegNo: policy.licenceNo,
              vehicle: policy.vehicle, // Full vehicle string as-is
              validityStart: parseDate(policy.validFrom),
              validityEnd: parseDate(policy.validUntil), // Map validUntil to validityEnd
              agentAssigned: policy.agentAssigned,
              agentId: policy.agentId,
              customerId: policy.customerId,
              ...customerInfo,
            };
          }
        );

        setPolicies(policiesWithCustomers);
      } catch (error) {
        console.error("Error fetching policies:", error);

        let errorMessage = "Failed to fetch policies. Please try again.";

        if (error.response?.status === 404) {
          errorMessage = "No policies found for this agent.";
        } else if (error.response?.status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (error.code === "ECONNREFUSED") {
          errorMessage =
            "Cannot connect to server. Please check if the backend is running.";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchPoliciesWithCustomerDetails();
    }
  }, [user?.id]);

  // Auto-determine status based on validity end date
  const getPolicyStatus = (policy) => {
    const today = new Date();
    const expiryDate = policy.validityEnd;

    if (isAfter(today, expiryDate)) {
      return "Expired";
    }
    return "Active";
  };

  // Filter policies based on search term
  const filteredPolicies = policies.filter((policy) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      policy.name.toLowerCase().includes(searchLower) ||
      policy.id.toString().toLowerCase().includes(searchLower) ||
      policy.vehicleRegNo.toLowerCase().includes(searchLower) ||
      policy.customerName.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (date) => {
    try {
      return format(date, "dd MMM, yyyy");
    } catch (error) {
      return "Invalid Date";
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
    toast.success(
      `Initiating renewal process for ${policy.customerName}'s policy`
    );
    // TODO: Navigate to renewal form
  };

  const getExpiryWarning = (validityEnd) => {
    const today = new Date();
    const expiryDate = validityEnd;
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return null;
    if (diffDays <= 30) {
      return {
        message: `${diffDays}d left`,
        className: "text-amber-600 bg-amber-50 border-amber-200",
      };
    }
    return null;
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout menuItems={AgentMenuItems}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading policies...</span>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout menuItems={AgentMenuItems}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading policies
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={AgentMenuItems}>
      <div className="space-y-4">
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Agent Policies
            </h1>
            <p className="text-sm text-gray-600">
              Manage assigned customer policies
            </p>
          </div>
          <div className="mt-2 sm:mt-0">
            <div className="bg-blue-50 px-3 py-1 rounded-full">
              <span className="text-xs font-medium text-blue-700">
                Total: {policies.length}
              </span>
            </div>
          </div>
        </div>

        {/* Compact Search Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Compact Policies Grid */}
        {filteredPolicies.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPolicies.map((policy) => {
              const status = getPolicyStatus(policy);
              const expiryWarning = getExpiryWarning(policy.validityEnd);

              return (
                <div
                  key={policy.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
                >
                  {/* Compact Policy Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                          {/* Removed type badge as per requirement */}
                        </div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1">
                          {policy.name}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center">
                          <DocumentTextIcon className="h-3 w-3 mr-1" />
                          {policy.id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Premium</p>
                        <p className="text-sm font-bold text-indigo-600">
                          ₹{(policy.premiumPaid / 1000).toFixed(0)}K
                        </p>
                      </div>
                    </div>

                    {/* Compact Expiry Warning */}
                    {expiryWarning && (
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${expiryWarning.className}`}
                      >
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {expiryWarning.message}
                      </div>
                    )}
                  </div>

                  {/* Compact Policy Details */}
                  <div className="p-4">
                    <div className="space-y-3 mb-4">
                      {/* Customer Info */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center">
                          <UserIcon className="h-3 w-3 mr-1" />
                          Customer
                        </p>
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {policy.customerName}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {policy.customerEmail}
                        </p>
                      </div>

                      {/* Vehicle Info */}
                      <div>
                        <p className="text-xs text-gray-500 mb-1 flex items-center">
                          <TruckIcon className="h-3 w-3 mr-1" />
                          Vehicle
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          {policy.vehicleRegNo}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {policy.vehicle}
                        </p>
                      </div>

                      {/* Validity Period */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Valid From
                          </p>
                          <p className="text-xs font-medium text-gray-800">
                            {formatDate(policy.validityStart)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Valid Until
                          </p>
                          <p
                            className={`text-xs font-medium ${
                              status === "Expired"
                                ? "text-red-600"
                                : "text-gray-800"
                            }`}
                          >
                            {formatDate(policy.validityEnd)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Compact Empty State */
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <div className="text-center">
              <DocumentTextIcon className="mx-auto h-8 w-8 text-gray-400 mb-3" />
              <h3 className="text-sm font-medium text-gray-800 mb-1">
                {searchTerm ? "No policies found" : "No policies assigned"}
              </h3>
              <p className="text-xs text-gray-600 mb-4">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "Start by creating policies for customers"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() =>
                    (window.location.href = "/agentDashboard/create-policy")
                  }
                  className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors"
                >
                  Create Policy
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
