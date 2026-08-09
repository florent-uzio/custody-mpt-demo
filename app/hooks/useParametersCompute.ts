import { useMutation } from "@tanstack/react-query";
import type {
  Core_ApiInitiateParametersComputeResponse,
  Core_ApiParametersComputeStatusResponse,
  WaitForParametersComputeResult,
} from "@florent-uzio/custody";
import {
  getParametersComputeStatus,
  getParametersComputeStatusAndWait,
  initiateParametersCompute,
  initiateParametersComputeAndWait,
  type InitiateParametersComputeInput,
  type ParametersComputeStatusInput,
  type ParametersComputeWaitOptions,
} from "../_actions/parameters-compute";

/**
 * Kicks off a parameters computation. `wait` picks between the fire-and-forget
 * `initiateParametersCompute` (returns `{ id, status }` immediately) and
 * `initiateParametersComputeAndWait` (polls to a terminal status and returns the
 * `cryptographicFields`).
 */
export function useInitiateParametersCompute() {
  return useMutation<
    Core_ApiInitiateParametersComputeResponse | WaitForParametersComputeResult,
    Error,
    {
      input: InitiateParametersComputeInput;
      wait: boolean;
      options?: ParametersComputeWaitOptions;
    }
  >({
    mutationFn: ({ input, wait, options }) =>
      wait
        ? initiateParametersComputeAndWait(input, options)
        : initiateParametersCompute(input),
  });
}

/** Reads a computation's status — one shot, or polled to a terminal status. */
export function useParametersComputeStatus() {
  return useMutation<
    Core_ApiParametersComputeStatusResponse | WaitForParametersComputeResult,
    Error,
    {
      input: ParametersComputeStatusInput;
      wait: boolean;
      options?: ParametersComputeWaitOptions;
    }
  >({
    mutationFn: ({ input, wait, options }) =>
      wait
        ? getParametersComputeStatusAndWait(input, options)
        : getParametersComputeStatus(input),
  });
}
