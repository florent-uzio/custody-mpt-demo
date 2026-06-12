import { useMutation } from "@tanstack/react-query";
import type { BatchPayloadInput, Core_BatchSigner } from "@florent-uzio/custody";
import {
  autofillBatch,
  dryRunBatch,
  fetchAccountTickets,
  fetchBatchSignature,
  previewBatchPayload,
  proposeBatch,
  requestBatchSignature,
  resolveAccountAddress,
  type BatchSignatureHandle,
  type BatchSignerRef,
} from "../_actions/batch";
import type { BatchBuildInput } from "../lib/batch-builder";

/**
 * TanStack mutations wrapping the batch server actions. The whole batch workflow
 * is one resource, so the mutations live in one hook; components read
 * `mutate`/`isPending`/`error` off each.
 */
export function useBatchActions() {
  const resolveAddress = useMutation({
    mutationFn: (v: { domainId: string; accountId: string; ledgerId?: string }) =>
      resolveAccountAddress(v.domainId, v.accountId, v.ledgerId),
  });

  const autofill = useMutation({
    mutationFn: (input: BatchBuildInput) => autofillBatch(input),
  });

  const fetchTickets = useMutation({
    mutationFn: (address: string) => fetchAccountTickets(address),
  });

  const previewPayload = useMutation({
    mutationFn: (input: BatchBuildInput) => previewBatchPayload(input),
  });

  const dryRun = useMutation({
    mutationFn: (v: { input: BatchBuildInput; domainId: string }) =>
      dryRunBatch(v.input, v.domainId),
  });

  const requestSignature = useMutation({
    mutationFn: (v: { signingPayload: string; signer: BatchSignerRef }) =>
      requestBatchSignature(v.signingPayload, v.signer),
  });

  const fetchSignature = useMutation({
    mutationFn: (handle: BatchSignatureHandle) => fetchBatchSignature(handle),
  });

  const propose = useMutation({
    mutationFn: (v: {
      payload: BatchPayloadInput;
      signers: Core_BatchSigner[];
      domainId: string;
    }) => proposeBatch(v.payload, v.signers, v.domainId),
  });

  return {
    resolveAddress,
    autofill,
    fetchTickets,
    previewPayload,
    dryRun,
    requestSignature,
    fetchSignature,
    propose,
  };
}
