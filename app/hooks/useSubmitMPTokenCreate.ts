import { mptCreate } from "../_actions/mpt";
import { useSubmitIntent } from "./useSubmitIntent";
import type { MPTCreatePayload } from "../components/MPTCreate.types";

export function useSubmitMPTokenCreate() {
  return useSubmitIntent<MPTCreatePayload>("MPTIssuanceCreate", mptCreate);
}
