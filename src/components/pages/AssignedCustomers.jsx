import { useState } from "react";
import { EyeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { DashboardLayout } from "../layout/DashboardLayout";
import { AgentMenuItems } from "../../constants/data";
import { useAgent } from "../../context/AgentContext";
import { CustomerDetailModal } from "../components/CustomerDetailModal";

export const AssignedCustomers = () => {
  const { assignedCustomers } = useAgent();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter customers based on search term
  const filteredCustomers = assignedCustomers.filter(customer => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phone.includes(searchTerm) ||
      customer.id.toLowerCase().includes(searchLower)
    );
  });

  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  return (
    <DashboardLayout menuItems={AgentMenuItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Assigned Customers</h1>
            <p className="text-gray-600 mt-1">Manage and view details of your assigned customers</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              {filteredCustomers.length} Total Customers
            </span>
          </div>
        </div>

        {/* Search Bar */}
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

        {/* Customers Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Policies
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claims
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-medium text-sm">
                                {customer.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.email}</div>
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl font-semibold text-gray-900">
                            {customer.policies?.length || 0}
                          </span>
                          <div className="ml-2">
                            {customer.policies && customer.policies.length > 0 && (
                              <div className="flex flex-col">
                                <span className="text-xs text-green-600">
                                  {customer.policies.filter(p => p.status === 'Active').length} Active
                                </span>
                                {customer.policies.filter(p => p.status === 'Expired').length > 0 && (
                                  <span className="text-xs text-red-600">
                                    {customer.policies.filter(p => p.status === 'Expired').length} Expired
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl font-semibold text-gray-900">
                            {customer.claims?.length || 0}
                          </span>
                          <div className="ml-2">
                            {customer.claims && customer.claims.length > 0 && (
                              <div className="flex flex-col">
                                {customer.claims.filter(c => c.status === 'Under Review').length > 0 && (
                                  <span className="text-xs text-amber-600">
                                    {customer.claims.filter(c => c.status === 'Under Review').length} Pending
                                  </span>
                                )}
                                {customer.claims.filter(c => c.status === 'Approved').length > 0 && (
                                  <span className="text-xs text-green-600">
                                    {customer.claims.filter(c => c.status === 'Approved').length} Approved
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
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
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                        <p className="text-gray-500">
                          {searchTerm ? "Try adjusting your search criteria" : "No customers have been assigned to you yet"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        {filteredCustomers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">📋</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Policies</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {assignedCustomers.reduce((sum, customer) => sum + (customer.policies?.length || 0), 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-semibold">✅</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Policies</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {assignedCustomers.reduce((sum, customer) => 
                      sum + (customer.policies?.filter(p => p.status === 'Active').length || 0), 0
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <span className="text-amber-600 font-semibold">⚠️</span>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Claims</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {assignedCustomers.reduce((sum, customer) => 
                      sum + (customer.claims?.filter(c => c.status === 'Under Review').length || 0), 0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </DashboardLayout>
  );
};