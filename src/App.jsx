import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";
import { CustomerLandingPage } from "./components/landing_pages/CustomerLandingPage";
import { features } from "./constants/data";
import { SignupPage } from "./components/ui/Signup";

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<CustomerLandingPage features={features} />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </Router>
  );
}

export default App;
