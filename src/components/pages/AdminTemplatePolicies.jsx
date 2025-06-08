import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { DashboardLayout } from "../layout/DashboardLayout";
import { AdminMenuItems } from "../../constants/data";
import { ClipLoader } from "react-spinners";
import { TrashIcon, XMarkIcon, PlusIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

export const AdminTemplatePolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hoveredPolicy, setHoveredPolicy] = useState(null);

  // Form state for creating new policy
  const [newPolicy, setNewPolicy] = useState({
    type: "Two-Wheeler",
    pname: "",
    coverageDetails: "",
    validity: "",
    premium: ""
  });

  // Fetch policies from backend API
  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await axios.get("http://localhost:8084/api/policies");
      setPolicies(response.data);
    } catch (error) {
      let errorMessage = "Failed to fetch policies. Please try again.";
      if (error.response?.status === 404) errorMessage = "No policies found.";
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
  const showDeleteConfirmation = (policy) => {
    setPolicyToDelete(policy);
    setShowDeleteModal(true);
  };

  // Delete policy
  const handleDeletePolicy = async () => {
    if (!policyToDelete) return;

    try {
      setDeletingId(policyToDelete.id);
      await axios.delete(`http://localhost:8084/api/policies/${policyToDelete.id}`);
      
      setPolicies(policies.filter(policy => policy.id !== policyToDelete.id));
      toast.success(`Policy "${policyToDelete.pname}" deleted successfully`);
      setShowDeleteModal(false);
      setPolicyToDelete(null);
    } catch (error) {
      let errorMessage = "Failed to delete policy. Please try again.";
      if (error.response?.status === 404) errorMessage = "Policy not found.";
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
    setPolicyToDelete(null);
  };

  // Show create modal
  const openCreateModal = () => {
    setNewPolicy({
      type: "Two-Wheeler",
      pname: "",
      coverageDetails: "",
      validity: "",
      premium: ""
    });
    setIsCreateModalVisible(true);
  };

  // Cancel create
  const cancelCreate = () => {
    setIsCreateModalVisible(false);
    setNewPolicy({
      type: "Two-Wheeler",
      pname: "",
      coverageDetails: "",
      validity: "",
      premium: ""
    });
  };

  // Handle input changes for create form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPolicy(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create new policy
  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!newPolicy.pname.trim() || !newPolicy.coverageDetails.trim() || 
        !newPolicy.validity.trim() || !newPolicy.premium) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsCreating(true);
      const policyData = {
        ...newPolicy,
        premium: parseFloat(newPolicy.premium)
      };

      const response = await axios.post("http://localhost:8084/api/policies", policyData);
      
      setPolicies([...policies, response.data]);
      toast.success(`Policy "${response.data.pname}" created successfully`);
      setIsCreateModalVisible(false);
      setNewPolicy({
        type: "Two-Wheeler",
        pname: "",
        coverageDetails: "",
        validity: "",
        premium: ""
      });
    } catch (error) {
      let errorMessage = "Failed to create policy. Please try again.";
      if (error.response?.status === 400) errorMessage = "Invalid policy data.";
      else if (error.response?.status === 500) errorMessage = "Server error.";
      else if (error.response?.data?.message) errorMessage = error.response.data.message;

      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  // Retry fetching policies
  const handleRetry = () => {
    fetchPolicies();
  };

  // Truncate text with tooltip
  const truncateText = (text, maxLength = 40) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Fetch policies when component mounts
  useEffect(() => {
    fetchPolicies();
  }, []);

  return (
    <DashboardLayout menuItems={AdminMenuItems}>
      {/* Page Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Policy Management</h1>
          <p className="text-gray-600">View and manage all insurance policies</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Policy</span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <ClipLoader size={50} color="#6366F1" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && policies.length === 0 && (
        <div className="bg-red-50 border rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Policies</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Policies Table */}
    {/* Policies Table */}
    {!isLoading && !error && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {policies.length > 0 ? (
            <>
              <div className="p-4 border-b">
                <p className="text-sm text-gray-600">
                  Total Policies: {policies.length}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                        ID
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                        Policy Name
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Type
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                        Premium (₹)
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Validity
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coverage Details
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {policies.map((policy) => (
                      <tr key={policy.id} className="hover:bg-gray-50">
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 w-16">
                          {policy.id}
                        </td>
                        <td className="px-3 py-4 text-sm font-medium text-gray-900 w-48">
                          <div className="truncate" title={policy.pname}>
                            {policy.pname}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 w-32">
                          <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                            policy.type === 'Two-Wheeler' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {policy.type}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 font-medium w-28">
                          <div className="truncate">
                            ₹{policy.premium.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900 w-32">
                          <div className="truncate" title={policy.validity}>
                            {policy.validity}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900 relative min-w-0 flex-1">
                          <div 
                            className="truncate cursor-help flex items-center space-x-1 max-w-xs"
                            onMouseEnter={() => setHoveredPolicy(policy.id)}
                            onMouseLeave={() => setHoveredPolicy(null)}
                          >
                            <span className="truncate">{truncateText(policy.coverageDetails, 35)}</span>
                            <InformationCircleIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          </div>
                          
                          {/* Tooltip */}
                          {hoveredPolicy === policy.id && (
                            <div className="absolute z-20 bg-gray-900 text-white text-xs rounded-lg p-3 max-w-sm left-0 top-full mt-2 shadow-lg">
                              <div className="font-medium mb-1">Coverage Details:</div>
                              <div className="break-words">{policy.coverageDetails}</div>
                              <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 w-24">
                          <button
                            onClick={() => showDeleteConfirmation(policy)}
                            disabled={deletingId === policy.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 flex items-center space-x-1"
                          >
                            {deletingId === policy.id ? (
                              <ClipLoader size={14} color="#DC2626" />
                            ) : (
                              <TrashIcon className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline">
                              {deletingId === policy.id ? 'Deleting...' : 'Delete'}
                            </span>
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
              <h3 className="text-lg font-medium text-gray-900">No Policies Found</h3>
              <p className="text-gray-600">No insurance policies are available at the moment.</p>
            </div>
          )}
        </div>
      )}


      {/* Create Policy Modal */}
      {isCreateModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create New Policy</h3>
              <button
                onClick={cancelCreate}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePolicy} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Type
                </label>
                <select
                  name="type"
                  value={newPolicy.type}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="Two-Wheeler">Two-Wheeler</option>
                  <option value="Four-Wheeler">Four-Wheeler</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Name
                </label>
                <input
                  type="text"
                  name="pname"
                  value={newPolicy.pname}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter policy name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coverage Details
                </label>
                <textarea
                  name="coverageDetails"
                  value={newPolicy.coverageDetails}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter coverage details"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validity Period
                </label>
                <input
                  type="text"
                  name="validity"
                  value={newPolicy.validity}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 1 year with renewal option"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Premium Amount (₹)
                </label>
                <input
                  type="number"
                  name="premium"
                  value={newPolicy.premium}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter premium amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={cancelCreate}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isCreating ? (
                    <>
                      <ClipLoader size={16} color="#FFFFFF" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Policy</span>
                  )}
                </button>
              </div>
            </form>
          </div>
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
                Are you sure you want to delete policy "{policyToDelete?.pname}"?
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
                onClick={handleDeletePolicy}
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