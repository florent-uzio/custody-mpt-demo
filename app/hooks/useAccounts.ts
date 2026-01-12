import { useState, useEffect } from "react";

const DEFAULT_DOMAIN_ID = "5cd224fe-193e-8bce-c94c-c6c05245e2d1";

export interface Account {
  id: string;
  alias: string;
  domainId: string;
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/accounts/list", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            domainId: DEFAULT_DOMAIN_ID,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch accounts");
        }

        const result = await res.json();
        const accountList: Account[] = result.items.map((item: any) => ({
          id: item.data.id,
          alias: item.data.alias || item.data.id,
          domainId: item.data.domainId,
        }));

        setAccounts(accountList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching accounts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  return { accounts, loading, error };
}
