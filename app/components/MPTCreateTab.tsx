"use client";

import { useState, useMemo } from "react";
import { JsonViewer } from "./JsonViewer";
import { useAccounts } from "../hooks/useAccounts";
import { saveSubmittedIntent } from "../utils/intentStorage";
import { DEFAULT_ACCOUNT_ID } from "../config/defaults";
import { useDefaultDomain } from "../contexts/DomainContext";
import { CopyButton } from "./CopyButton";

// MPT Issuance Create Flags (from XRPL docs)
const MPT_FLAGS = [
  {
    name: "tfMPTCanLock",
    value: 2,
    description: "MPT can be locked both individually and globally",
  },
  {
    name: "tfMPTRequireAuth",
    value: 4,
    description: "Individual holders must be authorized to hold this MPT",
  },
  {
    name: "tfMPTCanEscrow",
    value: 8,
    description: "Holders can place their balances into an escrow",
  },
  {
    name: "tfMPTCanTrade",
    value: 16,
    description: "Holders can trade balances on the XRP Ledger DEX",
  },
  {
    name: "tfMPTCanTransfer",
    value: 32,
    description: "Tokens can be transferred to accounts other than the issuer",
  },
  {
    name: "tfMPTCanClawback",
    value: 64,
    description: "Issuer can clawback value from individual holders",
  },
];

// XLS-89 Metadata schema default template
const DEFAULT_METADATA = {
  t: "", // ticker symbol
  n: "", // name
  d: "", // description
  i: "", // icon URL
  ac: "", // access control (e.g., "rwa", "public")
  as: "", // asset class (e.g., "treasury", "stablecoin")
  in: "", // issuer name
  us: [] as { u: string; c: string; t: string }[], // URLs
  ai: {} as Record<string, string>, // additional info
};

interface MetadataUrl {
  u: string;
  c: string;
  t: string;
}

