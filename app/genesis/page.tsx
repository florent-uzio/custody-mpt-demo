"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import type { RunGenesisBody } from "custody";
import { useSidebarContext } from "../contexts/SidebarContext";
import { runGenesis } from "../_actions/genesis";
import {
  DEFAULT_ROOT_ALIAS,
  DESCENDANTS_PLACEHOLDER,
  KEY_TYPES,
  LEDGERS_PLACEHOLDER,
  READ_ACCESS_KEYS,
  SYSTEM_PROPERTIES_PLACEHOLDER,
  TICKERS_PLACEHOLDER,
  buildDefaultPolicyRow,
  buildDefaultUserRow,
  type GoverningStrategy,
  type KeyType,
  type KeyValueRow,
  type LockStatus,
  type LoginIdRow,
  type PolicyRow,
  type PolicyScope,
  type ReadAccessKey,
  type UserRow,
} from "./defaults";

type RootDomainSetup = RunGenesisBody["rootDomainSetup"];
type GenesisUserSdk = RootDomainSetup["users"][number];
type GenesisPolicySdk = RootDomainSetup["policies"][number];
type ReadAccess = RootDomainSetup["permissions"]["readAccess"];

const newUuid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "";

function parseList(s: string): string[] {
  return s
    .split(/[\s,]+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function rowsToObject(rows: KeyValueRow[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const r of rows) {
    const k = r.k.trim();
    if (k) out[k] = r.v;
  }
  return out;
}

function parseJsonOrThrow<T>(text: string, label: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON in ${label}.`);
  }
}

function parseCustomPropsJson(text: string, label: string): Record<string, string> {
  if (!text.trim()) return {};
  const obj = parseJsonOrThrow<Record<string, string>>(text, label);
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    throw new Error(`${label} must be a JSON object.`);
  }
  return obj;
}

export default function RunGenesisPage() {
  const { sidebarOpen, setSidebarOpen } = useSidebarContext();

  const [rootId, setRootId] = useState<string>(() => newUuid());
  const [rootAlias, setRootAlias] = useState<string>(DEFAULT_ROOT_ALIAS);
  const [rootLock, setRootLock] = useState<LockStatus>("Unlocked");
  const [rootGoverningStrategy, setRootGoverningStrategy] =
    useState<GoverningStrategy>("");
  const [rootDescription, setRootDescription] = useState<string>("");
  const [rootCustomProps, setRootCustomProps] = useState<KeyValueRow[]>([]);

  const [perms, setPerms] = useState<Record<ReadAccessKey, string>>(() =>
    READ_ACCESS_KEYS.reduce(
      (acc, k) => {
        acc[k] = "";
        return acc;
      },
      {} as Record<ReadAccessKey, string>,
    ),
  );

  const [users, setUsers] = useState<UserRow[]>(() => [buildDefaultUserRow()]);
  const [policies, setPolicies] = useState<PolicyRow[]>(() => [
    buildDefaultPolicyRow(),
  ]);

  const [cryptoOverride, setCryptoOverride] = useState(false);
  const [apiSigning, setApiSigning] = useState<KeyType>("Secp256r1");
  const [collectionSigning, setCollectionSigning] =
    useState<KeyType>("Secp256r1");
  const [messageSigning, setMessageSigning] = useState<KeyType>("Secp256r1");

  const [tickersJson, setTickersJson] = useState<string>("");
  const [systemPropertiesJson, setSystemPropertiesJson] = useState<string>("");
  const [ledgersJson, setLedgersJson] = useState<string>("");
  const [descendantsJson, setDescendantsJson] = useState<string>("");

  const [validationError, setValidationError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBody, setPreviewBody] = useState<RunGenesisBody | null>(null);

  const buildBody = (): RunGenesisBody => {
    const readAccess = READ_ACCESS_KEYS.reduce((acc, k) => {
      acc[k] = parseList(perms[k]);
      return acc;
    }, {} as ReadAccess);

    const sdkUsers: GenesisUserSdk[] = users.map((u) => {
      const roles = parseList(u.rolesText);
      const customProperties = parseCustomPropsJson(
        u.customPropsJson,
        `User "${u.alias || u.id}" customProperties`,
      );
      const user: GenesisUserSdk = {
        id: u.id.trim(),
        alias: u.alias.trim(),
        publicKey: u.publicKey.trim(),
        roles,
        lock: u.lock,
        customProperties,
        ...(u.description.trim() && { description: u.description.trim() }),
        ...(u.loginIds.length > 0 && {
          loginIds: u.loginIds.map((l) => ({
            id: l.id.trim(),
            providerId: l.providerId.trim(),
          })),
        }),
      };
      return user;
    });

    const sdkPolicies: GenesisPolicySdk[] = policies.map((p) => {
      const customProperties = parseCustomPropsJson(
        p.customPropsJson,
        `Policy "${p.alias || p.id}" customProperties`,
      );
      const intentTypes = parseList(p.intentTypesText);
      const condition = p.conditionJson.trim()
        ? parseJsonOrThrow<GenesisPolicySdk["condition"]>(
            p.conditionJson,
            `Policy "${p.alias || p.id}" condition`,
          )
        : undefined;
      const workflow = p.workflowJson.trim()
        ? parseJsonOrThrow<GenesisPolicySdk["workflow"]>(
            p.workflowJson,
            `Policy "${p.alias || p.id}" workflow`,
          )
        : undefined;

      const policy: GenesisPolicySdk = {
        id: p.id.trim(),
        alias: p.alias.trim(),
        rank: Number(p.rank),
        scope: p.scope,
        scriptingEngine: p.scriptingEngine,
        lock: p.lock,
        customProperties,
        ...(intentTypes.length > 0 && {
          intentTypes: intentTypes as GenesisPolicySdk["intentTypes"],
        }),
        ...(p.description.trim() && { description: p.description.trim() }),
        ...(condition !== undefined && { condition }),
        ...(workflow !== undefined && { workflow }),
      };
      return policy;
    });

    const rootDomainSetup: RootDomainSetup = {
      id: rootId.trim(),
      alias: rootAlias.trim(),
      lock: rootLock,
      ...(rootGoverningStrategy && {
        governingStrategy: rootGoverningStrategy,
      }),
      permissions: { readAccess },
      ...(rootDescription.trim() && { description: rootDescription.trim() }),
      customProperties: rowsToObject(rootCustomProps),
      users: sdkUsers,
      policies: sdkPolicies,
      ...(descendantsJson.trim() && {
        descendants: parseJsonOrThrow<RootDomainSetup["descendants"]>(
          descendantsJson,
          "Descendants",
        ),
      }),
    };

    const body: RunGenesisBody = { rootDomainSetup };
    if (cryptoOverride) {
      body.cryptoSetup = { apiSigning, collectionSigning, messageSigning };
    }
    if (tickersJson.trim()) {
      body.tickers = parseJsonOrThrow<RunGenesisBody["tickers"]>(
        tickersJson,
        "Tickers",
      );
    }
    if (systemPropertiesJson.trim()) {
      body.systemProperties = parseJsonOrThrow<RunGenesisBody["systemProperties"]>(
        systemPropertiesJson,
        "System Properties",
      );
    }
    if (ledgersJson.trim()) {
      body.ledgers = parseJsonOrThrow<RunGenesisBody["ledgers"]>(
        ledgersJson,
        "Ledgers",
      );
    }
    return body;
  };

  const validate = (): { ok: true; body: RunGenesisBody } | { ok: false; error: string } => {
    if (!rootId.trim()) return { ok: false, error: "Root domain id is required." };
    if (!rootAlias.trim())
      return { ok: false, error: "Root domain alias is required." };
    if (users.length === 0)
      return { ok: false, error: "At least one user is required." };
    for (const u of users) {
      if (!u.id.trim())
        return { ok: false, error: `User id is required (alias "${u.alias}").` };
      if (!u.alias.trim())
        return { ok: false, error: `User alias is required (id ${u.id}).` };
      if (!u.publicKey.trim())
        return {
          ok: false,
          error: `User publicKey is required for "${u.alias || u.id}".`,
        };
      if (parseList(u.rolesText).length === 0)
        return {
          ok: false,
          error: `User "${u.alias || u.id}" needs at least one role.`,
        };
      for (const l of u.loginIds) {
        if (!l.id.trim() || !l.providerId.trim())
          return {
            ok: false,
            error: `User "${u.alias || u.id}" has an incomplete loginId.`,
          };
      }
    }
    for (const p of policies) {
      if (!p.id.trim())
        return { ok: false, error: `Policy id is required (alias "${p.alias}").` };
      if (!p.alias.trim())
        return { ok: false, error: `Policy alias is required (id ${p.id}).` };
      const rankNum = Number(p.rank);
      if (!Number.isInteger(rankNum))
        return {
          ok: false,
          error: `Policy "${p.alias || p.id}" rank must be an integer.`,
        };
    }
    try {
      const body = buildBody();
      return { ok: true, body };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "Invalid form input.",
      };
    }
  };

  const mutation = useMutation({
    mutationFn: (body: RunGenesisBody) => runGenesis(body),
  });

  const handlePreview = () => {
    setValidationError(null);
    const result = validate();
    if (!result.ok) {
      setValidationError(result.error);
      return;
    }
    setPreviewBody(result.body);
    setPreviewOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    const result = validate();
    if (!result.ok) {
      setValidationError(result.error);
      return;
    }
    setPreviewBody(result.body);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!previewBody) return;
    setConfirmOpen(false);
    mutation.mutate(previewBody);
  };

  const handleReset = () => {
    setRootId(newUuid());
    setRootAlias(DEFAULT_ROOT_ALIAS);
    setRootLock("Unlocked");
    setRootGoverningStrategy("");
    setRootDescription("");
    setRootCustomProps([]);
    setPerms(
      READ_ACCESS_KEYS.reduce(
        (acc, k) => {
          acc[k] = "";
          return acc;
        },
        {} as Record<ReadAccessKey, string>,
      ),
    );
    setUsers([buildDefaultUserRow()]);
    setPolicies([buildDefaultPolicyRow()]);
    setCryptoOverride(false);
    setApiSigning("Secp256r1");
    setCollectionSigning("Secp256r1");
    setMessageSigning("Secp256r1");
    setTickersJson("");
    setSystemPropertiesJson("");
    setLedgersJson("");
    setDescendantsJson("");
    setValidationError(null);
    mutation.reset();
  };

  const errorMessage = useMemo(() => {
    if (validationError) return validationError;
    if (mutation.isError) {
      return mutation.error instanceof Error
        ? mutation.error.message
        : "Genesis failed.";
    }
    return null;
  }, [validationError, mutation.isError, mutation.error]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-start gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mt-0.5 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {sidebarOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href="/"
                  className="text-white/60 hover:text-white text-xs font-medium transition-colors"
                >
                  Home
                </Link>
                <span className="text-white/40 text-xs">/</span>
                <span className="text-white/80 text-xs font-medium">Setup</span>
                <span className="text-white/40 text-xs">/</span>
                <span className="text-white/80 text-xs font-medium">
                  Run Genesis
                </span>
              </div>
              <h1 className="text-white text-lg font-semibold">Run Genesis</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mb-6">
            <svg
              className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-amber-800">
              Genesis bootstraps the entire system and is{" "}
              <strong>irreversible</strong>. Run it only against a fresh tenant.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5"
          >
            <Section title="Root Domain Setup" defaultOpen>
              <UuidField
                label="Root domain id"
                required
                value={rootId}
                onChange={setRootId}
              />
              <Field label="Alias" required>
                <input
                  type="text"
                  value={rootAlias}
                  onChange={(e) => setRootAlias(e.target.value)}
                  className={inputCls}
                  required
                />
              </Field>
              <Field label="Lock">
                <select
                  value={rootLock}
                  onChange={(e) => setRootLock(e.target.value as LockStatus)}
                  className={inputCls}
                >
                  <option value="Unlocked">Unlocked</option>
                  <option value="Locked">Locked</option>
                </select>
              </Field>
              <Field label="Governing strategy">
                <select
                  value={rootGoverningStrategy}
                  onChange={(e) =>
                    setRootGoverningStrategy(e.target.value as GoverningStrategy)
                  }
                  className={inputCls}
                >
                  <option value="">(omit)</option>
                  <option value="ConsiderDescendants">ConsiderDescendants</option>
                  <option value="CoerceDescendants">CoerceDescendants</option>
                </select>
              </Field>
              <Field label="Description">
                <textarea
                  value={rootDescription}
                  onChange={(e) => setRootDescription(e.target.value)}
                  className={inputCls}
                  rows={2}
                />
              </Field>
            </Section>

            <Section title="Permissions (read access)">
              <p className="text-xs text-gray-500 mb-2">
                Each field is a list of UUIDs. Separate by comma, space, or newline.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {READ_ACCESS_KEYS.map((k) => (
                  <Field key={k} label={k}>
                    <textarea
                      value={perms[k]}
                      onChange={(e) =>
                        setPerms({ ...perms, [k]: e.target.value })
                      }
                      className={`${inputCls} font-mono text-xs`}
                      rows={2}
                      placeholder="(empty)"
                    />
                  </Field>
                ))}
              </div>
            </Section>

            <Section title="Custom properties">
              <KeyValueEditor
                rows={rootCustomProps}
                onChange={setRootCustomProps}
              />
            </Section>

            <Section title={`Users (${users.length})`} defaultOpen>
              <div className="space-y-4">
                {users.map((u, i) => (
                  <UserRowEditor
                    key={i}
                    row={u}
                    onChange={(next) =>
                      setUsers(users.map((x, j) => (j === i ? next : x)))
                    }
                    onRemove={() =>
                      setUsers(users.filter((_, j) => j !== i))
                    }
                    onDuplicate={() =>
                      setUsers([
                        ...users.slice(0, i + 1),
                        { ...u, id: newUuid() },
                        ...users.slice(i + 1),
                      ])
                    }
                  />
                ))}
                <button
                  type="button"
                  onClick={() => setUsers([...users, buildDefaultUserRow()])}
                  className={addBtnCls}
                >
                  + Add user
                </button>
              </div>
            </Section>

            <Section title={`Policies (${policies.length})`} defaultOpen>
              <div className="space-y-4">
                {policies.map((p, i) => (
                  <PolicyRowEditor
                    key={i}
                    row={p}
                    onChange={(next) =>
                      setPolicies(policies.map((x, j) => (j === i ? next : x)))
                    }
                    onRemove={() =>
                      setPolicies(policies.filter((_, j) => j !== i))
                    }
                  />
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setPolicies([...policies, buildDefaultPolicyRow()])
                  }
                  className={addBtnCls}
                >
                  + Add policy
                </button>
              </div>
            </Section>

            <Section title="Crypto setup (optional)">
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={cryptoOverride}
                  onChange={(e) => setCryptoOverride(e.target.checked)}
                />
                <span className="text-sm text-gray-700">
                  Override default cryptoSetup
                </span>
              </label>
              {cryptoOverride && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="apiSigning">
                    <select
                      value={apiSigning}
                      onChange={(e) =>
                        setApiSigning(e.target.value as KeyType)
                      }
                      className={inputCls}
                    >
                      {KEY_TYPES.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="collectionSigning">
                    <select
                      value={collectionSigning}
                      onChange={(e) =>
                        setCollectionSigning(e.target.value as KeyType)
                      }
                      className={inputCls}
                    >
                      {KEY_TYPES.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="messageSigning">
                    <select
                      value={messageSigning}
                      onChange={(e) =>
                        setMessageSigning(e.target.value as KeyType)
                      }
                      className={inputCls}
                    >
                      {KEY_TYPES.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              )}
            </Section>

            <Section title="Tickers (optional, JSON)">
              <JsonField
                value={tickersJson}
                onChange={setTickersJson}
                placeholder={TICKERS_PLACEHOLDER}
              />
            </Section>

            <Section title="System properties (optional, JSON)">
              <JsonField
                value={systemPropertiesJson}
                onChange={setSystemPropertiesJson}
                placeholder={SYSTEM_PROPERTIES_PLACEHOLDER}
              />
            </Section>

            <Section title="Ledgers (optional, JSON)">
              <JsonField
                value={ledgersJson}
                onChange={setLedgersJson}
                placeholder={LEDGERS_PLACEHOLDER}
              />
            </Section>

            <Section title="Descendants (optional, JSON)">
              <JsonField
                value={descendantsJson}
                onChange={setDescendantsJson}
                placeholder={DESCENDANTS_PLACEHOLDER}
              />
            </Section>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {mutation.isSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                Genesis completed.
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Reset to defaults
              </button>
              <button
                type="button"
                onClick={handlePreview}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                Preview body
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {mutation.isPending ? "Running…" : "Run Genesis"}
              </button>
            </div>
          </form>
        </main>
      </div>

      {previewOpen && previewBody && (
        <Modal title="Genesis body preview" onClose={() => setPreviewOpen(false)}>
          <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap break-words">
            {JSON.stringify(previewBody, null, 2)}
          </pre>
        </Modal>
      )}

      {confirmOpen && (
        <Modal title="Confirm Genesis" onClose={() => setConfirmOpen(false)}>
          <p className="text-sm text-gray-700 mb-4">
            Genesis is irreversible. This will bootstrap the root domain on the
            connected tenant. Continue?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setConfirmOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg"
            >
              Run Genesis
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors";

const addBtnCls =
  "px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium rounded-lg transition-colors";

function Section({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="border border-gray-200 rounded-lg overflow-hidden"
    >
      <summary className="cursor-pointer px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-gray-800 select-none">
        {title}
      </summary>
      <div className="p-4 space-y-3">{children}</div>
    </details>
  );
}

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

function UuidField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <Field label={label} required={required}>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} font-mono`}
        />
        <button
          type="button"
          onClick={() => onChange(newUuid())}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg flex-shrink-0"
        >
          Regenerate
        </button>
      </div>
    </Field>
  );
}

