"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useDefaultDomain } from "../../contexts/DomainContext";
import { useSidebarContext } from "../../contexts/SidebarContext";
import {
  proposeCreatePolicy,
  type ProposeCreatePolicyInput,
} from "../../_actions/policies";
import { PolicyForm, type PolicyFormResult } from "../components/PolicyForm";

export default function NewPolicyPage() {
  const router = useRouter();
  const { defaultDomainId } = useDefaultDomain();
  const { sidebarOpen, setSidebarOpen } = useSidebarContext();

  const mutation = useMutation({
    mutationFn: (input: ProposeCreatePolicyInput) => proposeCreatePolicy(input),
    onSuccess: ({ requestId }) => {
      router.push(`/intents/${requestId}`);
    },
  });

  const handleSubmit = (result: PolicyFormResult) => {
    if (!defaultDomainId) return;
    mutation.mutate({ domainId: defaultDomainId, ...result });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md flex-shrink-0">
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
                <span className="text-white/80 text-xs font-medium">
                  Create policy
                </span>
              </div>
              <h1 className="text-white text-lg font-semibold">
                Propose create policy
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!defaultDomainId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3 mb-6">
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
                Set a <strong>Default Domain ID</strong> in the sidebar before
                creating a policy.
              </p>
            </div>
          )}

          <PolicyForm
            mode="create"
            submitting={mutation.isPending}
            disabled={!defaultDomainId}
            submitError={
              mutation.isError
                ? mutation.error instanceof Error
                  ? mutation.error.message
                  : "Failed to propose create policy intent"
                : null
            }
            cancelHref="/policies"
            onSubmit={handleSubmit}
          />
        </main>
      </div>
    </div>
  );
}
