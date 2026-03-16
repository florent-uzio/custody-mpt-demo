import { Core_TrustedDomain } from "custody";
import { InfoCard, InfoRow } from "../transaction/InfoCard";

type Permissions = Core_TrustedDomain["data"]["permissions"];
type ReadAccess = Permissions["readAccess"];

interface Props {
  permissions: Permissions;
}

function AccessList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <span className="text-gray-300 italic text-xs">None</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function DomainPermissionsCard({ permissions }: Props) {
  const access = permissions.readAccess;
  const entries = Object.entries(access) as [keyof ReadAccess, string[]][];

  return (
    <InfoCard title="Permissions — Read Access" icon="🔐">
      {entries.map(([key, values]) => (
        <InfoRow
          key={key}
          label={key}
          value={<AccessList items={values} />}
        />
      ))}
    </InfoCard>
  );
}
