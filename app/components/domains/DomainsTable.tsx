import { Core_TrustedDomain, GetDomainsQueryParams } from "custody";
import { CopyButton } from "../CopyButton";
import { useDefaultDomain } from "../../contexts/DomainContext";

type SortBy = NonNullable<NonNullable<GetDomainsQueryParams>["sortBy"]>;

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
        <span className={`transition-colors ${isActive ? "text-blue-500" : "text-gray-300"}`}>
          {isActive && currentSortOrder === "ASC" ? "↑" : "↓"}
        </span>
      </span>
    </th>
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
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${styles}`}>
      {lock}
    </span>
  );
}

interface Props {
  domains: Core_TrustedDomain[];
  totalCount: number;
  sortBy?: SortBy;
  sortOrder?: "ASC" | "DESC";
  onSort: (field: SortBy) => void;
}

export function DomainsTable({
  domains,
  totalCount,
  sortBy,
  sortOrder,
  onSort,
}: Props) {
  const { setDefaultDomainId } = useDefaultDomain();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <SortableHeader
                label="Alias"
                field="alias"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={onSort}
              />
              <SortableHeader
                label="Domain ID"
                field="id"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={onSort}
              />
              <SortableHeader
                label="Lock"
                field="lock"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={onSort}
              />
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Parent ID
              </th>
              <SortableHeader
                label="Created"
                field="metadata.createdAt"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={onSort}
                className="hidden lg:table-cell"
              />
              <th className="w-28 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                Default
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {domains.map(({ data }) => (
              <tr key={data.id} className="hover:bg-blue-50/40 transition-colors group">
                <td className="px-4 py-3">
                  {data.alias ? (
                    <span className="font-medium text-gray-900">{data.alias}</span>
                  ) : (
                    <span className="text-gray-300 italic text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-gray-600">
                      {truncateId(data.id)}
                    </span>
                    <CopyButton text={data.id} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <LockBadge lock={data.lock} />
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {data.parentId ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-gray-500">
                        {truncateId(data.parentId)}
                      </span>
                      <CopyButton text={data.parentId} />
                    </div>
                  ) : (
                    <span className="text-gray-300 italic text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs whitespace-nowrap">
                  {formatDate(data.metadata.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setDefaultDomainId(data.id)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Set default
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          {domains.length} of {totalCount} shown
        </span>
      </div>
    </div>
  );
}
