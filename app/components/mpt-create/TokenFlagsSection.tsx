import type { MPTFlag, MPTFlagOption } from "../MPTCreate.types";

const MPT_FLAGS: MPTFlagOption[] = [
  {
    name: "tfMPTCanLock",
    description: "MPT can be locked both individually and globally",
  },
  {
    name: "tfMPTRequireAuth",
    description: "Individual holders must be authorized to hold this MPT",
  },
  {
    name: "tfMPTCanEscrow",
    description: "Holders can place their balances into an escrow",
  },
  {
    name: "tfMPTCanTrade",
    description: "Holders can trade balances on the XRP Ledger DEX",
  },
  {
    name: "tfMPTCanTransfer",
    description:
      "Tokens can be transferred to accounts other than the issuer",
  },
  {
    name: "tfMPTCanClawback",
    description: "Issuer can clawback value from individual holders",
  },
];

interface Props {
  selectedFlags: MPTFlag[];
  onToggle: (flag: MPTFlag) => void;
  sortFlags: boolean;
  onSortFlagsChange: (value: boolean) => void;
}

export function TokenFlagsSection({
  selectedFlags,
  onToggle,
  sortFlags,
  onSortFlagsChange,
}: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-sm font-bold">
          3
        </span>
        Token Flags
        <span className="ml-auto text-sm font-normal text-gray-500">
          {selectedFlags.length} flag{selectedFlags.length !== 1 ? "s" : ""}{" "}
          selected
        </span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MPT_FLAGS.map((flag) => (
          <label
            key={flag.name}
            className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedFlags.includes(flag.name)
                ? "border-violet-500 bg-violet-50"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
          >
            <input
              type="checkbox"
              checked={selectedFlags.includes(flag.name)}
              onChange={() => onToggle(flag.name)}
              className="mt-1 w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900 text-sm">
                {flag.name}
              </span>
              <p className="text-xs text-gray-500 mt-1">{flag.description}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={sortFlags}
            onChange={(e) => onSortFlagsChange(e.target.checked)}
            className="mt-1 w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
          />
          <div className="flex-1">
            <span className="font-medium text-gray-900 text-sm">
              Reorder flags before signing (backend bug workaround)
            </span>
            <p className="text-xs text-gray-600 mt-2">
              The API turns <code>flags</code> into an <strong>unordered set</strong>,
              then re-serializes that set when it checks the request signature — but
              the SDK signed the order it actually sent. With <strong>4 flags or
              fewer</strong> the set keeps insertion order, so any order verifies.
              With <strong>5 or more</strong> it becomes hash-ordered and re-emits one
              fixed order, so the bytes checked no longer match the bytes signed and
              the request fails with <code>401 InvalidSignatureError</code>.
            </p>
            <p className="text-xs text-gray-600 mt-2">
              <strong>On:</strong> flags are sent pre-sorted into the order the backend
              re-emits them in (CanTransfer → CanLock → RequireAuth → CanTrade →
              CanClawback → CanEscrow), so any combination works.{" "}
              <strong>Off:</strong> flags are sent in the order you ticked them, which
              reproduces the raw backend behaviour.
            </p>
          </div>
        </label>

        {!sortFlags && selectedFlags.length >= 5 && (
          <p className="mt-3 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
            Workaround off with {selectedFlags.length} flags selected — expect this
            request to fail with <code>401 InvalidSignatureError</code>.
          </p>
        )}
      </div>
    </div>
  );
}
