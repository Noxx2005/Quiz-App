import React, { createContext, useContext, useState } from "react";

// Create Context
const GlobalContext = createContext();

// Context Provider
export function GlobalContextProvider({ children }) {
  const [user, setUser] = useState(null);

  return (
    <GlobalContext.Provider value={{ user, setUser }}>
      {children}
    </GlobalContext.Provider>
  );
}

// Hook for using the context
export function useGlobalContextProvider() {
  return useContext(GlobalContext);
}
