import { useMutation } from "@tanstack/react-query";
import { saveSubmittedIntent } from "../utils/intentStorage";
import type { MPTCreatePayload } from "../components/MPTCreate.types";

async function createMPToken(
  payload: MPTCreatePayload,
): Promise<{ request: unknown; response: unknown }> {
  const res = await fetch("/api/mpt/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to create MPT issuance");
  }

  return res.json();
}

export function useMPTokenCreate() {
  return useMutation({
    mutationFn: createMPToken,
    onSuccess: (result) => {
      const responseData =
        (result?.response as Record<string, unknown>) || result;
      const requestId =
        (responseData?.id as string) ||
        (responseData?.requestId as string) ||
        ((responseData?.data as Record<string, unknown>)?.id as string);
      if (requestId) {
        saveSubmittedIntent({ type: "MPTIssuanceCreate", requestId });
      }
    },
  });
}
