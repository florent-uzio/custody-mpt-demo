"use client";

import { useState, useEffect } from "react";
import { JsonViewer } from "./JsonViewer";
import { useDefaultDomain } from "../contexts/DomainContext";
import { saveSubmittedIntent } from "../utils/intentStorage";
import { CopyButton } from "./CopyButton";

interface Vault {
  data: {
    id: string;
    alias: string;
    publicKey: string;
    lock: string;
    enabledKeyStrategies?: string[];
    metadata?: {
      createdAt?: string;
      updatedAt?: string;
    };
  };
}

interface VaultsResponse {
  items: Vault[];
  count: number;
}

const KEY_STRATEGIES = [
  {
    id: "VaultSoft",
    label: "Vault Soft",
    description: "Software-based key management within the vault",
    icon: "software",
  },
  {
    id: "VaultHard",
    label: "Vault Hard",
    description: "Hardware-backed key management for enhanced security",
    icon: "hardware",
  },
  {
    id: "Random",
    label: "Random",
    description: "Randomly generated key pair",
    icon: "random",
  },
] as const;

const AVAILABLE_LEDGERS = [
  {
    id: "xrpl-devnet",
    label: "XRPL Devnet",
    description: "XRP Ledger Dev Network",
    network: "devnet",
  },
  {
    id: "xrpl-testnet-august-2024",
    label: "XRPL Testnet",
    description: "XRP Ledger Test Network",
    network: "testnet",
  },
  {
    id: "xrpl-mainnet",
    label: "XRPL Mainnet",
    description: "XRP Ledger Main Network",
    network: "mainnet",
  },
];

