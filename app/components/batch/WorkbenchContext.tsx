"use client";

import { createContext, useContext } from "react";
import type { useBatchSession } from "../../hooks/useBatchSession";
import type { useBatchActions } from "../../hooks/useBatchActions";

export type WorkbenchValue = ReturnType<typeof useBatchSession> & {
  actions: ReturnType<typeof useBatchActions>;
  domainId: string;
};

const WorkbenchContext = createContext<WorkbenchValue | null>(null);

export const WorkbenchProvider = WorkbenchContext.Provider;

export function useWorkbench(): WorkbenchValue {
  const value = useContext(WorkbenchContext);
  if (!value) {
    throw new Error("useWorkbench must be used inside <WorkbenchProvider>");
  }
  return value;
}
