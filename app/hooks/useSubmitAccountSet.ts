import { useMutation } from "@tanstack/react-query";
import { accountSet, type AccountSetInput } from "../_actions/accountset";

/**
 * Submits an AccountSet intent via `custody.xrpl.proposeIntent`. The action
 * returns `{ requestId, response, submitted }` (not the shared
 * `ProposeIntentResult`), so this wraps `useMutation` directly rather than
 * reusing `useSubmitIntent`.
 */
export function useSubmitAccountSet() {
  return useMutation({
    mutationFn: (input: AccountSetInput) => accountSet(input),
  });
}
