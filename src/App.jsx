import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";
import { CustomerLandingPage } from "./components/landing_pages/CustomerLandingPage";
import { features } from "./constants/data";
import { SignupPage } from "./components/ui/Signup";
import { LoginPage } from "./components/ui/Login";
import { CustomerDashboard } from "./components/pages/CustomerDashboard";
import { Profile } from "./components/pages/Profile";

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<CustomerLandingPage features={features} />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/dashboard/settings" element={<Profile />} />
        <Route
          path="/dashboard/browse-policies"
          element={<CustomerDashboard />}
        />
        <Route path="/dashboard/my-policies" element={<CustomerDashboard />} />
        <Route path="/dashboard/file-claim" element={<CustomerDashboard />} />
        <Route
          path="/dashboard/notifications"
          element={<CustomerDashboard />}
        />
      </Routes>
    </Router>
  );
}

export default App;
