import { createContext, useState, useContext } from "react";

const PolicyContext = createContext();

export const PolicyProvider = ({ children }) => {
  const [purchasedPolicies, setPurchasedPolicies] = useState([
    // Pre-populated sample policy for display purposes
    {
      id: "POL-2024-1001",
      policyId: "TW-1002",
      name: "Premium Two-Wheeler Insurance",
      type: "Two-Wheeler",
      vehicleRegNo: "KA01MR8701",
      manufacturer: "Honda",
      model: "Activa 6G",
      validityStart: "2024-02-15",
      validityEnd: "2025-02-14",
      premiumPaid: 2500,
      insuredValue: 75000,
      agentName: "Rahul Sharma",
      status: "Active"
    }
  ]);

  const addPurchasedPolicy = (policy) => {
    setPurchasedPolicies((prevPolicies) => [...prevPolicies, policy]);
  };

  return (
    <PolicyContext.Provider value={{ purchasedPolicies, addPurchasedPolicy }}>
      {children}
    </PolicyContext.Provider>
  );
};

export const usePolicy = () => useContext(PolicyContext);