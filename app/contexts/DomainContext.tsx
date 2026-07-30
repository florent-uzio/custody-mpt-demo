"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  ReactNode,
} from "react";

const DOMAIN_ID_STORAGE_KEY = "custody_default_domain_id";

// localStorage is the source of truth, so it is read as an external store: no
// setState-in-effect on mount, and other tabs stay in sync via `storage`.
const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

const getSnapshot = () => localStorage.getItem(DOMAIN_ID_STORAGE_KEY) ?? "";
// The server has no localStorage; the value fills in after hydration.
const getServerSnapshot = () => "";

interface DomainContextType {
  defaultDomainId: string;
  setDefaultDomainId: (id: string) => void;
}

const DomainContext = createContext<DomainContextType | undefined>(undefined);

export function DomainProvider({ children }: { children: ReactNode }) {
  const defaultDomainId = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setDefaultDomainId = useCallback((id: string) => {
    localStorage.setItem(DOMAIN_ID_STORAGE_KEY, id);
    // `storage` doesn't fire in the tab that wrote, so notify locally.
    listeners.forEach((notify) => notify());
  }, []);

  const value = useMemo(
    () => ({ defaultDomainId, setDefaultDomainId }),
    [defaultDomainId, setDefaultDomainId],
  );

  return (
    <DomainContext.Provider value={value}>{children}</DomainContext.Provider>
  );
}

export function useDefaultDomain() {
  const context = useContext(DomainContext);
  if (context === undefined) {
    throw new Error("useDefaultDomain must be used within a DomainProvider");
  }
  return context;
}

