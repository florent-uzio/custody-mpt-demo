import type { DryRunIntentResult } from "@/app/lib/custody";
import { JsonViewer } from "../JsonViewer";

type TransactionOrderDryRun = Extract<
  DryRunIntentResult["response"],
  { type: "v0_CreateTransactionOrder" }
>;

const isTransactionOrder = (
  r: DryRunIntentResult["response"],
): r is TransactionOrderDryRun => r.type === "v0_CreateTransactionOrder";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/70 border border-gray-200 px-3 py-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-mono text-sm text-gray-800">{value}</div>
    </div>
  );
}

/** Verdict card (pass / fail, fee estimate, failure reason) plus the raw response. */
export function DryRunResult({ data }: { data: DryRunIntentResult }) {
  const { response } = data;
  const order = isTransactionOrder(response) ? response : null;
  const failure =
    order?.result.type === "Failure"
      ? order.result
      : order?.estimate.type === "Failure"
        ? order.estimate
        : null;
  const ok = response.success && !failure;
  const estimate = order?.estimate.type === "XRPL" ? order.estimate : null;

  return (
    <div className="space-y-4">
      <div
        className={`rounded-xl border p-5 ${
          ok ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{ok ? "✅" : "❌"}</span>
          <div>
            <h3
              className={`font-semibold ${ok ? "text-emerald-900" : "text-red-900"}`}
            >
              {ok ? "Dry run passed" : "Dry run failed"}
            </h3>
            <p
              className={`text-sm ${ok ? "text-emerald-700" : "text-red-700"}`}
            >
              {ok
                ? "Nothing was submitted. You can now propose the real intent."
                : "Nothing was submitted. Fix the issue below and dry-run again."}
            </p>
          </div>
        </div>

        {failure && (
          <p className="mt-3 text-sm text-red-800">
            <span className="font-medium">{failure.hint}:</span>{" "}
            {failure.reason}
          </p>
        )}
        {response.errors && response.errors.length > 0 && (
          <ul className="mt-3 list-disc pl-5 text-sm text-red-800">
            {response.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
        {estimate && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Stat label="Estimated fee (drops)" value={estimate.fee} />
            <Stat
              label="Minimum cost (drops)"
              value={estimate.minimumCostInDrops}
            />
          </div>
        )}
      </div>

      <JsonViewer data={response} title="Dry Run Response" />
    </div>
  );
}
