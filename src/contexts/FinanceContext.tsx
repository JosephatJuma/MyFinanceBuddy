import React, { createContext, useContext, useState } from "react";

interface FinanceContextType {
  showFigures: boolean;
  toggleShowFigures: () => void;
  formatCurrency: (amt: number) => string;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [showFigures, setShowFigures] = useState<boolean>(false);

  const toggleShowFigures = async () => {
    setShowFigures(!showFigures);
  };

  const formatCurrency = (amount: number) => {
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "UGX",
    }).format(amount);
    return showFigures ? formattedAmount : "UGX****";
  };

  return (
    <FinanceContext.Provider
      value={{ showFigures, toggleShowFigures, formatCurrency }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider");
  }
  return context;
}
