import { InfoCard, InfoRow } from "../transaction/InfoCard";
import { CopyButton } from "../CopyButton";

interface Props {
  signature: string;
  signingKey: string;
}

export function DomainSignatureCard({ signature, signingKey }: Props) {
  return (
    <InfoCard title="Signature" icon="🔏">
      <InfoRow
        label="Signature"
        value={
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs break-all">{signature}</span>
            <CopyButton text={signature} />
          </div>
        }
      />
      <InfoRow
        label="Signing Key"
        value={
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs break-all">{signingKey}</span>
            <CopyButton text={signingKey} />
          </div>
        }
      />
    </InfoCard>
  );
}
