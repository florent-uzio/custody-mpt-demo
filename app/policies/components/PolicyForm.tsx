"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type {
  Core_Policy,
  Core_PolicyCondition,
  Core_PolicyScope,
} from "@florent-uzio/custody";
import {
  CONTEXT_HELP,
  EXAMPLE_POLICIES,
  EXPRESSION_SNIPPETS,
  INTENT_TYPE_GROUPS,
  INTENT_TYPE_PRESETS,
  WORKFLOW_TEMPLATES,
} from "./policyFormData";

// Derived from the SDK (these aren't exported from the package root).
export type PolicyIntentType = NonNullable<Core_Policy["intentTypes"]>[number];
export type WorkflowCondition = NonNullable<Core_Policy["workflow"]>[number];
export type IntentLockStatus = "Unlocked" | "Locked";

export interface PolicyFormResult {
  alias: string;
  rank: number;
  scope: Core_PolicyScope;
  intentTypes?: PolicyIntentType[];
  condition?: Core_PolicyCondition;
  workflow?: WorkflowCondition[];
  lock: IntentLockStatus;
  description?: string;
  customProperties: Record<string, string>;
}

export interface PolicyFormInitial {
  alias?: string;
  rank?: number;
  scope?: Core_PolicyScope;
  intentTypes?: string[];
  condition?: Core_PolicyCondition | null;
  workflow?: WorkflowCondition[] | null;
  lock?: IntentLockStatus;
  description?: string;
  customProperties?: Record<string, string>;
}

interface PolicyFormProps {
  mode: "create" | "update";
  initial?: PolicyFormInitial;
  submitting: boolean;
  submitError?: string | null;
  disabled?: boolean;
  cancelHref: string;
  onSubmit: (result: PolicyFormResult) => void;
}

type ConditionMode = "expression" | "json" | "none";

const SCOPES: Core_PolicyScope[] = ["Self", "Descendants", "SelfAndDescendants"];

const inputCls =
  "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors";
const monoCls = "font-mono text-xs leading-relaxed";

function pretty(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

function parseCustomPropsJson(text: string): Record<string, string> {
  if (!text.trim()) return {};
  let obj: unknown;
  try {
    obj = JSON.parse(text);
  } catch {
    throw new Error("Custom properties must be valid JSON.");
  }
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    throw new Error("Custom properties must be a JSON object.");
  }
  return obj as Record<string, string>;
}

function isSingleExpression(
  c: Core_PolicyCondition | null | undefined,
): c is Extract<Core_PolicyCondition, { type: "Expression" }> {
  return !!c && c.type === "Expression";
}

function describeWorkflowNode(node: unknown): string {
  if (!node || typeof node !== "object") return "?";
  const n = node as Record<string, unknown>;
  if (n.type === "RoleQuorum") return `${n.role} ×${n.quorum}`;
  if (n.type === "And")
    return `(${describeWorkflowNode(n.left)} AND ${describeWorkflowNode(n.right)})`;
  if (n.type === "Or")
    return `(${describeWorkflowNode(n.left)} OR ${describeWorkflowNode(n.right)})`;
  return "unknown";
}

