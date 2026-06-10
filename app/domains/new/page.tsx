"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useDefaultDomain } from "../../contexts/DomainContext";
import { useSidebarContext } from "../../contexts/SidebarContext";
import {
  proposeCreateDomain,
  type ProposeCreateDomainInput,
} from "../../_actions/domains";
import {
  READ_ACCESS_KEYS,
  buildDefaultUserRow,
  type GoverningStrategy,
  type LockStatus,
  type LoginIdRow,
  type ReadAccessKey,
  type UserRow,
} from "../../genesis/defaults";

type GenesisUser = NonNullable<ProposeCreateDomainInput["users"]>[number];

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

function parseCustomPropsJson(
  text: string,
  label: string,
): Record<string, string> {
  if (!text.trim()) return {};
  let obj: unknown;
  try {
    obj = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON in ${label}.`);
  }
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    throw new Error(`${label} must be a JSON object.`);
  }
  return obj as Record<string, string>;
}

export default function NewDomainPage() {
  const router = useRouter();
  const { defaultDomainId } = useDefaultDomain();
  const { sidebarOpen, setSidebarOpen } = useSidebarContext();

  const [alias, setAlias] = useState("");
  const [description, setDescription] = useState("");
  const [lock, setLock] = useState<LockStatus>("Unlocked");
  const [governingStrategy, setGoverningStrategy] =
    useState<GoverningStrategy>("");
  const [perms, setPerms] = useState<Record<ReadAccessKey, string>>(() =>
    READ_ACCESS_KEYS.reduce(
      (acc, k) => {
        acc[k] = "";
        return acc;
      },
      {} as Record<ReadAccessKey, string>,
    ),
  );
  const [users, setUsers] = useState<UserRow[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const buildInput = (): ProposeCreateDomainInput => {
    const readAccess = READ_ACCESS_KEYS.reduce(
      (acc, k) => {
        acc[k] = parseList(perms[k]);
        return acc;
      },
      {} as Record<ReadAccessKey, string[]>,
    );

    const sdkUsers: GenesisUser[] = users.map((u): GenesisUser => {
      const customProperties = parseCustomPropsJson(
        u.customPropsJson,
        `User "${u.alias || u.id}" customProperties`,
      );
      return {
        id: u.id.trim(),
        alias: u.alias.trim(),
        publicKey: u.publicKey.trim(),
        roles: parseList(u.rolesText),
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
    });

    return {
      domainId: defaultDomainId!,
      alias,
      description: description || undefined,
      lock,
      ...(governingStrategy && { governingStrategy }),
      permissions: { readAccess },
      users: sdkUsers,
    };
  };

  const mutation = useMutation({
    mutationFn: (input: ProposeCreateDomainInput) => proposeCreateDomain(input),
    onSuccess: ({ requestId }) => {
      router.push(`/intents/${requestId}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!alias.trim()) {
      setValidationError("Alias is required.");
      return;
    }
    for (const u of users) {
      if (!u.alias.trim())
        return setValidationError(`User alias is required (id ${u.id}).`);
      if (!u.publicKey.trim())
        return setValidationError(
          `User publicKey is required for "${u.alias || u.id}".`,
        );
      if (parseList(u.rolesText).length === 0)
        return setValidationError(
          `User "${u.alias || u.id}" needs at least one role.`,
        );
      for (const l of u.loginIds) {
        if (!l.id.trim() || !l.providerId.trim())
          return setValidationError(
            `User "${u.alias || u.id}" has an incomplete loginId.`,
          );
      }
    }

    let input: ProposeCreateDomainInput;
    try {
      input = buildInput();
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : "Invalid form input.",
      );
      return;
    }
    mutation.mutate(input);
  };

  const submitDisabled = !defaultDomainId || mutation.isPending;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
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
                  href="/domains"
                  className="text-white/60 hover:text-white text-xs font-medium transition-colors"
                >
                  Domains
                </Link>
                <span className="text-white/40 text-xs">/</span>
                <span className="text-white/80 text-xs font-medium">
                  Create domain
                </span>
              </div>
              <h1 className="text-white text-lg font-semibold">
                Propose create domain
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!defaultDomainId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3 mb-6">
              <svg
                className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-yellow-700">
                Set a <strong>Default Domain ID</strong> in the sidebar before
                creating a domain.
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5"
          >
            <Field label="Alias" required>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className={inputCls}
                placeholder="my-subdomain"
                required
              />
            </Field>

            <Field label="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`${inputCls} resize-none`}
                placeholder="Optional description"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Lock status">
                <select
                  value={lock}
                  onChange={(e) => setLock(e.target.value as LockStatus)}
                  className={`${inputCls} bg-white`}
                >
                  <option value="Unlocked">Unlocked</option>
                  <option value="Locked">Locked</option>
                </select>
              </Field>

              <Field label="Governing strategy">
                <select
                  value={governingStrategy}
                  onChange={(e) =>
                    setGoverningStrategy(e.target.value as GoverningStrategy)
                  }
                  className={`${inputCls} bg-white`}
                >
                  <option value="">(omit)</option>
                  <option value="ConsiderDescendants">
                    ConsiderDescendants
                  </option>
                  <option value="CoerceDescendants">CoerceDescendants</option>
                </select>
              </Field>
            </div>

            <Section title="Permissions (read access)">
              <p className="text-xs text-gray-500 mb-2">
                Each field is a list of UUIDs. Separate by comma, space, or
                newline.
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

            <Section title={`Users (${users.length})`}>
              <div className="space-y-4">
                {users.map((u, i) => (
                  <UserRowEditor
                    key={i}
                    row={u}
                    onChange={(next) =>
                      setUsers(users.map((x, j) => (j === i ? next : x)))
                    }
                    onRemove={() => setUsers(users.filter((_, j) => j !== i))}
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

            {validationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {validationError}
              </div>
            )}

            {mutation.isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : "Failed to propose create domain intent"}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <Link
                href="/domains"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitDisabled}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {mutation.isPending ? "Proposing…" : "Propose intent"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors";

const addBtnCls =
  "px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium rounded-lg transition-colors";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details className="border border-gray-200 rounded-lg overflow-hidden">
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
          className={`${inputCls} bg-white`}
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
          onChange={(e) =>
            onChange({ ...row, customPropsJson: e.target.value })
          }
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
                rows.map((x, j) =>
                  j === i ? { ...x, id: e.target.value } : x,
                ),
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
