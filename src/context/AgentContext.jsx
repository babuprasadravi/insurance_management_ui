import { createContext, useState, useContext } from "react";

const AgentContext = createContext();

export const AgentProvider = ({ children }) => {
  const [assignedPolicies, setAssignedPolicies] = useState([
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
      customerName: "Arul Kumar",
      customerEmail: "arul@example.com",
      status: "Active"
    }
  ]);

  const [assignedCustomers, setAssignedCustomers] = useState([
    {
      id: "CUST-001",
      name: "Arul Kumar",
      email: "arul@example.com",
      phone: "+91 9876543210",
      policies: 2,
      claims: 1
    }
  ]);

  const [pendingClaims, setPendingClaims] = useState([
    {
      id: "CLM-2024-001",
      policyId: "POL-2024-1001",
      customerName: "Arul Kumar",
      amount: 15000,
      status: "Under Review",
      submittedDate: "2024-02-20"
    }
  ]);

  const [commissionSummary, setCommissionSummary] = useState({
    totalEarned: 25000,
  });

  return (
    <AgentContext.Provider 
      value={{ 
        assignedPolicies, 
        assignedCustomers, 
        pendingClaims, 
        commissionSummary
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => useContext(AgentContext);