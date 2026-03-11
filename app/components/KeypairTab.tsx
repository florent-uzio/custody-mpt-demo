"use client";

import { useState } from "react";
import { CopyButton } from "./CopyButton";
import { useKeypairGenerate } from "../hooks/useKeypairGenerate";
import type { KeypairResult } from "../hooks/useKeypairGenerate";

type Algorithm = KeypairResult["algorithm"];

const ALGORITHMS: { id: Algorithm; label: string; description: string }[] = [
  { id: "ed25519", label: "Ed25519", description: "Fast, secure — default for XRPL" },
  { id: "secp256k1", label: "secp256k1", description: "Bitcoin/Ethereum curve" },
  { id: "secp256r1", label: "secp256r1", description: "NIST P-256, hardware-friendly" },
];

export function KeypairTab() {
  const [algorithm, setAlgorithm] = useState<Algorithm>("ed25519");
  const { mutate, isPending, data: keypair, error } = useKeypairGenerate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Keypair Generator</h2>
        </div>
        <p className="text-amber-100 text-sm">
          Generate cryptographic keypairs using the Custody SDK. Supports all
          XRPL-compatible signing algorithms.
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="px-2 py-1 bg-white/20 rounded-full">Ed25519</span>
          <span className="px-2 py-1 bg-white/20 rounded-full">secp256k1</span>
          <span className="px-2 py-1 bg-white/20 rounded-full">secp256r1</span>
          <span className="text-amber-200">Client-side generation via Custody SDK</span>
        </div>
      </div>

      {/* Generator Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Algorithm
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ALGORITHMS.map((alg) => (
              <button
                key={alg.id}
                type="button"
                onClick={() => setAlgorithm(alg.id)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  algorithm === alg.id
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div
                  className={`font-mono font-semibold text-sm ${
                    algorithm === alg.id ? "text-amber-700" : "text-gray-800"
                  }`}
                >
                  {alg.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">{alg.description}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => mutate(algorithm)}
          disabled={isPending}
          className="w-full px-4 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:bg-amber-300 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {isPending ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating...
            </span>
          ) : (
            "Generate Keypair"
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-800 font-medium">
              Error: {error instanceof Error ? error.message : "An error occurred"}
            </p>
          </div>
        </div>
      )}

      {keypair && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold font-mono">
              {keypair.algorithm}
            </span>
            <h3 className="text-sm font-semibold text-gray-700">Generated Keypair</h3>
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
    </div>
  );
}
