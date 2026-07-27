"use client";

import { useAccounts } from "../../hooks/useAccounts";
import { useEndpoints } from "../../hooks/useEndpoints";
import type {
  CmptDestination,
  CmptTokenIdentifier,
} from "../../_actions/confidential-mpt";

/** Shared field styling for the Confidential MPT pages. */
export const CMPT_INPUT =
  "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors";

export function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      {children}
      {help && <p className="mt-2 text-xs text-gray-500">{help}</p>}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  help,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  help?: React.ReactNode;
  required?: boolean;
  type?: "text" | "number";
}) {
  return (
    <Field label={label} help={help}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`${CMPT_INPUT} ${type === "text" ? "font-mono text-sm" : ""}`}
      />
    </Field>
  );
}

/** Custody-account picker. Emits the account UUID. */
export function AccountField({
  label = "Account",
  value,
  onChange,
  help,
}: {
  label?: string;
  value: string;
  onChange: (accountId: string) => void;
  help?: React.ReactNode;
}) {
  const { accounts, loading } = useAccounts();
  return (
    <Field label={label} help={help}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        disabled={loading}
        className={`${CMPT_INPUT} bg-white`}
      >
        {loading ? (
          <option>Loading accounts…</option>
        ) : (
          <>
            <option value="" disabled>
              Select an account
            </option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.alias} ({account.id})
              </option>
            ))}
          </>
        )}
      </select>
    </Field>
  );
}

/**
 * `Core_Xrpl_MPTokenIdentifier` — an MPT is addressed either by its on-ledger
 * issuance ID or by a custody ticker ID.
 */
export function TokenIdentifierField({
  value,
  onChange,
}: {
  value: CmptTokenIdentifier;
  onChange: (next: CmptTokenIdentifier) => void;
}) {
  const isIssuance = value.type === "MPTokenIssuanceId";
  return (
    <Field
      label="Token identifier"
      help="The confidential MPT being operated on."
    >
      <div className="flex items-center gap-4 mb-2">
        <label className="flex items-center gap-1.5 text-sm text-gray-700">
          <input
            type="radio"
            checked={isIssuance}
            onChange={() => onChange({ type: "MPTokenIssuanceId", issuanceId: "" })}
          />
          MPT Issuance ID
        </label>
        <label className="flex items-center gap-1.5 text-sm text-gray-700">
          <input
            type="radio"
            checked={!isIssuance}
            onChange={() => onChange({ type: "TickerId", tickerId: "" })}
          />
          Ticker ID
        </label>
      </div>
      {isIssuance ? (
        <input
          value={value.issuanceId}
          onChange={(e) =>
            onChange({ type: "MPTokenIssuanceId", issuanceId: e.target.value })
          }
          placeholder="00CA8BD9F2582AF39B51725D510C5401ED4495ECFB250591"
          required
          className={`${CMPT_INPUT} font-mono text-sm`}
        />
      ) : (
        <input
          value={value.tickerId}
          onChange={(e) => onChange({ type: "TickerId", tickerId: e.target.value })}
          placeholder="Ticker UUID"
          required
          className={`${CMPT_INPUT} font-mono text-sm`}
        />
      )}
    </Field>
  );
}

/** `Core_TransactionDestination` — a raw XRPL address, a custody account, or an endpoint. */
export function DestinationField({
  value,
  onChange,
}: {
  value: CmptDestination;
  onChange: (next: CmptDestination) => void;
}) {
  const { accounts, loading: accountsLoading } = useAccounts();
  const { endpoints, loading: endpointsLoading } = useEndpoints();

  return (
    <Field label="Destination">
      <div className="flex items-center gap-4 mb-2">
        {(["Address", "Account", "Endpoint"] as const).map((type) => (
          <label key={type} className="flex items-center gap-1.5 text-sm text-gray-700">
            <input
              type="radio"
              checked={value.type === type}
              onChange={() =>
                onChange(
                  type === "Address"
                    ? { type: "Address", address: "" }
                    : type === "Account"
                      ? { type: "Account", accountId: "" }
                      : { type: "Endpoint", endpointId: "" },
                )
              }
            />
            {type}
          </label>
        ))}
      </div>

      {value.type === "Address" && (
        <input
          value={value.address}
          onChange={(e) => onChange({ type: "Address", address: e.target.value })}
          placeholder="Destination address (r…)"
          required
          className={`${CMPT_INPUT} font-mono text-sm`}
        />
      )}

      {value.type === "Account" && (
        <select
          value={value.accountId}
          onChange={(e) => onChange({ type: "Account", accountId: e.target.value })}
          required
          disabled={accountsLoading}
          className={`${CMPT_INPUT} bg-white`}
        >
          <option value="" disabled>
            {accountsLoading ? "Loading accounts…" : "Select a destination account"}
          </option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.alias} ({account.id})
            </option>
          ))}
        </select>
      )}

      {value.type === "Endpoint" && (
        <select
          value={value.endpointId}
          onChange={(e) => onChange({ type: "Endpoint", endpointId: e.target.value })}
          required
          disabled={endpointsLoading}
          className={`${CMPT_INPUT} bg-white`}
        >
          <option value="" disabled>
            {endpointsLoading ? "Loading endpoints…" : "Select an endpoint"}
          </option>
          {endpoints.map((endpoint) => (
            <option key={endpoint.id} value={endpoint.id}>
              {endpoint.alias} ({endpoint.address})
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}