export function PolicyForm({
  mode,
  initial,
  submitting,
  submitError,
  disabled,
  cancelHref,
  onSubmit,
}: PolicyFormProps) {
  const [alias, setAlias] = useState(initial?.alias ?? "");
  const [rank, setRank] = useState(
    initial?.rank !== undefined ? String(initial.rank) : "100",
  );
  const [scope, setScope] = useState<Core_PolicyScope>(
    initial?.scope ?? "Self",
  );
  const [lock, setLock] = useState<IntentLockStatus>(initial?.lock ?? "Unlocked");
  const [intentTypes, setIntentTypes] = useState<string[]>(
    initial?.intentTypes ?? [],
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [customPropsJson, setCustomPropsJson] = useState(
    initial?.customProperties && Object.keys(initial.customProperties).length
      ? pretty(initial.customProperties)
      : "",
  );

  const initialMode: ConditionMode = isSingleExpression(initial?.condition)
    ? "expression"
    : initial?.condition
      ? "json"
      : "none";
  const [conditionMode, setConditionMode] =
    useState<ConditionMode>(initialMode);
  const [conditionExpression, setConditionExpression] = useState(
    isSingleExpression(initial?.condition) ? initial!.condition!.expression : "",
  );
  const [conditionJson, setConditionJson] = useState(
    initial?.condition && !isSingleExpression(initial?.condition)
      ? pretty(initial.condition)
      : "",
  );

  const [workflowJson, setWorkflowJson] = useState(
    initial?.workflow && initial.workflow.length ? pretty(initial.workflow) : "",
  );

  const [error, setError] = useState<string | null>(null);

  // Live preview / validation of the workflow JSON.
  const workflowParse = useMemo(() => {
    const text = workflowJson.trim();
    if (!text) return { steps: null as unknown[] | null, error: null };
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed))
        return { steps: null, error: "Workflow must be a JSON array of steps." };
      return { steps: parsed as unknown[], error: null };
    } catch {
      return { steps: null, error: "Invalid JSON." };
    }
  }, [workflowJson]);

  const toggleIntentType = (t: string) =>
    setIntentTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    );

  const applyExample = (label: string) => {
    const ex = EXAMPLE_POLICIES.find((e) => e.label === label);
    if (!ex) return;
    setAlias(ex.alias);
    setRank(String(ex.rank));
    setIntentTypes(ex.intentTypes);
    setConditionMode("expression");
    setConditionExpression(ex.expression);
    setConditionJson("");
    setWorkflowJson(pretty(ex.workflow));
    setError(null);
  };

  const insertExpression = (expr: string) => {
    setConditionMode("expression");
    setConditionExpression((prev) => (prev.trim() ? `${prev}\n${expr}` : expr));
  };

  const buildResult = (): PolicyFormResult => {
    if (!alias.trim()) throw new Error("Alias is required.");
    const rankNum = Number(rank);
    if (!Number.isInteger(rankNum))
      throw new Error("Rank must be a whole number.");

    let condition: Core_PolicyCondition | undefined;
    if (conditionMode === "expression" && conditionExpression.trim()) {
      condition = {
        type: "Expression",
        expression: conditionExpression.trim(),
      };
    } else if (conditionMode === "json" && conditionJson.trim()) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(conditionJson);
      } catch {
        throw new Error("Condition JSON is not valid JSON.");
      }
      if (
        !parsed ||
        typeof parsed !== "object" ||
        !("type" in (parsed as object))
      )
        throw new Error(
          "Condition JSON must be an object with a `type` (Expression / And / Or).",
        );
      condition = parsed as Core_PolicyCondition;
    }

    let workflow: WorkflowCondition[] | undefined;
    if (workflowJson.trim()) {
      if (workflowParse.error) throw new Error(`Workflow: ${workflowParse.error}`);
      workflow = (workflowParse.steps ?? undefined) as
        | WorkflowCondition[]
        | undefined;
    }

    const customProperties = parseCustomPropsJson(customPropsJson);

    return {
      alias: alias.trim(),
      rank: rankNum,
      scope,
      intentTypes: intentTypes.length
        ? (intentTypes as PolicyIntentType[])
        : undefined,
      condition,
      workflow,
      lock,
      description: description.trim() || undefined,
      customProperties,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    let result: PolicyFormResult;
    try {
      result = buildResult();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid form input.");
      return;
    }
    onSubmit(result);
  };

  const submitDisabled = disabled || submitting;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5"
    >
      {mode === "create" && (
        <Field label="Start from an example (optional)">
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) applyExample(e.target.value);
              e.target.value = "";
            }}
            className={`${inputCls} bg-white`}
          >
            <option value="">Select an example policy to prefill…</option>
            {EXAMPLE_POLICIES.map((e) => (
              <option key={e.label} value={e.label}>
                {e.label}
              </option>
            ))}
          </select>
        </Field>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Alias" required>
          <input
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            className={inputCls}
            placeholder="transfer-out-unknown-address"
            required
          />
        </Field>
        <Field label="Rank" required>
          <input
            type="number"
            value={rank}
            onChange={(e) => setRank(e.target.value)}
            className={inputCls}
            placeholder="100"
            required
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Scope">
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as Core_PolicyScope)}
            className={`${inputCls} bg-white`}
          >
            {SCOPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        {mode === "create" ? (
          <Field label="Lock status">
            <select
              value={lock}
              onChange={(e) => setLock(e.target.value as IntentLockStatus)}
              className={`${inputCls} bg-white`}
            >
              <option value="Unlocked">Unlocked</option>
              <option value="Locked">Locked</option>
            </select>
          </Field>
        ) : (
          <Field label="Scripting engine">
            <input
              type="text"
              value="JavaScript (Javascript_v0)"
              disabled
              className={`${inputCls} bg-gray-50 text-gray-500`}
            />
          </Field>
        )}
      </div>

      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={`${inputCls} resize-none`}
          placeholder="Optional human-readable description"
        />
      </Field>

      <IntentTypesPicker
        selected={intentTypes}
        onToggle={toggleIntentType}
        onSetAll={setIntentTypes}
      />

      <ConditionEditor
        mode={conditionMode}
        onModeChange={setConditionMode}
        expression={conditionExpression}
        onExpressionChange={setConditionExpression}
        json={conditionJson}
        onJsonChange={setConditionJson}
        onInsertExpression={insertExpression}
      />

      <WorkflowEditor
        json={workflowJson}
        onChange={setWorkflowJson}
        parse={workflowParse}
      />

      <Section title="Custom properties (JSON object, optional)">
        <textarea
          value={customPropsJson}
          onChange={(e) => setCustomPropsJson(e.target.value)}
          className={`${inputCls} ${monoCls}`}
          rows={3}
          placeholder='{"team":"treasury"}'
        />
      </Section>

      {(error || submitError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error ?? submitError}
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
          disabled={submitDisabled}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
        >
          {submitting
            ? "Proposing…"
            : mode === "create"
              ? "Propose create policy"
              : "Propose update policy"}
        </button>
      </div>
    </form>
  );
}

