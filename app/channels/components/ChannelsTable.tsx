import Link from "next/link";
import type { EDS_Channel } from "@florent-uzio/custody";
import { CopyButton } from "../../components/CopyButton";

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> =
  {
    ACTIVE: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    DISABLED: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  };

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function truncateId(id: string) {
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}…${id.slice(-4)}`;
}

function truncateUrl(url: string, max = 40) {
  if (url.length <= max) return url;
  return `${url.slice(0, max)}…`;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  items: EDS_Channel[];
  totalCount: number;
}

export function ChannelsTable({ items, totalCount }: Props) {
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
                Name
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                URL
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Events
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Error rate
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Last updated
              </th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-blue-50/40 transition-colors group"
              >
                <td className="px-4 py-3">
                  {item.status ? (
                    <StatusBadge status={item.status} />
                  ) : (
                    <span className="text-gray-300 text-xs italic">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-800">
                      {item.name || (
                        <span className="text-gray-300 italic">unnamed</span>
                      )}
                    </span>
                    {item.id && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-gray-400">
                          {truncateId(item.id)}
                        </span>
                        <CopyButton text={item.id} />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {item.url ? (
                    <span
                      className="font-mono text-xs text-gray-600"
                      title={item.url}
                    >
                      {truncateUrl(item.url)}
                    </span>
                  ) : (
                    <span className="text-gray-300 text-xs italic">—</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  {item.supportedEventTypes &&
                  item.supportedEventTypes.length > 0 ? (
                    <span
                      className="inline-flex items-center px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-100 rounded text-xs font-medium"
                      title={item.supportedEventTypes.slice(0, 5).join("\n")}
                    >
                      {item.supportedEventTypes.length}
                    </span>
                  ) : (
                    <span className="text-gray-300 text-xs italic">0</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500">
                  {item.errorRate !== undefined && item.errorRate !== null
                    ? `${(item.errorRate * 100).toFixed(1)}%`
                    : "—"}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500 whitespace-nowrap">
                  {formatDate(item.lastUpdatedAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  {item.id && (
                    <Link
                      href={`/channels/${item.id}`}
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
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {items.length} of {totalCount} shown
        </span>
      </div>
    </div>
  );
}
