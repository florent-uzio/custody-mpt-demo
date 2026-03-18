import { Core_TrustedDomain } from "custody";
import { CopyButton } from "../CopyButton";
import { useDefaultDomain } from "../../contexts/DomainContext";

export function DomainCard({ domain }: { domain: Core_TrustedDomain }) {
  const { setDefaultDomainId } = useDefaultDomain();
  const { data } = domain;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          Domain ID
        </p>
        <div className="flex items-center gap-1">
          <p className="text-sm font-mono text-gray-900 break-all flex-1">
            {data.id}
          </p>
          <CopyButton text={data.id} />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          Alias
        </p>
        {data.alias ? (
          <p className="text-base font-semibold text-gray-900">{data.alias}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">No alias set</p>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
          Lock Status
        </p>
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            data.lock === "Unlocked"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {data.lock}
        </span>
      </div>

      {data.parentId && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Parent ID
          </p>
          <div className="flex items-center gap-1">
            <p className="text-xs font-mono text-gray-500 break-all flex-1">
              {data.parentId}
            </p>
            <CopyButton text={data.parentId} />
          </div>
        </div>
      )}

      <div className="pt-2 border-t border-gray-100">
        <button
          onClick={() => setDefaultDomainId(data.id)}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          Set as default
        </button>
      </div>
    </div>
  );
}
