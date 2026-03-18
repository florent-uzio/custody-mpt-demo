"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const DOMAIN_ID_STORAGE_KEY = "custody_default_domain_id";

interface DomainContextType {
  defaultDomainId: string;
  setDefaultDomainId: (id: string) => void;
}

const DomainContext = createContext<DomainContextType | undefined>(undefined);

export function DomainProvider({ children }: { children: ReactNode }) {
  const [defaultDomainId, setDefaultDomainIdState] = useState("");

  useEffect(() => {
    // Load from localStorage on mount
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(DOMAIN_ID_STORAGE_KEY);
      if (saved) {
        setDefaultDomainIdState(saved);
      }
    }
  }, []);

  const setDefaultDomainId = (id: string) => {
    setDefaultDomainIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem(DOMAIN_ID_STORAGE_KEY, id);
    }
  };

  return (
    <DomainContext.Provider value={{ defaultDomainId, setDefaultDomainId }}>
      {children}
    </DomainContext.Provider>
  );
}

export function useDefaultDomain() {
  const context = useContext(DomainContext);
  if (context === undefined) {
    throw new Error("useDefaultDomain must be used within a DomainProvider");
  }
  return context;
}

