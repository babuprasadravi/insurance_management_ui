import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { DashboardLayout } from "../layout/DashboardLayout";
import { AdminMenuItems } from "../../constants/data";
import { ClipLoader } from "react-spinners";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

export const AdminAgents = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);

  // Fetch agents from backend API
  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await axios.get("http://localhost:8087/auth/agents");
      setAgents(response.data);
    } catch (error) {
      let errorMessage = "Failed to fetch agents. Please try again.";
      if (error.response?.status === 404) errorMessage = "No agents found.";
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
  const showDeleteConfirmation = (agent) => {
    setAgentToDelete(agent);
    setShowDeleteModal(true);
  };

  // Delete agent
  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;

    try {
      setDeletingId(agentToDelete.id);
      await axios.delete(`http://localhost:8087/auth/agent/${agentToDelete.id}`);
      
      setAgents(agents.filter(agent => agent.id !== agentToDelete.id));
      toast.success(`Agent "${agentToDelete.username}" deleted successfully`);
      setShowDeleteModal(false);
      setAgentToDelete(null);
    } catch (error) {
      let errorMessage = "Failed to delete agent. Please try again.";
      if (error.response?.status === 404) errorMessage = "Agent not found.";
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
    setAgentToDelete(null);
  };

  // Retry fetching agents
  const handleRetry = () => {
    fetchAgents();
  };

  // Fetch agents when component mounts
  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <DashboardLayout menuItems={AdminMenuItems}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Agent Management</h1>
        <p className="text-gray-600">View and manage all agents</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <ClipLoader size={50} color="#6366F1" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && agents.length === 0 && (
        <div className="bg-red-50 border rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Agents</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Agents Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {agents.length > 0 ? (
            <>
              <div className="p-4 border-b">
                <p className="text-sm text-gray-600">
                  Total Agents: {agents.length}
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
                    {agents.map((agent) => (
                      <tr key={agent.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {agent.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {agent.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {agent.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {agent.phonenumber || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {agent.address || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => showDeleteConfirmation(agent)}
                            disabled={deletingId === agent.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 flex items-center space-x-1"
                          >
                            {deletingId === agent.id ? (
                              <ClipLoader size={16} color="#DC2626" />
                            ) : (
                              <TrashIcon className="h-4 w-4" />
                            )}
                            <span>{deletingId === agent.id ? 'Deleting...' : 'Delete'}</span>
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
              <h3 className="text-lg font-medium text-gray-900">No Agents Found</h3>
              <p className="text-gray-600">No agents are registered at the moment.</p>
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
                Are you sure you want to delete agent "{agentToDelete?.username}"?
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
                onClick={handleDeleteAgent}
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