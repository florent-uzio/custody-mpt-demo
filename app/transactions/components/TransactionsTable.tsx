import Link from "next/link";
import { CopyButton } from "../../components/CopyButton";

interface TransactionItem {
  id: string;
  ledgerId: string;
  orderReference?: {
    id?: string;
    requestId?: string;
    intentId?: string;
  };
  relatedAccounts: Array<{
    accountId: string;
    domainId: string;
  }>;
  processing?: {
    status?: string;
    [key: string]: unknown;
  };
  registeredAt: string;
  ledgerTransactionData?: {
    ledgerStatus?: string;
    statusLastUpdatedAt?: string;
    [key: string]: unknown;
  };
}

const PROCESSING_STYLES: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  Completed:  { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Failed:     { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500" },
  Submitted:  { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500" },
  Processing: { bg: "bg-yellow-50",  text: "text-yellow-700",  dot: "bg-yellow-500" },
};

const LEDGER_STYLES: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  Success: { bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500" },
  Failed:  { bg: "bg-red-50",    text: "text-red-700",    dot: "bg-red-400" },
};

function StatusBadge({
  status,
  styleMap,
}: {
  status: string;
  styleMap: typeof PROCESSING_STYLES;
}) {
  const s = styleMap[status] ?? {
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
  items: TransactionItem[];
  totalCount: number;
  domainId?: string;
}

export function TransactionsTable({ items, totalCount, domainId }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Processing
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Ledger Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Registered At
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
                  {item.processing?.status ? (
                    <StatusBadge
                      status={item.processing.status}
                      styleMap={PROCESSING_STYLES}
                    />
                  ) : (
                    <span className="text-gray-300 text-xs italic">—</span>
                  )}
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
                  {item.ledgerTransactionData?.ledgerStatus ? (
                    <StatusBadge
                      status={item.ledgerTransactionData.ledgerStatus}
                      styleMap={LEDGER_STYLES}
                    />
                  ) : (
                    <span className="text-gray-300 text-xs italic">—</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500 whitespace-nowrap">
                  {formatDate(item.registeredAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/transactions/${item.id}?domainId=${domainId}`}
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
          {items.length} of {totalCount} shown
        </span>
      </div>
    </div>
  );
}
