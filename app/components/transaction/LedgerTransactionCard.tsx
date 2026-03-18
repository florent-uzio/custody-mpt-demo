import { Core_TransactionDetails } from "custody";
import { formatDate } from "./config";
import { InfoCard, InfoRow } from "./InfoCard";
import { LedgerStatusBadge } from "./LedgerStatusBadge";
import { CopyButton } from "../CopyButton";

type LedgerTransactionData = NonNullable<
  Core_TransactionDetails["ledgerTransactionData"]
>;

export function LedgerTransactionCard({ data }: { data: LedgerTransactionData }) {
  const xrplData = data.ledgerData?.type === "Xrpl" ? data.ledgerData : null;

  return (
    <InfoCard title="Ledger Transaction" icon="🔗">
      {data.ledgerStatus && (
        <InfoRow
          label="Status"
          value={<LedgerStatusBadge status={data.ledgerStatus} />}
        />
      )}
      {data.ledgerTransactionId && (
        <InfoRow
          label="Tx Hash"
          value={
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs break-all">
                {data.ledgerTransactionId}
              </span>
              <CopyButton text={data.ledgerTransactionId} />
            </div>
          }
        />
      )}
      {data.blockTime && (
        <InfoRow label="Block Time" value={formatDate(data.blockTime)} />
      )}
      {data.failure && (
        <InfoRow
          label="Failure"
          value={
            <span className="text-red-600 text-xs">{data.failure}</span>
          }
        />
      )}
      {xrplData?.tokenData?.issuanceId && (
        <InfoRow
          label="Issuance ID"
          value={
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs break-all">
                {xrplData.tokenData.issuanceId}
              </span>
              <CopyButton text={xrplData.tokenData.issuanceId} />
            </div>
          }
        />
      )}
    </InfoCard>
  );
}
