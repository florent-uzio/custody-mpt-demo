import type { AccountSetFlag } from "../AccountSet.types";

interface Props {
  domainId: string;
  setFlag: AccountSetFlag | "";
  clearFlag: AccountSetFlag | "";
  transferRate: string;
}

export function ConfigSummary({
  domainId,
  setFlag,
  clearFlag,
  transferRate,
}: Props) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 text-sm">
      <h3 className="font-medium text-gray-700 mb-2">Configuration Summary:</h3>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="text-gray-600">Domain ID:</span>
          <span className="ml-2 font-mono text-xs text-gray-800">
            {domainId}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Fee Strategy:</span>
          <span className="ml-2 text-gray-800">Low Priority</span>
        </div>
        <div>
          <span className="text-gray-600">Set Flag:</span>
          <span className="ml-2 text-gray-800">{setFlag || "None"}</span>
        </div>
        <div>
          <span className="text-gray-600">Clear Flag:</span>
          <span className="ml-2 text-gray-800">{clearFlag || "None"}</span>
        </div>
        <div>
          <span className="text-gray-600">Transfer Rate:</span>
          <span className="ml-2 text-gray-800">
            {transferRate.trim() === "" ? "Unchanged" : transferRate}
          </span>
        </div>
      </div>
    </div>
  );
}
