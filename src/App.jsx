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
import { PolicyProvider } from "./context/PolicyProvider";
import { MyPolicies } from "./components/pages/MyPolicies";
import { FileClaimForm } from "./components/pages/FileClaimForm";
import { ClaimProvider } from "./context/ClaimContext";
import { MyClaims } from "./components/pages/MyClaims";
import { AgentDashboard } from "./components/pages/AgentDashboard";
import { AgentProvider } from "./context/AgentContext";
import { AssignedCustomers } from "./components/pages/AssignedCustomers";
import { CreatePolicy } from "./components/pages/CreatePolicy";
import { AgentPolicies } from "./components/pages/AgentPolicies";
import { ClaimsQueue } from "./components/pages/ClaimsQueue";
import { AgentProfile } from "./components/pages/agentProfile";

function App() {
  return (
    <PolicyProvider>
      <ClaimProvider>
        <AgentProvider>
          <Router>
            <Toaster position="top-right" />
            <Routes>
              <Route
                path="/"
                element={<CustomerLandingPage features={features} />}
              />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<CustomerDashboard />} />
              <Route path="/dashboard/settings" element={<Profile />} />
              <Route
                path="/dashboard/browse-policies"
                element={<BrowsePolicies />}
              />
              <Route
                path="/dashboard/policy-application"
                element={<PolicyApplicationForm />}
              />
              <Route path="/dashboard/my-policies" element={<MyPolicies />} />
              <Route path="/dashboard/file-claim" element={<FileClaimForm />} />
              <Route path="/dashboard/claims" element={<MyClaims />} />
              <Route
                path="/dashboard/notifications"
                element={<CustomerDashboard />}
              />
              <Route path="/agentDashboard" element={<AgentDashboard />} />
              <Route
              path="/agentDashboard/customers"
              element={<AssignedCustomers />}
            />
            <Route
              path="/agentDashboard/create-policy"
              element={<CreatePolicy />}
            />
            <Route
              path="/agentDashboard/policies"
              element={<AgentPolicies />}
            />
            <Route path="/agentDashboard/claims" element={<ClaimsQueue />} />
            <Route path="/agentDashboard/profile" element={<AgentProfile />} />
            </Routes>
          </Router>
        </AgentProvider>
      </ClaimProvider>
    </PolicyProvider>
  );
}

export default App;
