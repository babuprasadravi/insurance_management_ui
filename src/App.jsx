import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";
import { CustomerLandingPage } from "./components/landing_pages/CustomerLandingPage";
import { features } from "./constants/data";
import { SignupPage } from "./components/ui/Signup";
import { LoginPage } from "./components/ui/Login";
import { CustomerDashboard } from "./components/pages/CustomerDashboard";
import { Profile } from "./components/pages/Profile";
import { BrowsePolicies } from "./components/pages/BrowsePolicies";
import { PolicyApplicationForm } from "./components/pages/PolicyApplicationForm";
import { MyPolicies } from "./components/pages/MyPolicies";
import { FileClaimForm } from "./components/pages/FileClaimForm";
import { MyClaims } from "./components/pages/MyClaims";
import { AgentDashboard } from "./components/pages/AgentDashboard";
import { AssignedCustomers } from "./components/pages/AssignedCustomers";
import { CreatePolicy } from "./components/pages/CreatePolicy";
import { AgentPolicies } from "./components/pages/AgentPolicies";
import { ClaimsQueue } from "./components/pages/ClaimsQueue";
import { AgentProfile } from "./components/pages/agentProfile";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./context/AuthProvider";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={<CustomerLandingPage features={features} />}
          />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Customer Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/browse-policies"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <BrowsePolicies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/policy-application"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <PolicyApplicationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/my-policies"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <MyPolicies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/file-claim"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <FileClaimForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/claims"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <MyClaims />
              </ProtectedRoute>
            }
          />

          {/* Agent Protected Routes */}
          <Route
            path="/agentDashboard"
            element={
              <ProtectedRoute allowedRoles={["AGENT"]}>
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agentDashboard/customers"
            element={
              <ProtectedRoute allowedRoles={["AGENT"]}>
                <AssignedCustomers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agentDashboard/create-policy"
            element={
              <ProtectedRoute allowedRoles={["AGENT"]}>
                <CreatePolicy />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agentDashboard/policies"
            element={
              <ProtectedRoute allowedRoles={["AGENT"]}>
                <AgentPolicies />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agentDashboard/claims"
            element={
              <ProtectedRoute allowedRoles={["AGENT"]}>
                <ClaimsQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agentDashboard/profile"
            element={
              <ProtectedRoute allowedRoles={["AGENT"]}>
                <AgentProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
