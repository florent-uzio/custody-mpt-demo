import Link from "next/link";
import { CopyButton } from "../../components/CopyButton";
import type { Core_TrustedPolicy, Core_PolicyScope, Core_Policy } from "custody";

type Core_LockStatus = Core_Policy["lock"];

const SCOPE_STYLES: Record<Core_PolicyScope, { bg: string; text: string; dot: string }> = {
  Self:               { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500" },
  Descendants:        { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  SelfAndDescendants: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
};

const LOCK_STYLES: Record<Core_LockStatus, { bg: string; text: string; dot: string }> = {
  Unlocked: { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500" },
  Locked:   { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-500" },
  Archived: { bg: "bg-gray-100",  text: "text-gray-600",   dot: "bg-gray-400" },
};

function ScopeBadge({ scope }: { scope: Core_PolicyScope }) {
  const s = SCOPE_STYLES[scope] ?? { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {scope}
    </span>
  );
}

function LockBadge({ lock }: { lock: Core_LockStatus }) {
  const s = LOCK_STYLES[lock] ?? { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {lock}
    </span>
  );
}

function truncateId(id: string) {
  if (id.length <= 16) return id;
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

interface Props {
  items: Core_TrustedPolicy[];
  totalCount: number;
  domainId?: string;
}

export function PoliciesTable({ items, totalCount, domainId }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Scope
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Policy ID
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Alias
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Rank
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Lock
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Created At
              </th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => (
              <tr key={item.data.id} className="hover:bg-blue-50/40 transition-colors group">
                <td className="px-4 py-3">
                  <ScopeBadge scope={item.data.scope} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-gray-700">
                      {truncateId(item.data.id)}
                    </span>
                    <CopyButton text={item.data.id} />
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                  {item.data.alias}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-600 tabular-nums">
                  {item.data.rank}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <LockBadge lock={item.data.lock} />
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500 whitespace-nowrap">
                  {item.data.metadata?.createdAt
                    ? formatDate(item.data.metadata.createdAt)
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/policies/${item.data.id}${domainId ? `?domainId=${domainId}` : ""}`}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-300 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
          {items.length} of {totalCount} shown
        </span>
      </div>
    </div>
  );
}