export function AccountCreateTab() {
  const { defaultDomainId } = useDefaultDomain();

  // Vaults state
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [vaultsLoading, setVaultsLoading] = useState(true);
  const [vaultsError, setVaultsError] = useState<string | null>(null);

  // Form state
  const [alias, setAlias] = useState("");
  const [vaultId, setVaultId] = useState("");
  const [keyStrategy, setKeyStrategy] = useState<
    "VaultSoft" | "VaultHard" | "Random"
  >("VaultSoft");
  const [selectedLedgers, setSelectedLedgers] = useState<string[]>([
    "xrpl-devnet",
  ]);
  const [lock, setLock] = useState<"Unlocked" | "Locked">("Unlocked");
  const [description, setDescription] = useState("");

  // Custom ledger input
  const [showCustomLedger, setShowCustomLedger] = useState(false);
  const [customLedger, setCustomLedger] = useState("");

  // Manual vault ID input toggle
  const [showManualVaultInput, setShowManualVaultInput] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{
    request: unknown;
    response: unknown;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch vaults on mount
  useEffect(() => {
    async function fetchVaults() {
      try {
        setVaultsLoading(true);
        setVaultsError(null);
        const res = await fetch("/api/vaults/list", { method: "POST" });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch vaults");
        }
        const data: VaultsResponse = await res.json();
        setVaults(data.items || []);
      } catch (err) {
        setVaultsError(
          err instanceof Error ? err.message : "Failed to load vaults",
        );
      } finally {
        setVaultsLoading(false);
      }
    }
    fetchVaults();
  }, []);

  const selectedVault = vaults.find((v) => v.data.id === vaultId);

  const handleLedgerToggle = (ledgerId: string) => {
    setSelectedLedgers((prev) =>
      prev.includes(ledgerId)
        ? prev.filter((l) => l !== ledgerId)
        : [...prev, ledgerId],
    );
  };

  const addCustomLedger = () => {
    if (customLedger && !selectedLedgers.includes(customLedger)) {
      setSelectedLedgers([...selectedLedgers, customLedger]);
      setCustomLedger("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/accounts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainId: defaultDomainId,
          alias,
          vaultId,
          keyStrategy,
          ledgerIds: selectedLedgers.length > 0 ? selectedLedgers : undefined,
          lock,
          description: description || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create account");
      }

      const result = await res.json();
      setResponse(result);

      // Save to localStorage if we have a requestId
      const responseData = result?.response || result;
      const requestId =
        responseData?.id || responseData?.requestId || responseData?.data?.id;
      if (requestId) {
        saveSubmittedIntent({
          type: "CreateAccount",
          requestId: requestId,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getKeyStrategyIcon = (icon: string) => {
    switch (icon) {
      case "software":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        );
      case "hardware":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
        );
      case "random":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Create XRPL Account</h2>
        </div>
        <p className="text-indigo-100 text-sm">
          Create a new XRPL account in your Custody domain by proposing an
          account creation intent. The account will be associated with a vault
          for secure key management.
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="px-2 py-1 bg-white/20 rounded-full">
            Intent-based
          </span>
          <span className="text-indigo-200">Uses v0_CreateAccount payload</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">
              1
            </span>
            Account Details
          </h3>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="alias"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Account Alias *
              </label>
              <input
                type="text"
                id="alias"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                maxLength={75}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                placeholder="My XRPL Account"
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                A friendly name to identify the account (1-75 characters)
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description (Optional)
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={250}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                placeholder="Primary trading account"
              />
              <p className="mt-2 text-xs text-gray-500">
                Optional description for the account (max 250 characters)
              </p>
            </div>
          </div>
        </div>

        {/* Vault Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">
              2
            </span>
            Select Vault *
            {selectedVault && (
              <span className="ml-auto text-sm font-normal text-indigo-600">
                {selectedVault.data.alias}
              </span>
            )}
          </h3>

          {vaultsLoading ? (
            <div className="flex items-center justify-center py-8">
              <svg
                className="animate-spin h-8 w-8 text-indigo-500"
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
              <span className="ml-3 text-gray-500">Loading vaults...</span>
            </div>
          ) : vaultsError ? (
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
                <p className="text-sm text-red-800">{vaultsError}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowManualVaultInput(true)}
                className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Enter vault ID manually instead
              </button>
            </div>
          ) : vaults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="w-12 h-12 mx-auto text-gray-300 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <p className="font-medium">No vaults found</p>
              <p className="text-sm mt-1">
                Create a vault first or enter a vault ID manually
              </p>
              <button
                type="button"
                onClick={() => setShowManualVaultInput(true)}
                className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Enter vault ID manually
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vaults.map((vault) => (
                  <label
                    key={vault.data.id}
                    className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      vaultId === vault.data.id
                        ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                        : "border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="vault"
                      value={vault.data.id}
                      checked={vaultId === vault.data.id}
                      onChange={() => {
                        setVaultId(vault.data.id);
                        setShowManualVaultInput(false);
                      }}
                      className="sr-only"
                    />

                    {/* Vault Icon & Name */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          vaultId === vault.data.id
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 truncate">
                            {vault.data.alias}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              vault.data.lock === "Unlocked"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {vault.data.lock}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-gray-400 font-mono truncate">
                            {vault.data.id}
                          </span>
                          <CopyButton text={vault.data.id} />
                        </div>
                      </div>
                    </div>

                    {/* Key Strategies */}
                    {vault.data.enabledKeyStrategies &&
                      vault.data.enabledKeyStrategies.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {vault.data.enabledKeyStrategies.map((strategy) => (
                            <span
                              key={strategy}
                              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                            >
                              {strategy}
                            </span>
                          ))}
                        </div>
                      )}

                    {/* Selected Indicator */}
                    {vaultId === vault.data.id && (
                      <div className="absolute top-2 right-2">
                        <svg
                          className="w-5 h-5 text-indigo-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>

              {/* Manual input toggle */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowManualVaultInput(!showManualVaultInput)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {showManualVaultInput
                    ? "- Hide manual input"
                    : "+ Enter vault ID manually"}
                </button>
              </div>
            </>
          )}

          {/* Manual Vault ID Input */}
          {showManualVaultInput && (
            <div className="mt-4">
              <label
                htmlFor="manualVaultId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Vault ID
              </label>
              <input
                type="text"
                id="manualVaultId"
                value={vaultId}
                onChange={(e) => setVaultId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors font-mono text-sm"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
              <p className="mt-2 text-xs text-gray-500">
                Enter a vault UUID manually if it&apos;s not listed above
              </p>
            </div>
          )}
        </div>

        {/* Key Strategy */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">
              3
            </span>
            Key Strategy *
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {KEY_STRATEGIES.map((strategy) => (
              <label
                key={strategy.id}
                className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  keyStrategy === strategy.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="keyStrategy"
                  value={strategy.id}
                  checked={keyStrategy === strategy.id}
                  onChange={() => setKeyStrategy(strategy.id)}
                  className="sr-only"
                />
                <div
                  className={`p-3 rounded-full ${
                    keyStrategy === strategy.id
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {getKeyStrategyIcon(strategy.icon)}
                </div>
                <div className="text-center">
                  <div className="font-medium text-gray-900 text-sm">
                    {strategy.label}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {strategy.description}
                  </p>
                </div>
                {keyStrategy === strategy.id && (
                  <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                    Selected
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Ledger Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">
              4
            </span>
            Ledger Configuration
            <span className="ml-auto text-sm font-normal text-gray-500">
              {selectedLedgers.length} selected
            </span>
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            Select which ledgers this account should be associated with
            (optional).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_LEDGERS.map((ledger) => (
              <label
                key={ledger.id}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedLedgers.includes(ledger.id)
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedLedgers.includes(ledger.id)}
                  onChange={() => handleLedgerToggle(ledger.id)}
                  className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">
                      {ledger.label}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        ledger.network === "mainnet"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {ledger.network}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {ledger.description}
                  </p>
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    {ledger.id}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {/* Custom Ledger */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowCustomLedger(!showCustomLedger)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {showCustomLedger
                ? "- Hide custom ledger"
                : "+ Add custom ledger"}
            </button>

            {showCustomLedger && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={customLedger}
                  onChange={(e) => setCustomLedger(e.target.value)}
                  placeholder="custom-ledger-id"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <button
                  type="button"
                  onClick={addCustomLedger}
                  disabled={!customLedger}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
            )}

            {/* Show custom ledgers added */}
            {selectedLedgers.filter(
              (l) => !AVAILABLE_LEDGERS.find((al) => al.id === l),
            ).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedLedgers
                  .filter((l) => !AVAILABLE_LEDGERS.find((al) => al.id === l))
                  .map((ledgerId) => (
                    <span
                      key={ledgerId}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-mono"
                    >
                      {ledgerId}
                      <button
                        type="button"
                        onClick={() => handleLedgerToggle(ledgerId)}
                        className="ml-1 text-gray-400 hover:text-gray-600"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Lock Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold">
              5
            </span>
            Lock Status
          </h3>

          <div className="flex gap-4">
            <label
              className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                lock === "Unlocked"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="lock"
                value="Unlocked"
                checked={lock === "Unlocked"}
                onChange={() => setLock("Unlocked")}
                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-medium text-gray-900">Unlocked</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Account can be used immediately
                </p>
              </div>
            </label>

            <label
              className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                lock === "Locked"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="lock"
                value="Locked"
                checked={lock === "Locked"}
                onChange={() => setLock("Locked")}
                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
              />
              <div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span className="font-medium text-gray-900">Locked</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Account is created but cannot be used
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-700 mb-3 text-sm">
            Configuration Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-gray-500 block text-xs">Domain ID</span>
              <span className="font-mono text-xs text-gray-800 truncate block">
                {defaultDomainId || "Not set"}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Alias</span>
              <span className="font-mono text-gray-800 truncate block">
                {alias || "\u2014"}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Vault</span>
              <span className="font-mono text-gray-800 truncate block">
                {selectedVault?.data.alias ||
                  (vaultId ? "Manual ID" : "\u2014")}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Key Strategy</span>
              <span className="font-mono text-gray-800">{keyStrategy}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Lock Status</span>
              <span className="font-mono text-gray-800">{lock}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !defaultDomainId || !alias || !vaultId}
          className="w-full px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              Creating Account...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create Account Intent
            </span>
          )}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-600 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-800 font-medium">Error: {error}</p>
          </div>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="space-y-4">
          <JsonViewer data={response.request} title="Request Payload" />
          <JsonViewer data={response.response} title="API Response" />
        </div>
      )}
    </div>
  );
}
