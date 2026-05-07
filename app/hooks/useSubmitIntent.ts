import { useMutation } from "@tanstack/react-query";
import type { ProposeIntentResult } from "@/app/lib/custody";
import {
  saveSubmittedIntent,
  type SubmittedIntent,
} from "@/app/utils/intentStorage";

type IntentType = SubmittedIntent["type"];

export function useSubmitIntent<TPayload>(
  intentType: IntentType,
  action: (payload: TPayload) => Promise<ProposeIntentResult>,
  options?: {
    onSuccess?: (result: ProposeIntentResult, payload: TPayload) => void;
  },
) {
  return useMutation({
    mutationFn: action,
    onSuccess: (result, payload) => {
      saveSubmittedIntent({ type: intentType, requestId: result.requestId });
      options?.onSuccess?.(result, payload);
    },
  });
}
