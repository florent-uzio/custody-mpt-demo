import { useMutation } from "@tanstack/react-query";
import { proposePaymentDryRun } from "../_actions/intents";

export function useDryRunPayment() {
  return useMutation({ mutationFn: proposePaymentDryRun });
}
