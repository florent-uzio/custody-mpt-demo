import { useMutation } from "@tanstack/react-query";
import { mptAuthorizeDryRun } from "../_actions/mpt";

export function useDryRunMPTokenAuthorize() {
  return useMutation({ mutationFn: mptAuthorizeDryRun });
}
