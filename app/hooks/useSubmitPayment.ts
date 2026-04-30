import { proposePayment, type ProposePaymentInput } from "../_actions/intents";
import { useSubmitIntent } from "./useSubmitIntent";

export function useSubmitPayment() {
  return useSubmitIntent<ProposePaymentInput>("Payment", proposePayment);
}
