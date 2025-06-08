import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";
import { DashboardLayout } from "../layout/DashboardLayout";
import { OverviewCard } from "../ui/OverviewCard";
import { WelcomeBanner } from "../ui/WelcomeBanner";
import { AgentMenuItems } from "../../constants/data";
import { useAuth } from "../../context/AuthProvider";
import { ClipLoader } from "react-spinners";

export const AgentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for each metric
  const [dashboardData, setDashboardData] = useState({
    assignedPolicies: { value: null, loading: true, error: null },
    pendingClaims: { value: null, loading: true, error: null },
    totalCommission: { value: null, loading: true, error: null },
  });

  // Auto-refresh interval (30 seconds)
  const REFRESH_INTERVAL = 30000;

  // Fetch assigned policies count and calculate commission
  const fetchAssignedPoliciesAndCommission = useCallback(async () => {
    if (!user?.id) return;

    try {
      setDashboardData(prev => ({
        ...prev,
        assignedPolicies: { ...prev.assignedPolicies, loading: true, error: null },
        totalCommission: { ...prev.totalCommission, loading: true, error: null }
      }));

      const response = await axios.get(`http://localhost:8084/api/policies/agent/${user.id}`);
      const policies = response.data;
      const count = policies.length;

      // Calculate total premium and commission (5%)
      const totalPremium = policies.reduce((sum, policy) => sum + (policy.premium || 0), 0);
      const commission = totalPremium * 0.05;

      // Format commission in Indian currency format
      const formatCurrency = (amount) => {
        if (amount >= 10000000) { // 1 crore
          return `₹${(amount / 10000000).toFixed(1)}Cr`;
        } else if (amount >= 100000) { // 1 lakh
          return `₹${(amount / 100000).toFixed(1)}L`;
        } else if (amount >= 1000) { // 1 thousand
          return `₹${(amount / 1000).toFixed(1)}K`;
        } else {
          return `₹${amount.toLocaleString('en-IN')}`;
        }
      };

      setDashboardData(prev => ({
        ...prev,
        assignedPolicies: { value: count, loading: false, error: null },
        totalCommission: { value: formatCurrency(commission), loading: false, error: null }
      }));
    } catch (error) {
      setDashboardData(prev => ({
        ...prev,
        assignedPolicies: { value: null, loading: false, error: "Error" },
        totalCommission: { value: null, loading: false, error: "Error" }
      }));
    }
  }, [user?.id]);

  // Fetch pending claims
  const fetchPendingClaims = useCallback(async () => {
    if (!user?.id) return;

    try {
      setDashboardData(prev => ({
        ...prev,
        pendingClaims: { ...prev.pendingClaims, loading: true, error: null }
      }));

      const response = await axios.get("http://localhost:8082/api/claims/myclaims");
      const claims = response.data;

      // Count claims with status FILED or UNDER_REVIEW
      const pendingCount = claims.filter(claim => 
        claim.status === 'FILED' || claim.status === 'UNDER_REVIEW'
      ).length;

      setDashboardData(prev => ({
        ...prev,
        pendingClaims: { value: pendingCount, loading: false, error: null }
      }));
    } catch (error) {
      setDashboardData(prev => ({
        ...prev,
        pendingClaims: { value: null, loading: false, error: "Error" }
      }));
    }
  }, [user?.id]);

  // Fetch all dashboard data
  const fetchAllData = useCallback(async () => {
    if (!user?.id) return;

    await Promise.all([
      fetchAssignedPoliciesAndCommission(),
      fetchPendingClaims(),
    ]);
  }, [user?.id, fetchAssignedPoliciesAndCommission, fetchPendingClaims]);

  // Custom OverviewCard component with loading, error states, and navigation
  const DashboardOverviewCard = ({ title, data, icon: Icon, className, onClick }) => {
    if (data.loading) {
      return (
        <div className={`p-6 rounded-xl border ${className} flex items-center justify-center min-h-[120px]`}>
          <ClipLoader size={24} color="#6366F1" />
        </div>
      );
    }

    const displayValue = data.error || data.value;
    const isError = data.error !== null;

    return (
      <div 
        className={`p-6 rounded-xl border ${className} ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold mt-2 ${isError ? 'text-red-500' : 'text-gray-900'}`}>
              {displayValue ?? 'N/A'}
            </p>
          </div>
          <div className={`p-3 rounded-full ${isError ? 'bg-red-100' : 'bg-white/50'}`}>
            <Icon className={`h-6 w-6 ${isError ? 'text-red-500' : 'text-gray-700'}`} />
          </div>
        </div>
      </div>
    );
  };

  // Navigation handlers
  const handleAssignedPoliciesClick = () => {
    navigate('/agentDashboard/policies');
  };

  const handlePendingClaimsClick = () => {
    navigate('/agentDashboard/claims');
  };

  // Total Commission stays on dashboard (no onClick)

  // Initial data fetch and set up auto-refresh
  useEffect(() => {
    if (user?.id) {
      fetchAllData();

      // Set up auto-refresh interval
      const interval = setInterval(fetchAllData, REFRESH_INTERVAL);

      // Cleanup interval on component unmount
      return () => clearInterval(interval);
    }
  }, [user?.id, fetchAllData]);

  // Don't render if user is not authenticated
  if (!user?.id) {
    return (
      <DashboardLayout menuItems={AgentMenuItems}>
        <div className="flex justify-center items-center py-12">
          <ClipLoader size={50} color="#6366F1" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={AgentMenuItems}>
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Auto-refresh indicator */}
      <div className="mb-4 flex justify-end">
        <p className="text-xs text-gray-500">
          Auto-refreshes every 30 seconds • Click cards to navigate
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardOverviewCard
          title="Assigned Policies"
          data={dashboardData.assignedPolicies}
          icon={DocumentTextIcon}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
          onClick={handleAssignedPoliciesClick}
        />
        <DashboardOverviewCard
          title="Pending Claims"
          data={dashboardData.pendingClaims}
          icon={ClipboardDocumentListIcon}
          className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100"
          onClick={handlePendingClaimsClick}
        />
        <DashboardOverviewCard
          title="Total Commission"
          data={dashboardData.totalCommission}
          icon={CurrencyRupeeIcon}
          className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100"
          // No onClick - stays on dashboard
        />
      </div>
    </DashboardLayout>
  );
};