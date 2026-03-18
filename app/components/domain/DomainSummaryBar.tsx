import { Core_TrustedDomain } from "custody";
import { LockStatusConfig, formatDate } from "./config";

type Domain = Core_TrustedDomain["data"];

interface Props {
  domain: Domain;
  cfg: LockStatusConfig;
}

export function DomainSummaryBar({ domain, cfg }: Props) {
  return (
    <div className={`bg-white rounded-xl border ${cfg.border} shadow-sm p-5`}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
            Lock Status
          </p>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {domain.lock}
          </span>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
            Alias
          </p>
          <p className="text-sm text-gray-700 font-semibold truncate">
            {domain.alias || <span className="text-gray-300 italic font-normal">No alias</span>}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
            Revision
          </p>
          <p className="text-sm text-gray-700 font-mono">{domain.metadata.revision}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
            Created At
          </p>
          <p className="text-sm text-gray-700">{formatDate(domain.metadata.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}