function IntentTypesPicker({
  selected,
  onToggle,
  onSetAll,
}: {
  selected: string[];
  onToggle: (t: string) => void;
  onSetAll: (t: string[]) => void;
}) {
  const [filter, setFilter] = useState("");
  const groups = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return INTENT_TYPE_GROUPS;
    return INTENT_TYPE_GROUPS.map((g) => ({
      ...g,
      types: g.types.filter((t) => t.toLowerCase().includes(q)),
    })).filter((g) => g.types.length > 0);
  }, [filter]);

  return (
    <Section title={`Intent types (${selected.length || "all"})`}>
      <p className="text-xs text-gray-500 mb-3">
        The intent types this policy applies to. Leave empty to match{" "}
        <strong>all</strong> intents (catch-all).
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {INTENT_TYPE_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onSetAll(p.types)}
            className="text-xs px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium"
          >
            {p.label}
          </button>
        ))}
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onSetAll([])}
            className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {selected.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onToggle(t)}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-mono hover:bg-blue-200"
              title="Remove"
            >
              {t}
              <span className="text-blue-400">×</span>
            </button>
          ))}
        </div>
      )}

      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter intent types…"
        className={`${inputCls} mb-3`}
      />

      <div className="max-h-56 overflow-y-auto border border-gray-100 rounded-lg p-2 space-y-3">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              {g.label}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
              {g.types.map((t) => (
                <label
                  key={t}
                  className="flex items-center gap-2 text-xs font-mono text-gray-700 cursor-pointer hover:text-blue-700"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(t)}
                    onChange={() => onToggle(t)}
                    className="rounded border-gray-300"
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ConditionEditor({
  mode,
  onModeChange,
  expression,
  onExpressionChange,
  json,
  onJsonChange,
  onInsertExpression,
}: {
  mode: ConditionMode;
  onModeChange: (m: ConditionMode) => void;
  expression: string;
  onExpressionChange: (v: string) => void;
  json: string;
  onJsonChange: (v: string) => void;
  onInsertExpression: (expr: string) => void;
}) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <Section title="Condition" defaultOpen>
      <p className="text-xs text-gray-500 mb-3">
        A JavaScript expression evaluated against a <code>context</code> object;
        it must return a boolean. The policy only applies when the condition is
        true.
      </p>

      <div className="flex gap-1 mb-3">
        {(["expression", "json", "none"] as ConditionMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onModeChange(m)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-colors ${
              mode === m
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {m === "json" ? "Advanced JSON" : m}
          </button>
        ))}
      </div>

      {mode === "expression" && (
        <>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {EXPRESSION_SNIPPETS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => onInsertExpression(s.expression)}
                className="text-xs px-2 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded font-medium"
                title={s.expression}
              >
                + {s.label}
              </button>
            ))}
          </div>
          <textarea
            value={expression}
            onChange={(e) => onExpressionChange(e.target.value)}
            rows={5}
            className={`${inputCls} ${monoCls}`}
            placeholder="context.references.users[context.request.author.id].roles.includes('system-operator')"
            spellCheck={false}
          />
        </>
      )}

      {mode === "json" && (
        <textarea
          value={json}
          onChange={(e) => onJsonChange(e.target.value)}
          rows={8}
          className={`${inputCls} ${monoCls}`}
          placeholder={pretty({
            left: { expression: "a == b", type: "Expression" },
            right: { expression: "c == d", type: "Expression" },
            type: "And",
          })}
          spellCheck={false}
        />
      )}

      {mode === "none" && (
        <p className="text-xs text-gray-400 italic">
          No condition — the policy matches purely on intent types.
        </p>
      )}

      <button
        type="button"
        onClick={() => setShowHelp((v) => !v)}
        className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium"
      >
        {showHelp ? "Hide" : "Show"} context reference
      </button>
      {showHelp && (
        <div className="mt-2 bg-gray-50 border border-gray-100 rounded-lg p-3 space-y-1.5">
          {CONTEXT_HELP.map((h) => (
            <div key={h.path} className="text-xs">
              <code className="text-violet-700 font-mono">{h.path}</code>
              <span className="text-gray-500"> — {h.description}</span>
            </div>
          ))}
          <p className="text-[11px] text-gray-400 pt-1">
            Use <code>BigInt(…)</code> for large integer amounts (e.g. wei /
            drops).
          </p>
        </div>
      )}
    </Section>
  );
}

