import { Core_TrustedDomain } from "custody";
import { InfoCard, InfoRow } from "../transaction/InfoCard";
import { CopyButton } from "../CopyButton";
import { LockStatusConfig } from "./config";

type Domain = Core_TrustedDomain["data"];

interface Props {
  domain: Domain;
  cfg: LockStatusConfig;
}

export function DomainDetailsCard({ domain, cfg }: Props) {
  return (
    <InfoCard title="Domain Details" icon="🏢">
      <InfoRow
        label="Domain ID"
        value={
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs break-all">{domain.id}</span>
            <CopyButton text={domain.id} />
          </div>
        }
      />
      <InfoRow
        label="Alias"
        value={domain.alias || <span className="text-gray-300 italic">No alias</span>}
      />
      <InfoRow
        label="Lock Status"
        value={
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {domain.lock}
          </span>
        }
      />
      {domain.parentId && (
        <InfoRow
          label="Parent ID"
          value={
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs break-all">{domain.parentId}</span>
              <CopyButton text={domain.parentId} />
            </div>
          }
        />
      )}
      {domain.governingStrategy && (
        <InfoRow label="Governing Strategy" value={domain.governingStrategy} />
      )}
    </InfoCard>
  );
}
