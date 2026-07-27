import { useMutation } from "@tanstack/react-query";
import type {
  Core_ApiCmptComputeStatusResponse,
  Core_ApiInitiateCmptComputeResponse,
  WaitForCmptComputeResult,
} from "@florent-uzio/custody";
import {
  getCmptComputeStatus,
  getCmptComputeStatusAndWait,
  initiateCmptCompute,
  initiateCmptComputeAndWait,
  type CmptComputeStatusInput,
  type CmptWaitOptions,
  type InitiateCmptComputeInput,
} from "../_actions/cmpt-compute";

/**
 * Kicks off a cMPT computation. `wait` picks between the fire-and-forget
 * `initiateCmptCompute` (returns `{ cmptComputeId, status }` immediately) and
 * `initiateCmptComputeAndWait` (polls to a terminal status and returns the
 * `cryptographicFields`).
 */
export function useInitiateCmptCompute() {
  return useMutation<
    Core_ApiInitiateCmptComputeResponse | WaitForCmptComputeResult,
    Error,
    {
      input: InitiateCmptComputeInput;
      wait: boolean;
      options?: CmptWaitOptions;
    }
  >({
    mutationFn: ({ input, wait, options }) =>
      wait
        ? initiateCmptComputeAndWait(input, options)
        : initiateCmptCompute(input),
  });
}

/** Reads a computation's status — one shot, or polled to a terminal status. */
export function useCmptComputeStatus() {
  return useMutation<
    Core_ApiCmptComputeStatusResponse | WaitForCmptComputeResult,
    Error,
    {
      input: CmptComputeStatusInput;
      wait: boolean;
      options?: CmptWaitOptions;
    }
  >({
    mutationFn: ({ input, wait, options }) =>
      wait
        ? getCmptComputeStatusAndWait(input, options)
        : getCmptComputeStatus(input),
  });
}
