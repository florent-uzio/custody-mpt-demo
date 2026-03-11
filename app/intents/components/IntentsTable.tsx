import Link from "next/link";
import { CopyButton } from "../../components/CopyButton";
import { StatusBadge } from "./StatusBadge";
import type { TrustedIntent, IntentSortBy, SortOrder } from "../intents.types";

function truncateId(id: string) {
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatType(type: string) {
  return type.replace(/^v0_/, "").replace(/([A-Z])/g, " $1").trim();
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
  field: IntentSortBy;
  currentSortBy?: IntentSortBy;
  currentSortOrder?: SortOrder;
  onSort: (field: IntentSortBy) => void;
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

interface Props {
  intents: TrustedIntent[];
  totalCount: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  sortBy?: IntentSortBy;
  sortOrder?: SortOrder;
  onSort: (field: IntentSortBy) => void;
  onLoadMore: () => void;
  domainId?: string;
}

export function IntentsTable({
  intents,
  totalCount,
  hasNextPage,
  isFetchingNextPage,
  sortBy,
  sortOrder,
  onSort,
  onLoadMore,
  domainId,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Intent ID
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Description
              </th>
              <SortableHeader
                label="Created"
                field="details.metadata.createdAt"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={onSort}
                className="hidden lg:table-cell"
              />
              <SortableHeader
                label="Expires"
                field="details.expiryAt"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={onSort}
                className="hidden lg:table-cell"
              />
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {intents.map(({ data: intent }) => (
              <tr
                key={intent.id}
                className="hover:bg-blue-50/40 transition-colors group"
              >
                <td className="px-4 py-3">
                  <StatusBadge status={intent.state.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-gray-700">
                      {truncateId(intent.id)}
                    </span>
                    <CopyButton text={intent.id} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100">
                    {formatType(intent.details.payload.type)}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell max-w-xs">
                  <span className="text-gray-600 truncate block">
                    {intent.details.metadata.description || (
                      <span className="text-gray-300 italic">—</span>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs whitespace-nowrap">
                  {formatDate(intent.details.metadata.createdAt)}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs whitespace-nowrap">
                  {formatDate(intent.details.expiryAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/intents/${intent.id}?domainId=${domainId}`}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-300 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors"
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

      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {intents.length} of {totalCount} shown
        </span>
        {hasNextPage && (
          <button
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {isFetchingNextPage ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading…
              </>
            ) : (
              "Load more"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
