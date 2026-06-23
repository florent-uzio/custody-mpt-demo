"use client";

import { useState } from "react";
import { CustodyAccountSelect } from "./CustodyAccountSelect";

type Mode = "address" | "account";

interface Props {
  issuer: string;
  onIssuerChange: (value: string) => void;
}

const MODES: { value: Mode; label: string }[] = [
  { value: "address", label: "Enter address" },
  { value: "account", label: "Select custody account" },
];

/** Issuer address entered either as a raw r-address or picked from a custody
 *  account, whose resolved r-address becomes the issuer. */
export function IssuerField({ issuer, onIssuerChange }: Props) {
  const [mode, setMode] = useState<Mode>("address");

  return (
    <div>
      <label
        htmlFor="trustset-issuer"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Issuer Address
      </label>

      <div className="flex items-center gap-4 mb-2">
        {MODES.map((m) => (
          <label
            key={m.value}
            className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer"
          >
            <input
              type="radio"
              checked={mode === m.value}
              onChange={() => setMode(m.value)}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            {m.label}
          </label>
        ))}
      </div>

      {mode === "address" ? (
        <input
          type="text"
          id="trustset-issuer"
          value={issuer}
          onChange={(e) => onIssuerChange(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors font-mono"
          placeholder="rIssuerXXXX..."
          required
        />
      ) : (
        <>
          <CustodyAccountSelect onAddressChange={onIssuerChange} required />
          {issuer && (
            <p className="mt-1 text-xs text-gray-400 font-mono break-all">
              {issuer}
            </p>
          )}
        </>
      )}
    </div>
  );
}
