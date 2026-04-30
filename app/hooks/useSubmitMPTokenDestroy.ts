import { mptDestroy, type MptDestroyInput } from "../_actions/mpt";
import { useSubmitIntent } from "./useSubmitIntent";

export function useSubmitMPTokenDestroy() {
  return useSubmitIntent<MptDestroyInput>("MPTIssuanceDestroy", mptDestroy);
}
