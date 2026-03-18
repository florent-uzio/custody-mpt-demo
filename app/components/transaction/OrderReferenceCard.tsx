import { Core_TransactionDetails } from "custody";
import { InfoCard, InfoRow } from "./InfoCard";
import { CopyButton } from "../CopyButton";

type OrderReference = NonNullable<Core_TransactionDetails["orderReference"]>;

export function OrderReferenceCard({
  orderReference,
}: {
  orderReference: OrderReference;
}) {
  return (
    <InfoCard title="Order Reference" icon="🔗">
      <InfoRow
        label="Order ID"
        value={
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs">{orderReference.id}</span>
            <CopyButton text={orderReference.id} />
          </div>
        }
      />
      <InfoRow
        label="Domain ID"
        value={
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs">{orderReference.domainId}</span>
            <CopyButton text={orderReference.domainId} />
          </div>
        }
      />
    </InfoCard>
  );
}
