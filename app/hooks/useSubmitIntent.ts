import { useMutation } from "@tanstack/react-query";
import type { ProposeIntentResult } from "@/app/lib/custody";

export function useSubmitIntent<TPayload>(
  action: (payload: TPayload) => Promise<ProposeIntentResult>,
  options?: {
    onSuccess?: (result: ProposeIntentResult, payload: TPayload) => void;
  },
) {
  return useMutation({
    mutationFn: action,
    onSuccess: options?.onSuccess,
  });
}
