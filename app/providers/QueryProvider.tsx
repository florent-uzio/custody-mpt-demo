"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { LEDGER_CONFIG_QUERY_KEY } from "../hooks/useLedgerConfig";
import type { LedgerConfig } from "../lib/ledgers";

export function QueryProvider({
  children,
  ledgerConfig,
}: {
  children: React.ReactNode;
  ledgerConfig: LedgerConfig;
}) {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
          refetchOnWindowFocus: false,
        },
      },
    });
    // Seeded server-side so ledger pickers resolve on the very first render.
    client.setQueryData(LEDGER_CONFIG_QUERY_KEY, ledgerConfig);
    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
