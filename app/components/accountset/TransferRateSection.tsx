"use client";

import { SectionCard } from "../layout";

interface Props {
  transferRate: string;
  onChange: (value: string) => void;
}

/** Step 3 — optional transfer rate. Raw XRPL units: 1,000,000,000 = 0% fee,
 *  2,000,000,000 = 100%, 0 removes the rate. Left blank → omitted. */
export function TransferRateSection({ transferRate, onChange }: Props) {
  return (
    <SectionCard step={3} title="Transfer Rate (optional)" theme="teal">
      <label
        htmlFor="accountset-transferrate"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Transfer Rate
      </label>
      <input
        id="accountset-transferrate"
        type="number"
        min={0}
        value={transferRate}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. 1005000000 for a 0.5% fee"
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
      />
      <p className="mt-2 text-xs text-gray-500">
        Raw value: 1,000,000,000 = 0% fee, 2,000,000,000 = 100%, 0 removes the
        rate. Leave blank to skip.
      </p>
    </SectionCard>
  );
}
