"use client";

import { useState } from "react";
import { SectionCard } from "./SectionCard";
import { getTheme, type ThemeName } from "./pageTheme";
import {
  DEFAULT_MAXIMUM_FEE,
  MAXIMUM_FEE_PATTERN,
  formatDropsAsXrp,
  type MaximumFee,
} from "@/app/lib/maximum-fee";

interface MaximumFeeSectionProps {
  /** `null` sends no `maximumFee` at all; a string is the drops cap to send. */
  value: MaximumFee;
  onChange: (value: MaximumFee) => void;
  /** Step badge — pass the page's next step number. */
  step?: number | string;
  theme?: ThemeName;
}

/**
 * Per-transaction `maximumFee` control, shared by every page that proposes an
 * XRPL transaction order.
 *
 * Unchecking sends no `maximumFee` and lets the custody API apply its own
 * ceiling; the drops typed before unchecking are kept, so toggling back on
 * restores them. Input is drops rather than XRP so the value signed is exactly
 * the value typed — the XRP figure below is a read-only sanity check.
 */
export function MaximumFeeSection({
  value,
  onChange,
  step,
  theme = "blue",
}: MaximumFeeSectionProps) {
  const [draft, setDraft] = useState(value ?? DEFAULT_MAXIMUM_FEE);
  const enabled = value !== null;
  const asXrp = formatDropsAsXrp(draft);

  return (
    <SectionCard step={step} theme={theme} title="Maximum Fee">
      <div className="space-y-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onChange(e.target.checked ? draft : null)}
            className="mt-1 w-4 h-4 rounded text-gray-700 border-gray-300 focus:ring-gray-500"
          />
          <span className="flex-1">
            <span className="block font-medium text-gray-900">
              Send a <code>maximumFee</code>
            </span>
            <span className="block text-sm text-gray-500">
              Caps what this transaction may burn in fees. Uncheck to leave the
              field off the transaction order — the custody API then applies its
              own ceiling.
            </span>
          </span>
        </label>

        <div className="ml-7">
          <label
            htmlFor="maximumFee"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Amount
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              id="maximumFee"
              value={enabled ? draft : ""}
              onChange={(e) => {
                setDraft(e.target.value);
                onChange(e.target.value);
              }}
              disabled={!enabled}
              required={enabled}
              pattern={MAXIMUM_FEE_PATTERN}
              title="A positive whole number of drops"
              className={`flex-1 px-4 py-2.5 border border-gray-300 rounded-lg ${
                getTheme(theme).focus
              } focus:ring-2 outline-none transition-colors font-mono text-sm disabled:bg-gray-50 disabled:text-gray-400`}
              placeholder={DEFAULT_MAXIMUM_FEE}
            />
            <span className="text-sm text-gray-500 w-12">drops</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {!enabled
              ? "No maximumFee will be sent."
              : asXrp
              ? `= ${asXrp} · the most this transaction may burn in fees`
              : "Enter a positive whole number of drops (1 XRP = 1,000,000 drops)."}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}
