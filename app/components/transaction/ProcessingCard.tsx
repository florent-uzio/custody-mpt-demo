import { Core_TransactionDetails } from "custody";
import { StatusConfig, ProcessingStatus, formatDate } from "./config";
import { InfoCard, InfoRow } from "./InfoCard";
import { CopyButton } from "../CopyButton";

interface Props {
  tx: Core_TransactionDetails;
  processingStatus: ProcessingStatus | undefined;
  cfg: StatusConfig;
}

export function ProcessingCard({ tx, processingStatus, cfg }: Props) {
  return (
    <InfoCard title="Processing" icon="⚙️">
      <InfoRow
        label="Status"
        value={
          processingStatus ? (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {processingStatus}
            </span>
          ) : (
            <span className="text-gray-300 italic">—</span>
          )
        }
      />
      <InfoRow
        label="Transaction ID"
        value={
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs break-all">{tx.id}</span>
            <CopyButton text={tx.id} />
          </div>
        }
      />
      <InfoRow label="Registered At" value={formatDate(tx.registeredAt)} />
    </InfoCard>
  );
}
