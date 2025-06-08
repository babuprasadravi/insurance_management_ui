import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { DashboardLayout } from "../layout/DashboardLayout";
import { WelcomeBanner } from "../ui/WelcomeBanner";
import { customerMenuItems } from "../../constants/data";
import { useAuth } from "../../context/AuthProvider";
import { ClipLoader } from "react-spinners";

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for each metric
  const [dashboardData, setDashboardData] = useState({
    browsePolicies: { value: null, loading: true, error: null },
    myPolicies: { value: null, loading: true, error: null },
    activeClaims: { value: null, loading: true, error: null },
  });

  // Auto-refresh interval (30 seconds)
  const REFRESH_INTERVAL = 30000;

  // Fetch available policies count
  const fetchBrowsePolicies = useCallback(async () => {
    try {
      setDashboardData(prev => ({
        ...prev,
        browsePolicies: { ...prev.browsePolicies, loading: true, error: null }
      }));

      const response = await axios.get("http://localhost:8084/api/policies");
      const count = response.data.length;

      setDashboardData(prev => ({
        ...prev,
        browsePolicies: { value: count, loading: false, error: null }
      }));
    } catch (error) {
      setDashboardData(prev => ({
        ...prev,
        browsePolicies: { value: null, loading: false, error: "Error" }
      }));
    }
  }, []);

  // Fetch customer's policies
  const fetchMyPolicies = useCallback(async () => {
    if (!user?.id) return;

    try {
      setDashboardData(prev => ({
        ...prev,
        myPolicies: { ...prev.myPolicies, loading: true, error: null }
      }));

      const response = await axios.get(`http://localhost:8084/api/policies/customer/${user.id}`);
      const count = response.data.length;

      setDashboardData(prev => ({
        ...prev,
        myPolicies: { value: count, loading: false, error: null }
      }));
    } catch (error) {
      setDashboardData(prev => ({
        ...prev,
        myPolicies: { value: null, loading: false, error: "Error" }
      }));
    }
  }, [user?.id]);

  // Fetch active claims (FILED and UNDER_REVIEW)
  const fetchActiveClaims = useCallback(async () => {
    if (!user?.id) return;

    try {
      setDashboardData(prev => ({
        ...prev,
        activeClaims: { ...prev.activeClaims, loading: true, error: null }
      }));

      const response = await axios.post("http://localhost:8082/api/claims/customer", {
        customerId: user.id
      });
      
      const claims = response.data;
      // Count claims with status FILED or UNDER_REVIEW
      const activeCount = claims.filter(claim => 
        claim.status === 'FILED' || claim.status === 'UNDER_REVIEW'
      ).length;

      setDashboardData(prev => ({
        ...prev,
        activeClaims: { value: activeCount, loading: false, error: null }
      }));
    } catch (error) {
      setDashboardData(prev => ({
        ...prev,
        activeClaims: { value: null, loading: false, error: "Error" }
      }));
    }
  }, [user?.id]);

  // Fetch all dashboard data
  const fetchAllData = useCallback(async () => {
    if (!user?.id) return;

    await Promise.all([
      fetchBrowsePolicies(),
      fetchMyPolicies(),
      fetchActiveClaims(),
    ]);
  }, [user?.id, fetchBrowsePolicies, fetchMyPolicies, fetchActiveClaims]);

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
        className={`p-6 rounded-xl border ${className} cursor-pointer hover:shadow-lg transition-shadow duration-200`}
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
  const handleBrowsePoliciesClick = () => {
    navigate('/dashboard/browse-policies');
  };

  const handleMyPoliciesClick = () => {
    navigate('/dashboard/my-policies');
  };

  const handleActiveClaimsClick = () => {
    navigate('/dashboard/claims');
  };

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
      <DashboardLayout menuItems={customerMenuItems}>
        <div className="flex justify-center items-center py-12">
          <ClipLoader size={50} color="#6366F1" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={customerMenuItems}>
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
          title="Browse Policies"
          data={dashboardData.browsePolicies}
          icon={DocumentTextIcon}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100"
          onClick={handleBrowsePoliciesClick}
        />
        <DashboardOverviewCard
          title="My Policies"
          data={dashboardData.myPolicies}
          icon={ClipboardDocumentListIcon}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
          onClick={handleMyPoliciesClick}
        />
        <DashboardOverviewCard
          title="Active Claims"
          data={dashboardData.activeClaims}
          icon={ExclamationCircleIcon}
          className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100"
          onClick={handleActiveClaimsClick}
        />
      </div>
    </DashboardLayout>
  );
};