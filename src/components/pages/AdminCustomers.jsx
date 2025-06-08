import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { DashboardLayout } from "../layout/DashboardLayout";
import { AdminMenuItems } from "../../constants/data";
import { ClipLoader } from "react-spinners";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  // Fetch customers from backend API
  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await axios.get("http://localhost:8087/auth/customers");
      setCustomers(response.data);
    } catch (error) {
      let errorMessage = "Failed to fetch customers. Please try again.";
      if (error.response?.status === 404) errorMessage = "No customers found.";
      else if (error.response?.status === 500) errorMessage = "Server error.";
      else if (error.code === "ECONNREFUSED") errorMessage = "Cannot connect to server.";
      else if (error.response?.data?.message) errorMessage = error.response.data.message;

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show delete confirmation modal
  const showDeleteConfirmation = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  // Delete customer
  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;

    try {
      setDeletingId(customerToDelete.id);
      await axios.delete(`http://localhost:8087/auth/customer/${customerToDelete.id}`);
      
      setCustomers(customers.filter(customer => customer.id !== customerToDelete.id));
      toast.success(`Customer "${customerToDelete.username}" deleted successfully`);
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    } catch (error) {
      let errorMessage = "Failed to delete customer. Please try again.";
      if (error.response?.status === 404) errorMessage = "Customer not found.";
      else if (error.response?.status === 500) errorMessage = "Server error.";
      else if (error.response?.data?.message) errorMessage = error.response.data.message;

      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCustomerToDelete(null);
  };

  // Retry fetching customers
  const handleRetry = () => {
    fetchCustomers();
  };

  // Fetch customers when component mounts
  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <DashboardLayout menuItems={AdminMenuItems}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Customer Management</h1>
        <p className="text-gray-600">View and manage all customers</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <ClipLoader size={50} color="#6366F1" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && customers.length === 0 && (
        <div className="bg-red-50 border rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Customers</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Customers Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {customers.length > 0 ? (
            <>
              <div className="p-4 border-b">
                <p className="text-sm text-gray-600">
                  Total Customers: {customers.length}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {customer.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.phonenumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {customer.address || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => showDeleteConfirmation(customer)}
                            disabled={deletingId === customer.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 flex items-center space-x-1"
                          >
                            {deletingId === customer.id ? (
                              <ClipLoader size={16} color="#DC2626" />
                            ) : (
                              <TrashIcon className="h-4 w-4" />
                            )}
                            <span>{deletingId === customer.id ? 'Deleting...' : 'Delete'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No Customers Found</h3>
              <p className="text-gray-600">No customers are registered at the moment.</p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
              <button
                onClick={cancelDelete}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete customer "{customerToDelete?.username}"?
              </p>
              <p className="text-red-600 text-sm mt-2">
                This action cannot be undone.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCustomer}
                disabled={deletingId}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {deletingId ? (
                  <>
                    <ClipLoader size={16} color="#FFFFFF" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};