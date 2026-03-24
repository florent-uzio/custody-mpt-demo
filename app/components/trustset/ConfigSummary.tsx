import type { TrustSetFlag } from "../TrustSet.types";

interface Props {
  domainId: string;
  selectedFlags: TrustSetFlag[];
  enableRippling: boolean;
}

export function ConfigSummary({
  domainId,
  selectedFlags,
  enableRippling,
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
          <span className="text-gray-600">Flags:</span>
          <span className="ml-2 text-gray-800">
            {selectedFlags.length > 0 ? selectedFlags.join(", ") : "None"}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Rippling:</span>
          <span className="ml-2 text-gray-800">
            {enableRippling ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>
    </div>
  );
}
