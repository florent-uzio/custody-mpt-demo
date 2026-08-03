import { useQuery } from "@tanstack/react-query";
import { listAccounts } from "../_actions/accounts";
import { useDefaultDomain } from "../contexts/DomainContext";

export interface ElGamalKey {
  accountId: string;
  alias: string;
  ledgerId: string;
  /** The key exactly as the accounts API returns it (base64) — what MPT Set sends. */
  publicKey: string;
}

/**
 * The ElGamal purpose keys of every account in the domain. The accounts list
 * already carries `providerDetails.purposeKeys`, so this is one request — no
 * per-account fetch needed.
 */
export function useElGamalKeys() {
  const { defaultDomainId } = useDefaultDomain();

  const { data: keys = [], isLoading: loading, error } = useQuery({
    queryKey: ["elgamal-keys", defaultDomainId],
    queryFn: async (): Promise<ElGamalKey[]> => {
      const result = await listAccounts(defaultDomainId!);
      return result.items.flatMap((item) => {
        const provider = item.data.providerDetails;
        if (!provider || !("purposeKeys" in provider)) return [];
        return provider.purposeKeys
          .filter((pk) => pk.purpose === "ElGamal")
          .map((pk) => ({
            accountId: item.data.id,
            alias: item.data.alias || item.data.id,
            ledgerId: pk.ledgerId,
            publicKey: pk.publicKey,
          }));
      });
    },
    enabled: !!defaultDomainId,
    staleTime: 60_000,
  });

  return {
    keys,
    loading,
    error: error instanceof Error ? error.message : null,
  };
}
