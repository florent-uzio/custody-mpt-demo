import { useState, useRef } from "react";
import Link from "next/link";
import { CopyButton } from "../../components/CopyButton";

interface TransferItem {
  id: string;
  transactionId?: string;
  tickerId: string;
  quarantined: boolean;
  senders: Array<{
    accountId: string;
    domainId: string;
    amount: string;
  }>;
  recipient?: {
    accountId: string;
    domainId: string;
    amount: string;
  };
  value: string;
  kind: "Transfer" | "Fee" | "Recovery";
  registeredAt: string;
  metadata: unknown;
}

const KIND_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Transfer: { bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500" },
  Fee:      { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  Recovery: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
};

function KindBadge({ kind }: { kind: string }) {
  const s = KIND_STYLES[kind] ?? { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {kind}
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

function formatAmount(amount: string) {
  return parseInt(amount).toLocaleString();
}

const MAX_VALUE_CHARS = 14;

function TruncatedValue({ amount }: { amount: string }) {
  const formatted = formatAmount(amount);
  const isTruncated = formatted.length > MAX_VALUE_CHARS;
  const display = isTruncated ? formatted.slice(0, MAX_VALUE_CHARS) + "…" : formatted;
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  if (!isTruncated) return <span>{formatted}</span>;

  return (
    <span className="relative inline-block" ref={ref}>
      <span
        className="cursor-default underline decoration-dotted decoration-gray-400"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {display}
      </span>
      {visible && (
        <span className="absolute bottom-full left-0 mb-1.5 z-50 whitespace-nowrap bg-gray-900 text-white text-xs font-mono px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none">
          {formatted}
        </span>
      )}
    </span>
  );
}

interface Props {
  items: TransferItem[];
  totalCount: number;
  domainId?: string;
}

export function TransfersTable({ items, totalCount, domainId }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Kind
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Transfer ID
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Quarantined
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Value
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Registered At
              </th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/40 transition-colors group">
                <td className="px-4 py-3">
                  <KindBadge kind={item.kind} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-gray-700">
                      {truncateId(item.id)}
                    </span>
                    <CopyButton text={item.id} />
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      item.quarantined
                        ? "bg-red-50 text-red-700"
                        : "bg-green-50 text-green-700"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${item.quarantined ? "bg-red-500" : "bg-green-500"}`} />
                    {item.quarantined ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-700 font-medium">
                  <TruncatedValue amount={item.value} />
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500 whitespace-nowrap">
                  {formatDate(item.registeredAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/transfers/${item.id}?domainId=${domainId}`}
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
