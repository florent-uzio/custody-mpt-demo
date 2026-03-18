import { GetDomainsQueryParams } from "custody";

type Params = NonNullable<GetDomainsQueryParams>;
type SortBy = NonNullable<Params["sortBy"]>;
type LockStatus = NonNullable<Params["lock"]>[number];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "alias", label: "Alias" },
  { value: "id", label: "ID" },
  { value: "lock", label: "Lock" },
  { value: "metadata.createdAt", label: "Created At" },
  { value: "metadata.lastModifiedAt", label: "Last Modified" },
];

interface Props {
  alias: string;
  onAliasChange: (v: string) => void;
  parentId: string;
  onParentIdChange: (v: string) => void;
  lock: LockStatus[];
  onLockChange: (v: LockStatus[]) => void;
  sortBy: SortBy | undefined;
  onSortByChange: (v: SortBy | undefined) => void;
  sortOrder: "ASC" | "DESC";
  onSortOrderChange: (v: "ASC" | "DESC") => void;
  limit: number;
  onLimitChange: (v: number) => void;
}

export function DomainsFilters({
  alias,
  onAliasChange,
  parentId,
  onParentIdChange,
  lock,
  onLockChange,
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
      {/* Alias search */}
      <div className="flex flex-col gap-1 min-w-36">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Alias
        </label>
        <input
          type="text"
          value={alias}
          onChange={(e) => onAliasChange(e.target.value)}
          placeholder="Search alias…"
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Parent ID */}
      <div className="flex flex-col gap-1 min-w-44">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Parent ID
        </label>
        <input
          type="text"
          value={parentId}
          onChange={(e) => onParentIdChange(e.target.value)}
          placeholder="Filter by parent…"
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
        />
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
