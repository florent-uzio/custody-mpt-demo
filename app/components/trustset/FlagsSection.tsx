import type { TrustSetFlag, TrustSetFlagOption } from "../TrustSet.types";

const TRUSTSET_FLAGS: TrustSetFlagOption[] = [
  {
    name: "tfSetFreeze",
    description: "Freeze this trustline. The counterparty cannot transfer tokens.",
    group: "freeze",
  },
  {
    name: "tfClearFreeze",
    description: "Unfreeze this trustline. Restore normal transfer ability.",
    group: "freeze",
  },
  {
    name: "tfSetfAuth",
    description:
      "Authorize the counterparty to hold the currency issued by this account.",
    group: "auth",
  },
];

interface Props {
  selectedFlags: TrustSetFlag[];
  onToggle: (flag: TrustSetFlag) => void;
}

export function FlagsSection({ selectedFlags, onToggle }: Props) {
  const handleToggle = (flag: TrustSetFlag) => {
    // Enforce mutual exclusion: tfSetFreeze and tfClearFreeze cannot coexist
    if (flag === "tfSetFreeze" && selectedFlags.includes("tfClearFreeze")) {
      return;
    }
    if (flag === "tfClearFreeze" && selectedFlags.includes("tfSetFreeze")) {
      return;
    }
    onToggle(flag);
  };

  const isDisabled = (flag: TrustSetFlag): boolean => {
    if (flag === "tfSetFreeze" && selectedFlags.includes("tfClearFreeze")) {
      return true;
    }
    if (flag === "tfClearFreeze" && selectedFlags.includes("tfSetFreeze")) {
      return true;
    }
    return false;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
          3
        </span>
        Flags
        <span className="ml-auto text-sm font-normal text-gray-500">
          {selectedFlags.length} flag{selectedFlags.length !== 1 ? "s" : ""}{" "}
          selected
        </span>
      </h3>

      <div className="space-y-3">
        {TRUSTSET_FLAGS.map((flag) => {
          const disabled = isDisabled(flag.name);
          return (
            <label
              key={flag.name}
              className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
                disabled
                  ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-50"
                  : selectedFlags.includes(flag.name)
                    ? "border-emerald-500 bg-emerald-50 cursor-pointer"
                    : "border-gray-200 hover:border-gray-300 bg-white cursor-pointer"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedFlags.includes(flag.name)}
                onChange={() => handleToggle(flag.name)}
                disabled={disabled}
                className="mt-1 w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 text-sm">
                    {flag.name}
                  </span>
                  {flag.group === "freeze" && (
                    <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                      freeze
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{flag.description}</p>
                {disabled && (
                  <p className="text-xs text-amber-600 mt-1">
                    Cannot be combined with{" "}
                    {flag.name === "tfSetFreeze"
                      ? "tfClearFreeze"
                      : "tfSetFreeze"}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
