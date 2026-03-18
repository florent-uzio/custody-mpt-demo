import { Core_TransactionDetails } from "custody";
import { InfoCard } from "./InfoCard";
import { CopyButton } from "../CopyButton";

type RelatedAccount = Core_TransactionDetails["relatedAccounts"][number];

export function RelatedAccountsCard({
  accounts,
}: {
  accounts: RelatedAccount[];
}) {
  return (
    <InfoCard title="Related Accounts" icon="👥">
      {accounts.map((acc, idx) => (
        <div key={idx} className="py-3 border-b border-gray-50 last:border-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-24 flex-shrink-0">
              Account ID
            </span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs text-gray-700">{acc.id}</span>
              <CopyButton text={acc.id} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-24 flex-shrink-0">
              Domain
            </span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs text-gray-500">{acc.domainId}</span>
              <CopyButton text={acc.domainId} />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-24 flex-shrink-0">
              Role
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                acc.sender
                  ? "bg-blue-100 text-blue-700"
                  : "bg-purple-100 text-purple-700"
              }`}
            >
              {acc.sender ? "Sender" : "Receiver"}
            </span>
          </div>
        </div>
      ))}
    </InfoCard>
  );
}
