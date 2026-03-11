interface Props {
  assetScale: number;
  onAssetScaleChange: (v: number) => void;
  transferFee: number;
  onTransferFeeChange: (v: number) => void;
  maximumAmount: string;
  onMaximumAmountChange: (v: string) => void;
}

export function TokenPropertiesSection({
  assetScale,
  onAssetScaleChange,
  transferFee,
  onTransferFeeChange,
  maximumAmount,
  onMaximumAmountChange,
}: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
          2
        </span>
        Token Properties
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="assetScale"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Asset Scale
          </label>
          <input
            type="number"
            id="assetScale"
            value={assetScale}
            onChange={(e) =>
              onAssetScaleChange(
                Math.max(0, Math.min(255, parseInt(e.target.value) || 0)),
              )
            }
            min={0}
            max={255}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors"
          />
          <p className="mt-2 text-xs text-gray-500">
            Decimal places (0-255). E.g., 2 means 1 unit = 0.01 standard units
          </p>
        </div>

        <div>
          <label
            htmlFor="transferFee"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Transfer Fee
          </label>
          <div className="relative">
            <input
              type="number"
              id="transferFee"
              value={transferFee}
              onChange={(e) =>
                onTransferFeeChange(
                  Math.max(0, Math.min(50000, parseInt(e.target.value) || 0)),
                )
              }
              min={0}
              max={50000}
              className="w-full px-4 py-2.5 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              = {(transferFee / 1000).toFixed(3)}%
            </span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Fee for secondary sales (0-50000 = 0.000%-50.000%). Requires
            tfMPTCanTransfer flag.
          </p>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="maximumAmount"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Maximum Amount (Optional)
          </label>
          <input
            type="text"
            id="maximumAmount"
            value={maximumAmount}
            onChange={(e) => onMaximumAmountChange(e.target.value)}
            placeholder="9223372036854775807"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-colors font-mono"
          />
          <p className="mt-2 text-xs text-gray-500">
            Maximum tokens that can ever be issued. Leave empty for default max
            (2^63-1)
          </p>
        </div>
      </div>
    </div>
  );
}
