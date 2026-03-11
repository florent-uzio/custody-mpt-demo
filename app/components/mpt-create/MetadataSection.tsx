"use client";

import { useState } from "react";
import { CopyButton } from "../CopyButton";
import type { MetadataMode, MetadataUrl } from "../MPTCreate.types";

interface MetadataState {
  ticker: string;
  tokenName: string;
  tokenDescription: string;
  iconUrl: string;
  accessControl: string;
  assetClass: string;
  issuerName: string;
  urls: MetadataUrl[];
  additionalInfo: { key: string; value: string }[];
}

interface Props {
  onMetadataHexChange: (hex: string) => void;
}

function buildMetadata(state: MetadataState): Record<string, unknown> | null {
  const metadata: Record<string, unknown> = {};

  if (state.ticker) metadata.t = state.ticker;
  if (state.tokenName) metadata.n = state.tokenName;
  if (state.tokenDescription) metadata.d = state.tokenDescription;
  if (state.iconUrl) metadata.i = state.iconUrl;
  if (state.accessControl) metadata.ac = state.accessControl;
  if (state.assetClass) metadata.as = state.assetClass;
  if (state.issuerName) metadata.in = state.issuerName;

  const validUrls = state.urls.filter((url) => url.u);
  if (validUrls.length > 0) metadata.us = validUrls;

  const ai: Record<string, string> = {};
  state.additionalInfo.forEach(({ key, value }) => {
    if (key && value) ai[key] = value;
  });
  if (Object.keys(ai).length > 0) metadata.ai = ai;

  return Object.keys(metadata).length > 0 ? metadata : null;
}

function toHex(obj: Record<string, unknown> | null): string {
  if (!obj) return "";
  return Buffer.from(JSON.stringify(obj), "utf-8").toString("hex").toUpperCase();
}

