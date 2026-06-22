"use client";

import { useState } from "react";
import Link from "next/link";
import { XrplLedgerId } from "@florent-uzio/custody";
import type { ProposeCreateTickerInput } from "../../_actions/tickers";

type LedgerDetails = ProposeCreateTickerInput["ledgerDetails"];
type XrplDetails = Extract<LedgerDetails, { type: "XRPL" }>;
type XrplProperties = XrplDetails["properties"];
type PropertyType = XrplProperties["type"];
type Kind = ProposeCreateTickerInput["kind"];

export type TickerCreateResult = Omit<ProposeCreateTickerInput, "domainId">;

const XRPL_LEDGER_IDS: readonly XrplLedgerId[] = [
  "xrpl",
  "xrpl-testnet-august-2024",
  "xrpl-devnet",
];

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "FungibleToken", label: "Fungible Token (IOU)" },
  { value: "MultiPurposeToken", label: "Multi-Purpose Token (MPT)" },
  { value: "Native", label: "Native" },
];

interface Props {
  submitting: boolean;
  disabled?: boolean;
  submitError: string | null;
  cancelHref: string;
  onSubmit: (result: TickerCreateResult) => void;
}

export function TickerCreateForm({
  submitting,
  disabled = false,
  submitError,
  cancelHref,
  onSubmit,
}: Props) {
  const [ledgerId, setLedgerId] = useState<XrplLedgerId>(
    "xrpl-testnet-august-2024",
  );
  const [propertyType, setPropertyType] =
    useState<PropertyType>("FungibleToken");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState("");
  const [currencyCode, setCurrencyCode] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issuanceId, setIssuanceId] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError("Name is required.");
      return;
    }

    let properties: XrplProperties;
    if (propertyType === "Native") {
      properties = { type: "Native" };
    } else if (propertyType === "FungibleToken") {
      if (!currencyCode.trim() || !issuer.trim()) {
        setValidationError(
          "Currency code and issuer are required for a Fungible Token.",
        );
        return;
      }
      properties = {
        type: "FungibleToken",
        currencyCode: currencyCode.trim(),
        issuer: issuer.trim(),
      };
    } else {
      if (!issuanceId.trim()) {
        setValidationError(
          "Issuance ID is required for a Multi-Purpose Token.",
        );
        return;
      }
      properties = { type: "MultiPurposeToken", issuanceId: issuanceId.trim() };
    }

    const ledgerDetails: XrplDetails = { type: "XRPL", properties };
    const kind: Kind = propertyType === "Native" ? "Native" : "Token";

    onSubmit({
      ledgerId,
      kind,
      name: name.trim(),
      ...(symbol.trim() && { symbol: symbol.trim() }),
      ...(decimals !== "" && { decimals: Number(decimals) }),
      ledgerDetails,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Ledger">
          <select
            value={ledgerId}
            onChange={(e) => setLedgerId(e.target.value as XrplLedgerId)}
            className={`${inputCls} bg-white`}
          >
            {XRPL_LEDGER_IDS.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Property type">
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value as PropertyType)}
            className={`${inputCls} bg-white`}
          >
            {PROPERTY_TYPES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {propertyType === "FungibleToken" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Currency code" required>
            <input
              type="text"
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              className={inputCls}
              placeholder="e.g. USD"
            />
          </Field>
          <Field label="Issuer" required>
            <input
              type="text"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              className={`${inputCls} font-mono`}
              placeholder="rIssuerAddress…"
            />
          </Field>
        </div>
      )}

      {propertyType === "MultiPurposeToken" && (
        <Field label="Issuance ID" required>
          <input
            type="text"
            value={issuanceId}
            onChange={(e) => setIssuanceId(e.target.value)}
            className={`${inputCls} font-mono`}
            placeholder="MPT Issuance ID (192-bit hex)"
          />
        </Field>
      )}

      <Field label="Name" required>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
          placeholder="e.g. US Dollar"
          required
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Symbol">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className={inputCls}
            placeholder="e.g. USD"
          />
        </Field>
        <Field label="Decimals">
          <input
            type="number"
            value={decimals}
            onChange={(e) => setDecimals(e.target.value)}
            className={inputCls}
            placeholder="e.g. 6"
            min="0"
          />
        </Field>
      </div>

      {validationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {validationError}
        </div>
      )}

      {submitError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
        <Link
          href={cancelHref}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting || disabled}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          {submitting ? "Proposing…" : "Propose intent"}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