function KeyValueEditor({
  rows,
  onChange,
}: {
  rows: KeyValueRow[];
  onChange: (rows: KeyValueRow[]) => void;
}) {
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={r.k}
            onChange={(e) =>
              onChange(rows.map((x, j) => (j === i ? { ...x, k: e.target.value } : x)))
            }
            className={`${inputCls} font-mono`}
            placeholder="key"
          />
          <input
            type="text"
            value={r.v}
            onChange={(e) =>
              onChange(rows.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))
            }
            className={`${inputCls} font-mono`}
            placeholder="value"
          />
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, j) => j !== i))}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg flex-shrink-0"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, { k: "", v: "" }])}
        className={addBtnCls}
      >
        + Add property
      </button>
    </div>
  );
}

function JsonField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} font-mono text-xs`}
      rows={6}
      placeholder={placeholder}
    />
  );
}

function UserRowEditor({
  row,
  onChange,
  onRemove,
  onDuplicate,
}: {
  row: UserRow;
  onChange: (r: UserRow) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50/50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          User
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDuplicate}
            className="text-xs px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="text-xs px-2 py-1 bg-white border border-red-200 text-red-600 rounded hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      </div>
      <UuidField
        label="id"
        value={row.id}
        onChange={(v) => onChange({ ...row, id: v })}
      />
      <Field label="alias" required>
        <input
          type="text"
          value={row.alias}
          onChange={(e) => onChange({ ...row, alias: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label="publicKey (base64)" required>
        <textarea
          value={row.publicKey}
          onChange={(e) => onChange({ ...row, publicKey: e.target.value })}
          className={`${inputCls} font-mono text-xs`}
          rows={2}
        />
      </Field>
      <Field label="roles (comma or newline separated)" required>
        <input
          type="text"
          value={row.rolesText}
          onChange={(e) => onChange({ ...row, rolesText: e.target.value })}
          className={inputCls}
          placeholder="Admin, Operator"
        />
      </Field>
      <Field label="lock">
        <select
          value={row.lock}
          onChange={(e) =>
            onChange({ ...row, lock: e.target.value as LockStatus })
          }
          className={inputCls}
        >
          <option value="Unlocked">Unlocked</option>
          <option value="Locked">Locked</option>
        </select>
      </Field>
      <Field label="description">
        <input
          type="text"
          value={row.description}
          onChange={(e) => onChange({ ...row, description: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label="loginIds">
        <LoginIdsEditor
          rows={row.loginIds}
          onChange={(loginIds) => onChange({ ...row, loginIds })}
        />
      </Field>
      <Field label="customProperties (JSON object, optional)">
        <textarea
          value={row.customPropsJson}
          onChange={(e) => onChange({ ...row, customPropsJson: e.target.value })}
          className={`${inputCls} font-mono text-xs`}
          rows={2}
          placeholder='{"key":"value"}'
        />
      </Field>
    </div>
  );
}

function LoginIdsEditor({
  rows,
  onChange,
}: {
  rows: LoginIdRow[];
  onChange: (rows: LoginIdRow[]) => void;
}) {
  return (
    <div className="space-y-2">
      {rows.map((r, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={r.id}
            onChange={(e) =>
              onChange(
                rows.map((x, j) => (j === i ? { ...x, id: e.target.value } : x)),
              )
            }
            className={`${inputCls} font-mono`}
            placeholder="login id"
          />
          <input
            type="text"
            value={r.providerId}
            onChange={(e) =>
              onChange(
                rows.map((x, j) =>
                  j === i ? { ...x, providerId: e.target.value } : x,
                ),
              )
            }
            className={`${inputCls} font-mono`}
            placeholder="providerId (e.g. harmonize)"
          />
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, j) => j !== i))}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg flex-shrink-0"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, { id: "", providerId: "" }])}
        className={addBtnCls}
      >
        + Add loginId
      </button>
    </div>
  );
}

function PolicyRowEditor({
  row,
  onChange,
  onRemove,
}: {
  row: PolicyRow;
  onChange: (r: PolicyRow) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50/50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Policy
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs px-2 py-1 bg-white border border-red-200 text-red-600 rounded hover:bg-red-50"
        >
          Remove
        </button>
      </div>
      <UuidField
        label="id"
        value={row.id}
        onChange={(v) => onChange({ ...row, id: v })}
      />
      <Field label="alias" required>
        <input
          type="text"
          value={row.alias}
          onChange={(e) => onChange({ ...row, alias: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label="rank" required>
        <input
          type="number"
          value={row.rank}
          onChange={(e) => onChange({ ...row, rank: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label="scope">
        <select
          value={row.scope}
          onChange={(e) =>
            onChange({ ...row, scope: e.target.value as PolicyScope })
          }
          className={inputCls}
        >
          <option value="Self">Self</option>
          <option value="Descendants">Descendants</option>
          <option value="SelfAndDescendants">SelfAndDescendants</option>
        </select>
      </Field>
      <Field label="scriptingEngine">
        <select
          value={row.scriptingEngine}
          onChange={(e) =>
            onChange({
              ...row,
              scriptingEngine: e.target.value as "Javascript_v0",
            })
          }
          className={inputCls}
        >
          <option value="Javascript_v0">Javascript_v0</option>
        </select>
      </Field>
      <Field label="lock">
        <select
          value={row.lock}
          onChange={(e) =>
            onChange({ ...row, lock: e.target.value as LockStatus })
          }
          className={inputCls}
        >
          <option value="Unlocked">Unlocked</option>
          <option value="Locked">Locked</option>
        </select>
      </Field>
      <Field label="description">
        <input
          type="text"
          value={row.description}
          onChange={(e) => onChange({ ...row, description: e.target.value })}
          className={inputCls}
        />
      </Field>
      <Field label="intentTypes (comma or newline separated)">
        <input
          type="text"
          value={row.intentTypesText}
          onChange={(e) => onChange({ ...row, intentTypesText: e.target.value })}
          className={inputCls}
          placeholder="v0_CreateUser, v0_UpdateUser"
        />
      </Field>
      <Field label="condition (JSON, optional)">
        <textarea
          value={row.conditionJson}
          onChange={(e) => onChange({ ...row, conditionJson: e.target.value })}
          className={`${inputCls} font-mono text-xs`}
          rows={3}
          placeholder='{"type":"Expression","expression":"true"}'
        />
      </Field>
      <Field label="workflow (JSON array, optional)">
        <textarea
          value={row.workflowJson}
          onChange={(e) => onChange({ ...row, workflowJson: e.target.value })}
          className={`${inputCls} font-mono text-xs`}
          rows={3}
          placeholder="[]"
        />
      </Field>
      <Field label="customProperties (JSON object, optional)">
        <textarea
          value={row.customPropsJson}
          onChange={(e) => onChange({ ...row, customPropsJson: e.target.value })}
          className={`${inputCls} font-mono text-xs`}
          rows={2}
          placeholder='{"key":"value"}'
        />
      </Field>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
