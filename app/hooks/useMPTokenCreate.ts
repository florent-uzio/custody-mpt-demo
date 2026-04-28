import { useMutation } from "@tanstack/react-query";
import { mptCreate } from "../_actions/mpt";
import { saveSubmittedIntent } from "../utils/intentStorage";
import type { MPTCreatePayload } from "../components/MPTCreate.types";

export function useMPTokenCreate() {
  return useMutation({
    mutationFn: (payload: MPTCreatePayload) =>
      mptCreate(payload as Parameters<typeof mptCreate>[0]),
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
