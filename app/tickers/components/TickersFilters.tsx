import { GetTickersQueryParams, XrplLedgerId } from "@florent-uzio/custody";

type Params = NonNullable<GetTickersQueryParams>;
type SortBy = NonNullable<Params["sortBy"]>;
type Kind = NonNullable<Params["kind"]>;
type ValidationStatus = NonNullable<Params["validationStatus"]>;
type LockStatus = NonNullable<Params["lock"]>[number];

// Mirrors the transactions page ledger select (typed against the SDK union).
const XRPL_LEDGER_IDS: readonly XrplLedgerId[] = [
  "xrpl",
  "xrpl-testnet-august-2024",
  "xrpl-devnet",
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "symbol", label: "Symbol" },
  { value: "kind", label: "Kind" },
  { value: "ledgerId", label: "Ledger ID" },
  { value: "id", label: "ID" },
];

const KIND_OPTIONS: Kind[] = ["Native", "Token", "Contract"];

interface Props {
  ledgerId: XrplLedgerId;
  onLedgerIdChange: (v: XrplLedgerId) => void;
  kind: Kind | undefined;
  onKindChange: (v: Kind | undefined) => void;
  validationStatus: ValidationStatus | undefined;
  onValidationStatusChange: (v: ValidationStatus | undefined) => void;
  lock: LockStatus[];
  onLockChange: (v: LockStatus[]) => void;
  name: string;
  onNameChange: (v: string) => void;
  symbol: string;
  onSymbolChange: (v: string) => void;
  sortBy: SortBy | undefined;
  onSortByChange: (v: SortBy | undefined) => void;
  sortOrder: "ASC" | "DESC";
  onSortOrderChange: (v: "ASC" | "DESC") => void;
  limit: number;
  onLimitChange: (v: number) => void;
}

export function TickersFilters({
  ledgerId,
  onLedgerIdChange,
  kind,
  onKindChange,
  validationStatus,
  onValidationStatusChange,
  lock,
  onLockChange,
  name,
  onNameChange,
  symbol,
  onSymbolChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  limit,
  onLimitChange,
}: Props) {
  function toggleLock(value: LockStatus) {
    onLockChange(
      lock.includes(value) ? lock.filter((l) => l !== value) : [...lock, value],
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3 items-end">
      {/* Ledger */}
      <div className="flex flex-col gap-1 min-w-48">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Ledger
        </label>
        <select
          value={ledgerId}
          onChange={(e) => onLedgerIdChange(e.target.value as XrplLedgerId)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {XRPL_LEDGER_IDS.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>

      {/* Kind */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Kind
        </label>
        <select
          value={kind ?? ""}
          onChange={(e) => onKindChange((e.target.value as Kind) || undefined)}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          {KIND_OPTIONS.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      {/* Validation status */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Validation
        </label>
        <select
          value={validationStatus ?? ""}
          onChange={(e) =>
            onValidationStatusChange(
              (e.target.value as ValidationStatus) || undefined,
            )
          }
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Default</option>
          <option value="Validated">Validated</option>
          <option value="NonValidated">NonValidated</option>
        </select>
      </div>

      {/* Lock filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Lock
        </label>
        <div className="flex items-center gap-2">
          {(["Unlocked", "Locked", "Archived"] as LockStatus[]).map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => toggleLock(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                lock.includes(val)
                  ? val === "Unlocked"
                    ? "bg-green-100 text-green-800 border-green-300"
                    : val === "Locked"
                      ? "bg-red-100 text-red-800 border-red-300"
                      : "bg-gray-200 text-gray-700 border-gray-400"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Name search */}
      <div className="flex flex-col gap-1 min-w-36">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. XRP, USD"
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Symbol search */}
      <div className="flex flex-col gap-1 min-w-36">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Symbol
        </label>
        <input
          type="text"
          value={symbol}
          onChange={(e) => onSymbolChange(e.target.value)}
          placeholder="e.g. XRP, USD"
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Sort by */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Sort By
        </label>
        <select
          value={sortBy ?? ""}
          onChange={(e) =>
            onSortByChange((e.target.value as SortBy) || undefined)
          }
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Default</option>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort order */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Order
        </label>
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          {(["ASC", "DESC"] as const).map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onSortOrderChange(val)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                sortOrder === val
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Limit */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Limit
        </label>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[10, 20, 50, 100].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