export function MPTCreateTab() {
  const { defaultDomainId } = useDefaultDomain();
  const { accounts, loading: accountsLoading } = useAccounts();

  // Form state
  const [accountId, setAccountId] = useState(DEFAULT_ACCOUNT_ID);
  const [assetScale, setAssetScale] = useState<number>(2);
  const [transferFee, setTransferFee] = useState<number>(0);
  const [maximumAmount, setMaximumAmount] = useState("");
  const [selectedFlags, setSelectedFlags] = useState<number[]>([32]); // Default: tfMPTCanTransfer

  // XLS-89 Metadata state
  const [ticker, setTicker] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [accessControl, setAccessControl] = useState("");
  const [assetClass, setAssetClass] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [urls, setUrls] = useState<MetadataUrl[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState<
    { key: string; value: string }[]
  >([]);

  // Metadata mode state
  const [metadataMode, setMetadataMode] = useState<"structured" | "raw">("structured");
  const [rawMetadata, setRawMetadata] = useState<string>("");
  const [rawMetadataError, setRawMetadataError] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{
    request: unknown;
    response: unknown;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedMetadata, setShowAdvancedMetadata] = useState(false);

  // Calculate combined flags value
  const combinedFlags = useMemo(() => {
    return selectedFlags.reduce((acc, flag) => acc | flag, 0);
  }, [selectedFlags]);

  // Build XLS-89 metadata object
  const buildMetadata = () => {
    const metadata: Record<string, unknown> = {};

    if (ticker) metadata.t = ticker;
    if (tokenName) metadata.n = tokenName;
    if (tokenDescription) metadata.d = tokenDescription;
    if (iconUrl) metadata.i = iconUrl;
    if (accessControl) metadata.ac = accessControl;
    if (assetClass) metadata.as = assetClass;
    if (issuerName) metadata.in = issuerName;

    if (urls.length > 0) {
      metadata.us = urls.filter((url) => url.u);
    }

    if (additionalInfo.length > 0) {
      const ai: Record<string, string> = {};
      additionalInfo.forEach(({ key, value }) => {
        if (key && value) ai[key] = value;
      });
      if (Object.keys(ai).length > 0) {
        metadata.ai = ai;
      }
    }

    return Object.keys(metadata).length > 0 ? metadata : null;
  };

  // Convert metadata to hex
  const metadataToHex = (metadataObj: Record<string, unknown> | null) => {
    if (!metadataObj) return "";
    const jsonString = JSON.stringify(metadataObj);
    return Buffer.from(jsonString, "utf-8").toString("hex").toUpperCase();
  };

  // Parse and validate raw JSON metadata
  const parseRawMetadata = (): { metadata: Record<string, unknown> | null; error: string | null } => {
    if (!rawMetadata.trim()) {
      return { metadata: null, error: null };
    }
    try {
      const parsed = JSON.parse(rawMetadata);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return { metadata: null, error: "Metadata must be a JSON object" };
      }
      return { metadata: parsed, error: null };
    } catch (e) {
      return { metadata: null, error: e instanceof Error ? e.message : "Invalid JSON" };
    }
  };

  // Get final metadata based on mode
  const getFinalMetadata = (): Record<string, unknown> | null => {
    if (metadataMode === "raw") {
      const { metadata: parsed } = parseRawMetadata();
      return parsed;
    }
    return buildMetadata();
  };

  const structuredMetadata = buildMetadata();
  const { metadata: parsedRawMetadata, error: rawParseError } = parseRawMetadata();
  const finalMetadata = getFinalMetadata();
  const metadataHex = metadataToHex(finalMetadata);

  const handleFlagToggle = (flagValue: number) => {
    setSelectedFlags((prev) =>
      prev.includes(flagValue)
        ? prev.filter((f) => f !== flagValue)
        : [...prev, flagValue]
    );
  };

  const addUrl = () => {
    setUrls([...urls, { u: "", c: "", t: "" }]);
  };

  const removeUrl = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const updateUrl = (
    index: number,
    field: keyof MetadataUrl,
    value: string
  ) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    setUrls(newUrls);
  };

  const addAdditionalInfo = () => {
    setAdditionalInfo([...additionalInfo, { key: "", value: "" }]);
  };

  const removeAdditionalInfo = (index: number) => {
    setAdditionalInfo(additionalInfo.filter((_, i) => i !== index));
  };

  const updateAdditionalInfo = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newInfo = [...additionalInfo];
    newInfo[index][field] = value;
    setAdditionalInfo(newInfo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/mpt/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId,
          domainId: defaultDomainId,
          assetScale,
          transferFee,
          maximumAmount: maximumAmount || undefined,
          flags: combinedFlags,
          metadata: metadataHex || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create MPT issuance");
      }

      const result = await res.json();
      setResponse(result);

      // Save to localStorage if we have a requestId
      const responseData = result?.response || result;
      const requestId =
        responseData?.id || responseData?.requestId || responseData?.data?.id;
      if (requestId) {
        saveSubmittedIntent({
          type: "MPTIssuanceCreate",
          requestId: requestId,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
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
          <h2 className="text-2xl font-bold">Create MPT Issuance</h2>
        </div>
        <p className="text-violet-100 text-sm">
          Create a new Multi-Purpose Token (MPT) issuance on the XRP Ledger.
          This defines the properties of your token before minting.
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="px-2 py-1 bg-white/20 rounded-full">XLS-89</span>
          <span className="text-violet-200">
            Metadata follows the XRPL Standards specification
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
              1
            </span>
            Issuer Account
          </h3>

          <div>
            <label
              htmlFor="accountId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Account ID
            </label>
            <select
              id="accountId"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors bg-white"
              required
              disabled={accountsLoading}
            >
              {accountsLoading ? (
                <option>Loading accounts...</option>
              ) : accounts.length === 0 ? (
                <option value="">No accounts found - set Default Domain ID</option>
              ) : (
                accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.alias} ({account.id})
                  </option>
                ))
              )}
            </select>
            <p className="mt-2 text-xs text-gray-500">
              The account that will become the issuer of this MPT
            </p>
          </div>
        </div>

        {/* Token Properties */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
              2
            </span>
            Token Properties
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="assetScale"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Asset Scale
              </label>
              <input
                type="number"
                id="assetScale"
                value={assetScale}
                onChange={(e) =>
                  setAssetScale(
                    Math.max(0, Math.min(255, parseInt(e.target.value) || 0))
                  )
                }
                min={0}
                max={255}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors"
              />
              <p className="mt-2 text-xs text-gray-500">
                Decimal places (0-255). E.g., 2 means 1 unit = 0.01 standard
                units
              </p>
            </div>

            <div>
              <label
                htmlFor="transferFee"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Transfer Fee
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="transferFee"
                  value={transferFee}
                  onChange={(e) =>
                    setTransferFee(
                      Math.max(0, Math.min(50000, parseInt(e.target.value) || 0))
                    )
                  }
                  min={0}
                  max={50000}
                  className="w-full px-4 py-2.5 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  = {(transferFee / 1000).toFixed(3)}%
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Fee for secondary sales (0-50000 = 0.000%-50.000%). Requires
                tfMPTCanTransfer flag.
              </p>
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="maximumAmount"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Maximum Amount (Optional)
              </label>
              <input
                type="text"
                id="maximumAmount"
                value={maximumAmount}
                onChange={(e) => setMaximumAmount(e.target.value)}
                placeholder="9223372036854775807"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors font-mono"
              />
              <p className="mt-2 text-xs text-gray-500">
                Maximum tokens that can ever be issued. Leave empty for default
                max (2^63-1)
              </p>
            </div>
          </div>
        </div>

        {/* Token Flags */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
              3
            </span>
            Token Flags
            <span className="ml-auto text-sm font-normal text-gray-500">
              Combined: {combinedFlags} (0x{combinedFlags.toString(16).toUpperCase().padStart(8, '0')})
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MPT_FLAGS.map((flag) => (
              <label
                key={flag.name}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedFlags.includes(flag.value)
                    ? "border-violet-500 bg-violet-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedFlags.includes(flag.value)}
                  onChange={() => handleFlagToggle(flag.value)}
                  className="mt-1 w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">
                      {flag.name}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      ({flag.value})
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{flag.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* XLS-89 Metadata */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
              4
            </span>
            Token Metadata (XLS-89)
            <a
              href="https://github.com/XRPLF/XRPL-Standards/tree/master/XLS-0089-multi-purpose-token-metadata-schema"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-xs text-violet-600 hover:text-violet-700 font-normal"
            >
              View Spec ↗
            </a>
          </h3>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2 mb-6 p-1 bg-gray-100 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setMetadataMode("structured")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                metadataMode === "structured"
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Structured Form
            </button>
            <button
              type="button"
              onClick={() => setMetadataMode("raw")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                metadataMode === "raw"
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Raw JSON
            </button>
          </div>

          {/* Raw JSON Mode */}
          {metadataMode === "raw" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raw JSON Metadata
                </label>
                <textarea
                  value={rawMetadata}
                  onChange={(e) => setRawMetadata(e.target.value)}
                  placeholder={`{
  "t": "TBILL",
  "n": "T-Bill Yield Token",
  "d": "A yield-bearing stablecoin backed by short-term U.S. Treasuries",
  "i": "https://example.org/token-icon.png",
  "in": "Example Yield Co.",
  "ac": "rwa",
  "as": "treasury"
}`}
                  rows={12}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors font-mono text-sm ${
                    rawParseError
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {rawParseError && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {rawParseError}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Enter valid JSON following the XLS-89 schema. The metadata will be hex-encoded before submission.
                </p>
              </div>

              {/* Quick copy from structured */}
              {structuredMetadata && (
                <button
                  type="button"
                  onClick={() => setRawMetadata(JSON.stringify(structuredMetadata, null, 2))}
                  className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy from structured form fields
                </button>
              )}
            </div>
          )}

          {/* Structured Form Mode */}
          {metadataMode === "structured" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ticker Symbol (t)
                </label>
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  placeholder="TBILL"
                  maxLength={10}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token Name (n)
                </label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder="T-Bill Yield Token"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (d)
              </label>
              <textarea
                value={tokenDescription}
                onChange={(e) => setTokenDescription(e.target.value)}
                placeholder="A yield-bearing stablecoin backed by short-term U.S. Treasuries..."
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issuer Name (in)
                </label>
                <input
                  type="text"
                  value={issuerName}
                  onChange={(e) => setIssuerName(e.target.value)}
                  placeholder="Example Yield Co."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon URL (i)
                </label>
                <input
                  type="url"
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  placeholder="https://example.org/token-icon.png"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Advanced Metadata Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvancedMetadata(!showAdvancedMetadata)}
              className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
            >
              <svg
                className={`w-4 h-4 transition-transform ${
                  showAdvancedMetadata ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              Advanced Metadata Options
            </button>

            {showAdvancedMetadata && (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Control (ac)
                    </label>
                    <select
                      value={accessControl}
                      onChange={(e) => setAccessControl(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors bg-white"
                    >
                      <option value="">Select...</option>
                      <option value="public">Public</option>
                      <option value="rwa">RWA (Real World Asset)</option>
                      <option value="kyc">KYC Required</option>
                      <option value="accredited">Accredited Investors</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Asset Class (as)
                    </label>
                    <select
                      value={assetClass}
                      onChange={(e) => setAssetClass(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors bg-white"
                    >
                      <option value="">Select...</option>
                      <option value="treasury">Treasury</option>
                      <option value="stablecoin">Stablecoin</option>
                      <option value="security">Security</option>
                      <option value="commodity">Commodity</option>
                      <option value="utility">Utility</option>
                      <option value="governance">Governance</option>
                    </select>
                  </div>
                </div>

                {/* URLs Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      URLs (us)
                    </label>
                    <button
                      type="button"
                      onClick={addUrl}
                      className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                    >
                      + Add URL
                    </button>
                  </div>

                  {urls.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      No URLs added. Click "Add URL" to include website links,
                      documentation, etc.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {urls.map((url, index) => (
                        <div
                          key={index}
                          className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <input
                              type="url"
                              value={url.u}
                              onChange={(e) =>
                                updateUrl(index, "u", e.target.value)
                              }
                              placeholder="URL"
                              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                            />
                            <input
                              type="text"
                              value={url.c}
                              onChange={(e) =>
                                updateUrl(index, "c", e.target.value)
                              }
                              placeholder="Category (e.g., website)"
                              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                            />
                            <input
                              type="text"
                              value={url.t}
                              onChange={(e) =>
                                updateUrl(index, "t", e.target.value)
                              }
                              placeholder="Title"
                              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeUrl(index)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
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
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Additional Info Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Additional Info (ai)
                    </label>
                    <button
                      type="button"
                      onClick={addAdditionalInfo}
                      className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                    >
                      + Add Field
                    </button>
                  </div>

                  {additionalInfo.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      No additional info. Add custom key-value pairs like
                      interest_rate, maturity_date, etc.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {additionalInfo.map((info, index) => (
                        <div
                          key={index}
                          className="flex gap-2 items-center p-3 bg-gray-50 rounded-lg"
                        >
                          <input
                            type="text"
                            value={info.key}
                            onChange={(e) =>
                              updateAdditionalInfo(index, "key", e.target.value)
                            }
                            placeholder="Key (e.g., interest_rate)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                          />
                          <input
                            type="text"
                            value={info.value}
                            onChange={(e) =>
                              updateAdditionalInfo(
                                index,
                                "value",
                                e.target.value
                              )
                            }
                            placeholder="Value (e.g., 5.00%)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeAdditionalInfo(index)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
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
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          )}

          {/* Metadata Preview */}
          {finalMetadata && !rawParseError && (
            <div className="mt-6 p-4 bg-gray-900 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 font-medium">
                  Metadata Preview (JSON) — {metadataMode === "raw" ? "Raw Input" : "Structured Form"}
                </span>
                <CopyButton
                  text={JSON.stringify(finalMetadata, null, 2)}
                />
              </div>
              <pre className="text-xs text-green-400 overflow-x-auto">
                {JSON.stringify(finalMetadata, null, 2)}
              </pre>
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400 font-medium">
                    Hex Encoded ({metadataHex.length / 2} bytes)
                  </span>
                  <CopyButton text={metadataHex} />
                </div>
                <p className="text-xs text-gray-500 font-mono break-all">
                  {metadataHex.length > 200
                    ? metadataHex.substring(0, 200) + "..."
                    : metadataHex}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Configuration Summary */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-700 mb-3 text-sm">
            Configuration Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 block text-xs">Domain ID</span>
              <span className="font-mono text-xs text-gray-800 truncate block">
                {defaultDomainId || "Not set"}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Asset Scale</span>
              <span className="font-mono text-gray-800">{assetScale}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Transfer Fee</span>
              <span className="font-mono text-gray-800">
                {(transferFee / 1000).toFixed(3)}%
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Flags</span>
              <span className="font-mono text-gray-800">{combinedFlags}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !defaultDomainId || accounts.length === 0}
          className="w-full px-6 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          {loading ? (
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
              Creating MPT Issuance...
            </span>
          ) : (
            "Create MPT Issuance"
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

