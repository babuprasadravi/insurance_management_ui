import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  UsersIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { DashboardLayout } from "../layout/DashboardLayout";
import { OverviewCard } from "../ui/OverviewCard";
import { WelcomeBanner } from "../ui/WelcomeBanner";
import { AdminMenuItems } from "../../constants/data";
import { ClipLoader } from "react-spinners";

export const AdminDashboard = () => {
  // State for each metric
  const [dashboardData, setDashboardData] = useState({
    totalCustomers: { value: null, loading: true, error: null },
    totalAgents: { value: null, loading: true, error: null },
    activePolicies: { value: null, loading: true, error: null },
    pendingClaims: { value: null, loading: true, error: null },
    totalRevenue: { value: null, loading: true, error: null },
  });

  // Auto-refresh interval (30 seconds)
  const REFRESH_INTERVAL = 30000;

  // Fetch total customers
  const fetchTotalCustomers = useCallback(async () => {
    try {
      setDashboardData(prev => ({
        ...prev,
        totalCustomers: { ...prev.totalCustomers, loading: true, error: null }
      }));

      const response = await axios.get("http://localhost:8087/auth/customers");
      const count = response.data.length;

      setDashboardData(prev => ({
        ...prev,
        totalCustomers: { value: count, loading: false, error: null }
      }));
    } catch (error) {
      setDashboardData(prev => ({
        ...prev,
        totalCustomers: { value: null, loading: false, error: "Error" }
      }));
    }
  }, []);

  // Fetch total agents
  const fetchTotalAgents = useCallback(async () => {
    try {
      setDashboardData(prev => ({
        ...prev,
        totalAgents: { ...prev.totalAgents, loading: true, error: null }
      }));

      const response = await axios.get("http://localhost:8087/auth/agents");
      const count = response.data.length;

      setDashboardData(prev => ({
        ...prev,
        totalAgents: { value: count, loading: false, error: null }
      }));
    } catch (error) {
      setDashboardData(prev => ({
        ...prev,
        totalAgents: { value: null, loading: false, error: "Error" }
      }));
    }
  }, []);

  // Fetch active policies and calculate revenue
  const fetchActivePoliciesAndRevenue = useCallback(async () => {
    try {
      setDashboardData(prev => ({
        ...prev,
        activePolicies: { ...prev.activePolicies, loading: true, error: null },
        totalRevenue: { ...prev.totalRevenue, loading: true, error: null }
      }));

      const response = await axios.get("http://localhost:8084/api/policies/applied-policies");
      const policies = response.data;
      const count = policies.length;
      
      // Calculate total revenue from premium amounts
      const totalRevenue = policies.reduce((sum, policy) => sum + (policy.premium || 0), 0);
      
      // Format revenue in Indian currency format
      const formatRevenue = (amount) => {
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
        activePolicies: { value: count, loading: false, error: null },
        totalRevenue: { value: formatRevenue(totalRevenue), loading: false, error: null }
      }));
    } catch (error) {
      setDashboardData(prev => ({
        ...prev,
        activePolicies: { value: null, loading: false, error: "Error" },
        totalRevenue: { value: null, loading: false, error: "Error" }
      }));
    }
  }, []);

  // Fetch pending claims
  const fetchPendingClaims = useCallback(async () => {
    try {
      setDashboardData(prev => ({
        ...prev,
        pendingClaims: { ...prev.pendingClaims, loading: true, error: null }
      }));

      const response = await axios.get("http://localhost:8082/api/claims/myclaims");
      const claims = response.data;
      
      // Count claims with status UNDER_REVIEW or FILED
      const pendingCount = claims.filter(claim => 
        claim.status === 'UNDER_REVIEW' || claim.status === 'FILED'
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
  }, []);

  // Fetch all dashboard data
  const fetchAllData = useCallback(async () => {
    await Promise.all([
      fetchTotalCustomers(),
      fetchTotalAgents(),
      fetchActivePoliciesAndRevenue(),
      fetchPendingClaims(),
    ]);
  }, [fetchTotalCustomers, fetchTotalAgents, fetchActivePoliciesAndRevenue, fetchPendingClaims]);

  // Custom OverviewCard component with loading and error states
  const DashboardOverviewCard = ({ title, data, icon: Icon, className }) => {
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
      <div className={`p-6 rounded-xl border ${className}`}>
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

  // Initial data fetch and set up auto-refresh
  useEffect(() => {
    fetchAllData();

    // Set up auto-refresh interval
    const interval = setInterval(fetchAllData, REFRESH_INTERVAL);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [fetchAllData]);

  return (
    <DashboardLayout menuItems={AdminMenuItems}>
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Auto-refresh indicator */}
      <div className="mb-4 flex justify-end">
        <p className="text-xs text-gray-500">
          Auto-refreshes every 30 seconds
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <DashboardOverviewCard
          title="Total Customers"
          data={dashboardData.totalCustomers}
          icon={UsersIcon}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100"
        />
        <DashboardOverviewCard
          title="Total Agents"
          data={dashboardData.totalAgents}
          icon={UserGroupIcon}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100"
        />
        <DashboardOverviewCard
          title="Active Policies"
          data={dashboardData.activePolicies}
          icon={DocumentTextIcon}
          className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100"
        />
        <DashboardOverviewCard
          title="Pending Claims"
          data={dashboardData.pendingClaims}
          icon={ClipboardDocumentListIcon}
          className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100"
        />
        <DashboardOverviewCard
          title="Total Revenue"
          data={dashboardData.totalRevenue}
          icon={BanknotesIcon}
          className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100"
        />
      </div>
    </DashboardLayout>
  );
};