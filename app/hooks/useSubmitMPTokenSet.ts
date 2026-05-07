import { mptSet, type MptSetInput } from "../_actions/mpt";
import { useSubmitIntent } from "./useSubmitIntent";

export function useSubmitMPTokenSet() {
  return useSubmitIntent<MptSetInput>("MPTIssuanceSet", mptSet);
}
