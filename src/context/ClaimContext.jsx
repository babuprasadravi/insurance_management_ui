import { createContext, useState, useContext } from "react";

const ClaimContext = createContext();

export const ClaimProvider = ({ children }) => {
  const [claims, setClaims] = useState([]);

  const addClaim = (claim) => {
    setClaims((prevClaims) => [...prevClaims, { 
      id: `CLM-${Date.now()}`,
      status: "Under Review", 
      createdAt: new Date(),
      ...claim 
    }]);
  };

  return (
    <ClaimContext.Provider value={{ claims, addClaim }}>
      {children}
    </ClaimContext.Provider>
  );
};

export const useClaim = () => useContext(ClaimContext);