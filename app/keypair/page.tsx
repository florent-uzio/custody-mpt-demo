"use client";

import { useState } from "react";
import { CopyButton } from "../components/CopyButton";
import { useKeypairGenerate } from "../hooks/useKeypairGenerate";
import type { KeypairResult } from "../hooks/useKeypairGenerate";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  SectionCard,
  ErrorBanner,
} from "../components/layout";

type Algorithm = KeypairResult["algorithm"];

const ALGORITHMS: { id: Algorithm; label: string; description: string }[] = [
  { id: "ed25519", label: "Ed25519", description: "Fast, secure — default for XRPL" },
  { id: "secp256k1", label: "secp256k1", description: "Bitcoin/Ethereum curve" },
  { id: "secp256r1", label: "secp256r1", description: "NIST P-256, hardware-friendly" },
];

export default function KeypairPage() {
  const [algorithm, setAlgorithm] = useState<Algorithm>("ed25519");
  const { mutate, isPending, data: keypair, error } = useKeypairGenerate();

  return (
    <Page>
      <PageHeader title="Keypair Generator" subtitle="Tools · Keypair" />
      <PageContainer width="form">
        <PageHero
          theme="blue"
          icon="🔑"
          title="Keypair Generator"
          description="Generate cryptographic keypairs using the Custody SDK. Supports all XRPL-compatible signing algorithms."
          badge={{
            label: "Client-side",
            note: "Ed25519 · secp256k1 · secp256r1",
          }}
        />

        <SectionCard title="Algorithm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ALGORITHMS.map((alg) => (
              <button
                key={alg.id}
                type="button"
                onClick={() => setAlgorithm(alg.id)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  algorithm === alg.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div
                  className={`font-mono font-semibold text-sm ${
                    algorithm === alg.id ? "text-blue-700" : "text-gray-800"
                  }`}
                >
                  {alg.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {alg.description}
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => mutate(algorithm)}
            disabled={isPending}
            className="mt-6 w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {isPending ? "Generating…" : "Generate Keypair"}
          </button>
        </SectionCard>

        <ErrorBanner error={error} />

        {keypair && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold font-mono">
                {keypair.algorithm}
              </span>
              <h3 className="text-sm font-semibold text-gray-700">
                Generated Keypair
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Public Key
                  </label>
                  <CopyButton text={keypair.publicKey} />
                </div>
                <div className="bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-800 break-all border border-gray-200">
                  {keypair.publicKey}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Private Key
                  </label>
                  <CopyButton text={keypair.privateKey} />
                </div>
                <div className="bg-red-50 rounded-lg p-3 font-mono text-xs text-red-900 break-all border border-red-200">
                  {keypair.privateKey}
                </div>
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Never share your private key. Store it securely.
                </p>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </Page>
  );
}
