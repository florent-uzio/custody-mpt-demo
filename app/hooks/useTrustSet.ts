import { useMutation } from "@tanstack/react-query";
import { saveSubmittedIntent } from "../utils/intentStorage";
import type { TrustSetPayload } from "../components/TrustSet.types";

async function createTrustSet(
  payload: TrustSetPayload,
): Promise<{ request: unknown; response: unknown }> {
  const res = await fetch("/api/trustset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to create TrustSet");
  }

  return res.json();
}

export function useTrustSet() {
  return useMutation({
    mutationFn: createTrustSet,
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
