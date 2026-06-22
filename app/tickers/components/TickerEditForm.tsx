"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProposeUpdateTickerInput } from "../../_actions/tickers";

export type TickerEditResult = Pick<
  ProposeUpdateTickerInput,
  "name" | "decimals" | "symbol" | "description" | "customProperties"
>;

export type TickerEditInitial = {
  name: string;
  decimals?: number;
  symbol?: string;
  description?: string;
  customProperties?: Record<string, string>;
};

interface Props {
  initial: TickerEditInitial;
  submitting: boolean;
  disabled?: boolean;
  disabledReason?: string | null;
  submitError: string | null;
  cancelHref: string;
  onSubmit: (result: TickerEditResult) => void;
}

export function TickerEditForm({
  initial,
  submitting,
  disabled = false,
  disabledReason,
  submitError,
  cancelHref,
  onSubmit,
}: Props) {
  const [name, setName] = useState(initial.name);
  const [symbol, setSymbol] = useState(initial.symbol ?? "");
  const [decimals, setDecimals] = useState(
    initial.decimals === undefined ? "" : String(initial.decimals),
  );
  const [description, setDescription] = useState(initial.description ?? "");
  const [customPropsJson, setCustomPropsJson] = useState(
    initial.customProperties && Object.keys(initial.customProperties).length > 0
      ? JSON.stringify(initial.customProperties, null, 2)
      : "",
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError("Name is required.");
      return;
    }

    let customProperties: Record<string, string> = {};
    if (customPropsJson.trim()) {
      let obj: unknown;
      try {
        obj = JSON.parse(customPropsJson);
      } catch {
        setValidationError("Invalid JSON in customProperties.");
        return;
      }
      if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
        setValidationError("customProperties must be a JSON object.");
        return;
      }
      customProperties = obj as Record<string, string>;
    }

    onSubmit({
      name: name.trim(),
      ...(decimals !== "" && { decimals: Number(decimals) }),
      ...(symbol.trim() && { symbol: symbol.trim() }),
      ...(description.trim() && { description: description.trim() }),
      customProperties,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5"
    >
      <Field label="Name" required>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
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

      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={`${inputCls} resize-none`}
          placeholder="Optional description"
        />
      </Field>

      <Field label="customProperties (JSON object, optional)">
        <textarea
          value={customPropsJson}
          onChange={(e) => setCustomPropsJson(e.target.value)}
          className={`${inputCls} font-mono text-xs`}
          rows={3}
          placeholder='{"key":"value"}'
        />
      </Field>

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

      {disabledReason && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
          {disabledReason}
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