export function MetadataSection({ onMetadataHexChange }: Props) {
  const [mode, setMode] = useState<MetadataMode>("structured");
  const [rawMetadata, setRawMetadata] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [state, setState] = useState<MetadataState>({
    ticker: "",
    tokenName: "",
    tokenDescription: "",
    iconUrl: "",
    accessControl: "",
    assetClass: "",
    issuerName: "",
    urls: [],
    additionalInfo: [],
  });

  const structuredMetadata = buildMetadata(state);

  const parseRaw = (): {
    metadata: Record<string, unknown> | null;
    error: string | null;
  } => {
    if (!rawMetadata.trim()) return { metadata: null, error: null };
    try {
      const parsed = JSON.parse(rawMetadata);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return { metadata: null, error: "Metadata must be a JSON object" };
      }
      return { metadata: parsed, error: null };
    } catch (e) {
      return {
        metadata: null,
        error: e instanceof Error ? e.message : "Invalid JSON",
      };
    }
  };

  const { metadata: parsedRaw, error: rawError } = parseRaw();
  const finalMetadata = mode === "raw" ? parsedRaw : structuredMetadata;
  const metadataHex = toHex(finalMetadata);

  const notifyParent = (hex: string) => onMetadataHexChange(hex);

  const setField = <K extends keyof MetadataState>(key: K, value: MetadataState[K]) => {
    const next = { ...state, [key]: value };
    setState(next);
    notifyParent(toHex(buildMetadata(next)));
  };

  const handleRawChange = (value: string) => {
    setRawMetadata(value);
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        notifyParent(toHex(parsed));
        return;
      }
    } catch {
      // invalid JSON, clear hex
    }
    notifyParent("");
  };

  const handleModeSwitch = (newMode: MetadataMode) => {
    setMode(newMode);
    if (newMode === "raw") {
      notifyParent(rawError ? "" : toHex(parsedRaw));
    } else {
      notifyParent(toHex(structuredMetadata));
    }
  };

  const updateUrl = (index: number, field: keyof MetadataUrl, value: string) => {
    const newUrls = [...state.urls];
    newUrls[index][field] = value;
    setField("urls", newUrls);
  };

  const updateAdditionalInfo = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const newInfo = [...state.additionalInfo];
    newInfo[index][field] = value;
    setField("additionalInfo", newInfo);
  };

  return (
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
        {(["structured", "raw"] as MetadataMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => handleModeSwitch(m)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              mode === m
                ? "bg-white text-violet-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {m === "structured" ? "Structured Form" : "Raw JSON"}
          </button>
        ))}
      </div>

      {/* Raw JSON Mode */}
      {mode === "raw" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raw JSON Metadata
            </label>
            <textarea
              value={rawMetadata}
              onChange={(e) => handleRawChange(e.target.value)}
              placeholder={`{\n  "t": "TBILL",\n  "n": "T-Bill Yield Token",\n  "d": "A yield-bearing stablecoin backed by short-term U.S. Treasuries",\n  "i": "https://example.org/token-icon.png",\n  "in": "Example Yield Co.",\n  "ac": "rwa",\n  "as": "treasury"\n}`}
              rows={12}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors font-mono text-sm ${
                rawError ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
            />
            {rawError && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {rawError}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Enter valid JSON following the XLS-89 schema. The metadata will be
              hex-encoded before submission.
            </p>
          </div>
          {structuredMetadata && (
            <button
              type="button"
              onClick={() =>
                handleRawChange(JSON.stringify(structuredMetadata, null, 2))
              }
              className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
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
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy from structured form fields
            </button>
          )}
        </div>
      )}

      {/* Structured Form Mode */}
      {mode === "structured" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ticker Symbol (t)
              </label>
              <input
                type="text"
                value={state.ticker}
                onChange={(e) => setField("ticker", e.target.value.toUpperCase())}
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
                value={state.tokenName}
                onChange={(e) => setField("tokenName", e.target.value)}
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
              value={state.tokenDescription}
              onChange={(e) => setField("tokenDescription", e.target.value)}
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
                value={state.issuerName}
                onChange={(e) => setField("issuerName", e.target.value)}
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
                value={state.iconUrl}
                onChange={(e) => setField("iconUrl", e.target.value)}
                placeholder="https://example.org/token-icon.png"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-90" : ""}`}
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

          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Control (ac)
                  </label>
                  <select
                    value={state.accessControl}
                    onChange={(e) => setField("accessControl", e.target.value)}
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
                    value={state.assetClass}
                    onChange={(e) => setField("assetClass", e.target.value)}
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

              {/* URLs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    URLs (us)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setField("urls", [...state.urls, { u: "", c: "", t: "" }])
                    }
                    className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                  >
                    + Add URL
                  </button>
                </div>
                {state.urls.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No URLs added. Click &quot;Add URL&quot; to include website
                    links, documentation, etc.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {state.urls.map((url, index) => (
                      <div
                        key={index}
                        className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <input
                            type="url"
                            value={url.u}
                            onChange={(e) => updateUrl(index, "u", e.target.value)}
                            placeholder="URL"
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                          />
                          <input
                            type="text"
                            value={url.c}
                            onChange={(e) => updateUrl(index, "c", e.target.value)}
                            placeholder="Category (e.g., website)"
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                          />
                          <input
                            type="text"
                            value={url.t}
                            onChange={(e) => updateUrl(index, "t", e.target.value)}
                            placeholder="Title"
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setField(
                              "urls",
                              state.urls.filter((_, i) => i !== index),
                            )
                          }
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

              {/* Additional Info */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Additional Info (ai)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setField("additionalInfo", [
                        ...state.additionalInfo,
                        { key: "", value: "" },
                      ])
                    }
                    className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                  >
                    + Add Field
                  </button>
                </div>
                {state.additionalInfo.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No additional info. Add custom key-value pairs like
                    interest_rate, maturity_date, etc.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {state.additionalInfo.map((info, index) => (
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
                            updateAdditionalInfo(index, "value", e.target.value)
                          }
                          placeholder="Value (e.g., 5.00%)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setField(
                              "additionalInfo",
                              state.additionalInfo.filter((_, i) => i !== index),
                            )
                          }
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
      {finalMetadata && !rawError && (
        <div className="mt-6 p-4 bg-gray-900 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium">
              Metadata Preview (JSON) —{" "}
              {mode === "raw" ? "Raw Input" : "Structured Form"}
            </span>
            <CopyButton text={JSON.stringify(finalMetadata, null, 2)} />
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
  );
}
