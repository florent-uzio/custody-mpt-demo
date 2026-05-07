import { mptAuthorize, type MptAuthorizeInput } from "../_actions/mpt";
import { useSubmitIntent } from "./useSubmitIntent";

export function useSubmitMPTokenAuthorize() {
  return useSubmitIntent<MptAuthorizeInput>("MPTAuthorize", mptAuthorize);
}
