import { clawback, type ClawbackInput } from "../_actions/clawback";
import { useSubmitIntent } from "./useSubmitIntent";

export function useSubmitClawback() {
  return useSubmitIntent<ClawbackInput>("Clawback", clawback);
}
