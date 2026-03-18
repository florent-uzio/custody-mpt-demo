import { Core_TrustedDomain } from "custody";
import { InfoCard, InfoRow } from "../transaction/InfoCard";
import { CopyButton } from "../CopyButton";
import { formatDate } from "./config";

type Metadata = Core_TrustedDomain["data"]["metadata"];

interface Props {
  metadata: Metadata;
}

export function DomainMetadataCard({ metadata }: Props) {
  const customEntries = metadata.customProperties
    ? Object.entries(metadata.customProperties)
    : [];

  return (
    <InfoCard title="Metadata" icon="📋">
      <InfoRow label="Revision" value={metadata.revision} />
      <InfoRow label="Created At" value={formatDate(metadata.createdAt)} />
      {metadata.createdBy && (
        <InfoRow
          label="Created By"
          value={
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs break-all">{metadata.createdBy.id}</span>
              <CopyButton text={metadata.createdBy.id} />
            </div>
          }
        />
      )}
      <InfoRow label="Last Modified" value={formatDate(metadata.lastModifiedAt)} />
      {metadata.lastModifiedBy && (
        <InfoRow
          label="Modified By"
          value={
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs break-all">{metadata.lastModifiedBy.id}</span>
              <CopyButton text={metadata.lastModifiedBy.id} />
            </div>
          }
        />
      )}
      {customEntries.length > 0 && (
        <>
          <div className="border-t border-gray-100 mt-3 pt-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Custom Properties
            </p>
          </div>
          {customEntries.map(([key, value]) => (
            <InfoRow key={key} label={key} value={String(value)} />
          ))}
        </>
      )}
    </InfoCard>
  );
}
