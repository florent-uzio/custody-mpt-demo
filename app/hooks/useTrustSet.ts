import { useMutation } from "@tanstack/react-query";
import { trustSet } from "../_actions/trustset";
import { saveSubmittedIntent } from "../utils/intentStorage";
import type { TrustSetPayload } from "../components/TrustSet.types";

export function useTrustSet() {
  return useMutation({
    mutationFn: (payload: TrustSetPayload) =>
      trustSet(payload as Parameters<typeof trustSet>[0]),
    onSuccess: (result) => {
      const responseData =
        (result?.response as Record<string, unknown>) || result;
      const requestId =
        (responseData?.id as string) ||
        (responseData?.requestId as string) ||
        ((responseData?.data as Record<string, unknown>)?.id as string);
      if (requestId) {
        saveSubmittedIntent({ type: "TrustSet", requestId });
      }
    },
  });
}
