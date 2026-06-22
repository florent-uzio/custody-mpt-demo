import Link from "next/link";
import { Core_ApiTicker, GetTickersQueryParams } from "@florent-uzio/custody";
import { CopyButton } from "../../components/CopyButton";

type SortBy = NonNullable<NonNullable<GetTickersQueryParams>["sortBy"]>;

function truncateId(id: string) {
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

function SortableHeader({
  label,
  field,
  currentSortBy,
  currentSortOrder,
  onSort,
  className = "",
}: {
  label: string;
  field: SortBy;
  currentSortBy?: SortBy;
  currentSortOrder?: "ASC" | "DESC";
  onSort: (field: SortBy) => void;
  className?: string;
}) {
  const isActive = currentSortBy === field;
  return (
    <th
      onClick={() => onSort(field)}
      className={`text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-800 transition-colors ${className}`}
    >
      <span className="flex items-center gap-1">
        {label}
        <span
          className={`transition-colors ${isActive ? "text-blue-500" : "text-gray-300"}`}
        >
          {isActive && currentSortOrder === "ASC" ? "↑" : "↓"}
        </span>
      </span>
    </th>
  );
}

function KindBadge({ kind }: { kind: string }) {
  const styles =
    kind === "Native"
      ? "bg-green-50 text-green-700"
      : kind === "Token"
        ? "bg-blue-50 text-blue-700"
        : "bg-purple-50 text-purple-700";
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${styles}`}
    >
      {kind}
    </span>
  );
}

function LockBadge({ lock }: { lock: string }) {
  const styles =
    lock === "Unlocked"
      ? "bg-green-50 text-green-700"
      : lock === "Locked"
        ? "bg-red-50 text-red-700"
        : "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${styles}`}
    >
      {lock}
    </span>
  );
}

interface Props {
  tickers: Core_ApiTicker[];
  totalCount: number;
  sortBy?: SortBy;
  sortOrder?: "ASC" | "DESC";
  onSort: (field: SortBy) => void;
}

export function TickersTable({
  tickers,
  totalCount,
  sortBy,
  sortOrder,
  onSort,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <SortableHeader
                label="Name"
                field="name"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={onSort}
              />
              <SortableHeader
                label="Symbol"
                field="symbol"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={onSort}
              />
              <SortableHeader
                label="Kind"
                field="kind"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={onSort}
              />
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Decimals
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Lock
              </th>
              <SortableHeader
                label="Ledger"
                field="ledgerId"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={onSort}
                className="hidden lg:table-cell"
              />
              <SortableHeader
                label="Ticker ID"
                field="id"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={onSort}
              />
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tickers.map(({ data }) => (
              <tr
                key={data.id}
                className="hover:bg-blue-50/40 transition-colors group"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/tickers/${data.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {data.name || (
                      <span className="text-gray-300 italic text-xs">—</span>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-700">
                  {data.symbol || (
                    <span className="text-gray-300 italic">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <KindBadge kind={data.kind} />
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-700">
                  {data.decimals ?? (
                    <span className="text-gray-300 italic">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <LockBadge lock={data.lock} />
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs whitespace-nowrap">
                  {data.ledgerId}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-gray-600">
                      {truncateId(data.id)}
                    </span>
                    <CopyButton text={data.id} />
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/tickers/${data.id}`}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-300 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors"
                    aria-label="View ticker"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          {tickers.length} of {totalCount} shown
        </span>
      </div>
    </div>
  );
}
