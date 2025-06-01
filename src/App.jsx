import { useState } from "react";
import "./App.css";
import { CustomerLandingPage } from "./components/landing_pages/CustomerLandingPage";
import { features } from "./constants/data";

function App() {
  return (
    <CustomerLandingPage features={features} />
  );
}

export default App;
