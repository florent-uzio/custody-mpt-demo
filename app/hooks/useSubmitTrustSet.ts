import { trustSet } from "../_actions/trustset";
import { useSubmitIntent } from "./useSubmitIntent";
import type { TrustSetPayload } from "../components/TrustSet.types";

export function useSubmitTrustSet() {
  return useSubmitIntent<TrustSetPayload>("TrustSet", trustSet);
}
