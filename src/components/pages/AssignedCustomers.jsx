import { useState, useEffect } from "react";
import axios from "axios";
import {
  EyeIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { DashboardLayout } from "../layout/DashboardLayout";
import { AgentMenuItems } from "../../constants/data";
import { useAuth } from "../../context/AuthProvider";
import { CustomerDetailModal } from "../components/CustomerDetailModal";

export const AssignedCustomers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [customerPolicies, setCustomerPolicies] = useState([]);
  const [isPoliciesLoading, setIsPoliciesLoading] = useState(false);
  const [policyError, setPolicyError] = useState("");
  const [customerClaims, setCustomerClaims] = useState([]);
  const [isClaimsLoading, setIsClaimsLoading] = useState(false);
  const [claimError, setClaimError] = useState("");

  // Fetch customer IDs and their details
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      setError("");

      try {
        // First API call to get customer IDs
        const customerIdsResponse = await axios.get(
          `http://localhost:8084/api/policies/agent/${user.id}/customers`
        );

        if (!customerIdsResponse.data.customerIds?.length) {
          setCustomers([]);
          setIsLoading(false);
          return;
        }

        // Second API call to get customer details
        const customerDetailsPromises =
          customerIdsResponse.data.customerIds.map((customerId) =>
            axios.post("http://localhost:8087/auth/getuser", { id: customerId })
          );

        const customerDetails = await Promise.allSettled(
          customerDetailsPromises
        );

        // Filter and map successful responses
        const validCustomers = customerDetails
          .filter((result) => result.status === "fulfilled")
          .map((result) => result.value.data);

        setCustomers(validCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
        setError(
          error.response?.data?.message ||
            "Failed to fetch customers. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchCustomers();
    }
  }, [user?.id]);

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.username.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phonenumber?.includes(searchTerm) ||
      String(customer.id).includes(searchTerm)
    );
  });

  const handleViewDetails = async (customer) => {
    if (!customer) return;

    setSelectedCustomer({
      ...customer,
      name: customer.username,
    });
    setIsModalOpen(true);
    setIsPoliciesLoading(true);
    setIsClaimsLoading(true);
    setPolicyError("");
    setClaimError("");

    try {
      // Fetch policies
      const policiesResponse = await axios.get(
        `http://localhost:8084/api/policies/customer/${customer.id}`
      );
      setCustomerPolicies(policiesResponse.data);

      // Fetch claims
      const claimsResponse = await axios.post(
        "http://localhost:8082/api/claims/customer",
        { customerId: customer.id }
      );
      setCustomerClaims(claimsResponse.data);
    } catch (error) {
      console.error("Error fetching customer data:", error);
      if (error.config.url.includes("/policies/")) {
        setPolicyError("Failed to fetch customer policies. Please try again.");
      } else if (error.config.url.includes("/claims/")) {
        setClaimError("Failed to fetch customer claims. Please try again.");
      }
    } finally {
      setIsPoliciesLoading(false);
      setIsClaimsLoading(false);
    }
  };

  // Update the closeModal function to clear claims data
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
    setCustomerPolicies([]);
    setCustomerClaims([]);
    setPolicyError("");
    setClaimError("");
  };

  if (isLoading) {
    return (
      <DashboardLayout menuItems={AgentMenuItems}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading customers...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={AgentMenuItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Assigned Customers
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and view details of your assigned customers
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              {filteredCustomers.length} Total Customers
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading customers
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        {customers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Search by name, email, phone, or customer ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer Details
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-medium text-sm">
                                {customer.username
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              #{customer.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {customer.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.phonenumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(customer)}
                          className="inline-flex items-center px-3 py-2 border border-indigo-300 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No customers found
                        </h3>
                        <p className="text-gray-500">
                          {searchTerm
                            ? "Try adjusting your search criteria"
                            : "No customers have been assigned to you yet"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={isModalOpen}
        onClose={closeModal}
        isDataAvailable={true}
        policies={{
          data: customerPolicies,
          isLoading: isPoliciesLoading,
          error: policyError,
        }}
        claims={{
          data: customerClaims,
          isLoading: isClaimsLoading,
          error: claimError,
        }}
      />
    </DashboardLayout>
  );
};
