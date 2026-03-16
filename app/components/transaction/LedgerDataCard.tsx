import { Core_TransactionDetails } from "custody";
import { formatDate } from "./config";
import { InfoCard, InfoRow } from "./InfoCard";
import { LedgerStatusBadge } from "./LedgerStatusBadge";
import { CopyButton } from "../CopyButton";

export function LedgerDataCard({ tx }: { tx: Core_TransactionDetails }) {
  return (
    <InfoCard title="Ledger Data" icon="📒">
      <InfoRow
        label="Ledger ID"
        value={
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs">{tx.ledgerId}</span>
            <CopyButton text={tx.ledgerId} />
          </div>
        }
      />
      <InfoRow
        label="Status"
        value={
          tx.ledgerTransactionData?.ledgerStatus ? (
            <LedgerStatusBadge status={tx.ledgerTransactionData.ledgerStatus} />
          ) : (
            <span className="text-gray-300 italic">—</span>
          )
        }
      />
      {tx.ledgerTransactionData?.statusLastUpdatedAt && (
        <InfoRow
          label="Last Updated"
          value={formatDate(tx.ledgerTransactionData.statusLastUpdatedAt)}
        />
      )}
    </InfoCard>
  );
}
