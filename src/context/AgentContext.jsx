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
      address: "123 Brigade Road, Bangalore, Karnataka",
      policies: [
        {
          id: "POL-2024-1001",
          name: "Premium Two-Wheeler Insurance",
          type: "Two-Wheeler",
          vehicleRegNo: "KA01MR8701",
          status: "Active",
          validityEnd: "2025-02-14",
          premiumPaid: 2500
        },
        {
          id: "POL-2024-1002",
          name: "Basic Car Insurance",
          type: "Four-Wheeler",
          vehicleRegNo: "KA02AB1234",
          status: "Active",
          validityEnd: "2025-03-20",
          premiumPaid: 5500
        }
      ],
      claims: [
        {
          id: "CLM-2024-001",
          policyId: "POL-2024-1001",
          amount: 15000,
          status: "Approved",
          incidentDate: "2024-01-15",
          description: "Minor accident - front panel damage"
        }
      ]
    },
    {
      id: "CUST-002",
      name: "Priya Sharma",
      email: "priya.sharma@example.com",
      phone: "+91 9876543211",
      address: "456 MG Road, Mumbai, Maharashtra",
      policies: [
        {
          id: "POL-2024-1003",
          name: "Electric Scooter Insurance",
          type: "Two-Wheeler",
          vehicleRegNo: "MH01EV5678",
          status: "Active",
          validityEnd: "2025-01-10",
          premiumPaid: 1800
        }
      ],
      claims: []
    },
    {
      id: "CUST-003",
      name: "Rajesh Patel",
      email: "rajesh.patel@example.com",
      phone: "+91 9876543212",
      address: "789 CP Road, Delhi, NCR",
      policies: [
        {
          id: "POL-2024-1004",
          name: "Premium Sedan Insurance",
          type: "Four-Wheeler",
          vehicleRegNo: "DL03CD9876",
          status: "Active",
          validityEnd: "2025-04-15",
          premiumPaid: 12000
        }
      ],
      claims: [
        {
          id: "CLM-2024-002",
          policyId: "POL-2024-1004",
          amount: 25000,
          status: "Under Review",
          incidentDate: "2024-02-10",
          description: "Rear collision damage"
        }
      ]
    },
    {
      id: "CUST-004",
      name: "Anitha Reddy",
      email: "anitha.reddy@example.com",
      phone: "+91 9876543213",
      address: "321 Tank Bund Road, Hyderabad, Telangana",
      policies: [
        {
          id: "POL-2024-1005",
          name: "Student Two-Wheeler Plan",
          type: "Two-Wheeler",
          vehicleRegNo: "TS04ST1234",
          status: "Active",
          validityEnd: "2025-06-01",
          premiumPaid: 800
        }
      ],
      claims: []
    },
    {
      id: "CUST-005",
      name: "Vikram Singh",
      email: "vikram.singh@example.com",
      phone: "+91 9876543214",
      address: "555 Ashram Road, Ahmedabad, Gujarat",
      policies: [
        {
          id: "POL-2024-1006",
          name: "SUV Special Coverage",
          type: "Four-Wheeler",
          vehicleRegNo: "GJ05UV7890",
          status: "Active",
          validityEnd: "2025-05-20",
          premiumPaid: 18000
        }
      ],
      claims: [
        {
          id: "CLM-2024-003",
          policyId: "POL-2024-1006",
          amount: 45000,
          status: "Rejected",
          incidentDate: "2024-01-25",
          description: "Claim rejected due to policy violations"
        }
      ]
    },
    {
      id: "CUST-006",
      name: "Meera Krishnan",
      email: "meera.krishnan@example.com",
      phone: "+91 9876543215",
      address: "888 Anna Salai, Chennai, Tamil Nadu",
      policies: [],
      claims: []
    },
    {
      id: "CUST-007",
      name: "Arjun Gupta",
      email: "arjun.gupta@example.com",
      phone: "+91 9876543216",
      address: "777 Park Street, Kolkata, West Bengal",
      policies: [
        {
          id: "POL-2024-1007",
          name: "Delivery Partner Insurance",
          type: "Two-Wheeler",
          vehicleRegNo: "WB06DP5555",
          status: "Expired",
          validityEnd: "2024-01-01",
          premiumPaid: 3200
        }
      ],
      claims: [
        {
          id: "CLM-2024-004",
          policyId: "POL-2024-1007",
          amount: 8000,
          status: "Pending Documentation",
          incidentDate: "2024-02-05",
          description: "Battery replacement due to accident"
        }
      ]
    },
    {
      id: "CUST-008",
      name: "Kavya Nair",
      email: "kavya.nair@example.com",
      phone: "+91 9876543217",
      address: "999 Marine Drive, Kochi, Kerala",
      policies: [
        {
          id: "POL-2024-1008",
          name: "Electric Car Insurance",
          type: "Four-Wheeler",
          vehicleRegNo: "KL07EC2468",
          status: "Active",
          validityEnd: "2025-07-10",
          premiumPaid: 15000
        }
      ],
      claims: []
    },
    {
      id: "CUST-009",
      name: "Siddharth Jain",
      email: "siddharth.jain@example.com",
      phone: "+91 9876543218",
      address: "666 Residency Road, Indore, Madhya Pradesh",
      policies: [
        {
          id: "POL-2024-1009",
          name: "Basic Two-Wheeler Insurance",
          type: "Two-Wheeler",
          vehicleRegNo: "MP08BT3691",
          status: "Active",
          validityEnd: "2025-08-15",
          premiumPaid: 1200
        }
      ],
      claims: [
        {
          id: "CLM-2024-005",
          policyId: "POL-2024-1009",
          amount: 5000,
          status: "Approved",
          incidentDate: "2024-01-30",
          description: "Handlebar and mirror damage"
        }
      ]
    },
    {
      id: "CUST-010",
      name: "Pooja Agarwal",
      email: "pooja.agarwal@example.com",
      phone: "+91 9876543219",
      address: "444 Civil Lines, Jaipur, Rajasthan",
      policies: [
        {
          id: "POL-2024-1010",
          name: "Luxury Vehicle Insurance",
          type: "Four-Wheeler",
          vehicleRegNo: "RJ09LX8520",
          status: "Active",
          validityEnd: "2025-09-01",
          premiumPaid: 35000
        }
      ],
      claims: []
    },
    {
      id: "CUST-011",
      name: "Amit Verma",
      email: "amit.verma@example.com",
      phone: "+91 9876543220",
      address: "222 Sector 15, Noida, Uttar Pradesh",
      policies: [
        {
          id: "POL-2024-1011",
          name: "Basic Car Insurance",
          type: "Four-Wheeler",
          vehicleRegNo: "UP10BC1357",
          status: "Active",
          validityEnd: "2025-10-12",
          premiumPaid: 5500
        }
      ],
      claims: [
        {
          id: "CLM-2024-006",
          policyId: "POL-2024-1011",
          amount: 12000,
          status: "Under Review",
          incidentDate: "2024-02-18",
          description: "Windshield and headlight damage"
        }
      ]
    },
    {
      id: "CUST-012",
      name: "Deepika Iyer",
      email: "deepika.iyer@example.com",
      phone: "+91 9876543221",
      address: "111 Koramangala, Bangalore, Karnataka",
      policies: [
        {
          id: "POL-2024-1012",
          name: "Premium Two-Wheeler Insurance",
          type: "Two-Wheeler",
          vehicleRegNo: "KA11PT7777",
          status: "Active",
          validityEnd: "2025-11-25",
          premiumPaid: 2500
        }
      ],
      claims: []
    },
    {
      id: "CUST-013",
      name: "Rohit Saxena",
      email: "rohit.saxena@example.com",
      phone: "+91 9876543222",
      address: "333 Hazratganj, Lucknow, Uttar Pradesh",
      policies: [],
      claims: []
    },
    {
      id: "CUST-014",
      name: "Neha Kapoor",
      email: "neha.kapoor@example.com",
      phone: "+91 9876543223",
      address: "555 Connaught Place, New Delhi, NCR",
      policies: [
        {
          id: "POL-2024-1013",
          name: "Electric Scooter Insurance",
          type: "Two-Wheeler",
          vehicleRegNo: "DL12ES9999",
          status: "Active",
          validityEnd: "2025-12-05",
          premiumPaid: 1800
        }
      ],
      claims: [
        {
          id: "CLM-2024-007",
          policyId: "POL-2024-1013",
          amount: 18000,
          status: "Rejected",
          incidentDate: "2024-02-12",
          description: "Claim denied - coverage exclusion"
        }
      ]
    },
    {
      id: "CUST-015",
      name: "Sandeep Kumar",
      email: "sandeep.kumar@example.com",
      phone: "+91 9876543224",
      address: "777 Banjara Hills, Hyderabad, Telangana",
      policies: [
        {
          id: "POL-2024-1014",
          name: "SUV Special Coverage",
          type: "Four-Wheeler",
          vehicleRegNo: "TS13SU4444",
          status: "Active",
          validityEnd: "2026-01-15",
          premiumPaid: 18000
        }
      ],
      claims: [
        {
          id: "CLM-2024-008",
          policyId: "POL-2024-1014",
          amount: 32000,
          status: "Approved",
          incidentDate: "2024-01-08",
          description: "Comprehensive damage due to natural calamity"
        }
      ]
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