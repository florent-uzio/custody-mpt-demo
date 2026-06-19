"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSidebarContext } from "../../../contexts/SidebarContext";
import {
  getPolicy,
  proposeUpdatePolicy,
  type ProposeUpdatePolicyInput,
} from "../../../_actions/policies";
import {
  PolicyForm,
  type PolicyFormInitial,
  type PolicyFormResult,
} from "../../components/PolicyForm";
import type { Core_TrustedPolicy } from "@florent-uzio/custody";

export default function EditPolicyPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const policyId = params.id as string;
  const domainId = searchParams.get("domainId") ?? "";
  const { sidebarOpen, setSidebarOpen } = useSidebarContext();

  const detailHref = `/policies/${policyId}${domainId ? `?domainId=${domainId}` : ""}`;

  const {
    data: policy,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["policy", policyId, domainId],
    queryFn: () => getPolicy(domainId, policyId) as Promise<Core_TrustedPolicy>,
    enabled: !!policyId && !!domainId,
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: (input: ProposeUpdatePolicyInput) => proposeUpdatePolicy(input),
    onSuccess: ({ requestId }) => {
      router.push(`/intents/${requestId}`);
    },
  });

  const handleSubmit = (result: PolicyFormResult) => {
    if (!policy) return;
    mutation.mutate({
      domainId,
      policyId,
      revision: policy.data.metadata.revision,
      ...result,
    });
  };

  const initial: PolicyFormInitial | undefined = policy
    ? {
        alias: policy.data.alias,
        rank: policy.data.rank,
        scope: policy.data.scope,
        intentTypes: policy.data.intentTypes ?? [],
        condition: policy.data.condition ?? null,
        workflow: policy.data.workflow ?? null,
        description: policy.data.metadata?.description,
        customProperties: policy.data.metadata?.customProperties,
      }
    : undefined;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 shadow-md flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-start gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mt-0.5 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {sidebarOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href="/policies"
                  className="text-white/60 hover:text-white text-xs font-medium transition-colors"
                >
                  Policies
                </Link>
                <span className="text-white/40 text-xs">/</span>
                <Link
                  href={detailHref}
                  className="text-white/60 hover:text-white text-xs font-medium transition-colors"
                >
                  Detail
                </Link>
                <span className="text-white/40 text-xs">/</span>
                <span className="text-white/80 text-xs font-medium">Edit</span>
              </div>
              <h1 className="text-white text-lg font-semibold">
                Propose update policy
              </h1>
              {policy && (
                <p className="text-white/70 text-xs mt-1 font-medium">
                  {policy.data.alias} · revision{" "}
                  {policy.data.metadata.revision}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!domainId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-yellow-700">
                A <strong>domainId</strong> is required to edit this policy.
                Return to{" "}
                <Link href="/policies" className="underline font-medium">
                  Policies
                </Link>{" "}
                and open the policy again.
              </p>
            </div>
          )}

          {domainId && isLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <svg
                className="animate-spin w-8 h-8 text-amber-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-gray-500 text-sm">Loading policy…</p>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-700">
                  Error loading policy
                </p>
                <p className="text-sm text-red-600 mt-0.5">
                  {error instanceof Error ? error.message : "An error occurred"}
                </p>
              </div>
            </div>
          )}

          {policy && initial && !isLoading && (
            <PolicyForm
              mode="update"
              initial={initial}
              submitting={mutation.isPending}
              submitError={
                mutation.isError
                  ? mutation.error instanceof Error
                    ? mutation.error.message
                    : "Failed to propose update policy intent"
                  : null
              }
              cancelHref={detailHref}
              onSubmit={handleSubmit}
            />
          )}
        </main>
      </div>
    </div>
  );
}
