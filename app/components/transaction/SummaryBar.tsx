import { Core_TransactionDetails } from "custody";
import { StatusConfig, ProcessingStatus, formatDate } from "./config";
import { LedgerStatusBadge } from "./LedgerStatusBadge";

interface Props {
  tx: Core_TransactionDetails;
  processingStatus: ProcessingStatus | undefined;
  cfg: StatusConfig;
}

export function SummaryBar({ tx, processingStatus, cfg }: Props) {
  return (
    <div className={`bg-white rounded-xl border ${cfg.border} shadow-sm p-5`}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
            Processing
          </p>
          {processingStatus ? (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {processingStatus}
            </span>
          ) : (
            <span className="text-gray-300 italic text-sm">—</span>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
            Ledger Status
          </p>
          {tx.ledgerTransactionData?.ledgerStatus ? (
            <LedgerStatusBadge status={tx.ledgerTransactionData.ledgerStatus} />
          ) : (
            <span className="text-gray-300 italic text-sm">—</span>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
            Ledger
          </p>
          <p className="text-sm text-gray-700 font-mono truncate">{tx.ledgerId}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
            Registered At
          </p>
          <p className="text-sm text-gray-700">{formatDate(tx.registeredAt)}</p>
        </div>
      </div>
    </div>
  );
}