function WorkflowEditor({
  json,
  onChange,
  parse,
}: {
  json: string;
  onChange: (v: string) => void;
  parse: { steps: unknown[] | null; error: string | null };
}) {
  return (
    <Section title="Approval workflow" defaultOpen>
      <p className="text-xs text-gray-500 mb-3">
        An ordered array of approval steps. Each step is a{" "}
        <code>RoleQuorum</code>, or an <code>And</code>/<code>Or</code> of nested
        steps. The first step must allow the intent author&apos;s role to give
        the first approval.
      </p>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {WORKFLOW_TEMPLATES.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={() => onChange(pretty(t.workflow))}
            className="text-xs px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded font-medium"
          >
            {t.label}
          </button>
        ))}
      </div>

      <textarea
        value={json}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        className={`${inputCls} ${monoCls}`}
        placeholder={pretty([
          { role: "system-operator", quorum: 2, type: "RoleQuorum" },
        ])}
        spellCheck={false}
      />

      {parse.error && (
        <p className="mt-2 text-xs text-red-600">⚠ {parse.error}</p>
      )}

      {parse.steps && parse.steps.length > 0 && !parse.error && (
        <div className="mt-3 bg-gray-50 border border-gray-100 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Preview
          </p>
          <ol className="space-y-1">
            {parse.steps.map((step, i) => (
              <li key={i} className="text-xs text-gray-700 flex gap-2">
                <span className="font-semibold text-gray-400">
                  Step {i + 1}
                </span>
                <span className="font-mono">{describeWorkflowNode(step)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Section>
  );
}

function Section({
  title,
  children,
  defaultOpen,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="border border-gray-200 rounded-lg overflow-hidden"
    >
      <summary className="cursor-pointer px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-sm font-semibold text-gray-800 select-none">
        {title}
      </summary>
      <div className="p-4">{children}</div>
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
