import type { MPTFlag } from "../MPTCreate.types";

interface Props {
  domainId?: string;
  assetScale: number;
  transferFee: number;
  selectedFlags: MPTFlag[];
}

export function ConfigSummary({
  domainId,
  assetScale,
  transferFee,
  selectedFlags,
}: Props) {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
      <h4 className="font-medium text-gray-700 mb-3 text-sm">
        Configuration Summary
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-gray-500 block text-xs">Domain ID</span>
          <span className="font-mono text-xs text-gray-800 truncate block">
            {domainId || "Not set"}
          </span>
        </div>
        <div>
          <span className="text-gray-500 block text-xs">Asset Scale</span>
          <span className="font-mono text-gray-800">{assetScale}</span>
        </div>
        <div>
          <span className="text-gray-500 block text-xs">Transfer Fee</span>
          <span className="font-mono text-gray-800">
            {(transferFee / 1000).toFixed(3)}%
          </span>
        </div>
        <div>
          <span className="text-gray-500 block text-xs">Flags</span>
          <span className="font-mono text-gray-800 text-xs">
            {selectedFlags.length > 0 ? selectedFlags.join(", ") : "None"}
          </span>
        </div>
      </div>
    </div>
  );
}
