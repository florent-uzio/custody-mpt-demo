interface Props {
  enableRippling: boolean;
  onEnableRipplingChange: (value: boolean) => void;
}

export function OptionsSection({
  enableRippling,
  onEnableRipplingChange,
}: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
          4
        </span>
        Options
      </h3>

      <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all">
        <input
          type="checkbox"
          checked={enableRippling}
          onChange={(e) => onEnableRipplingChange(e.target.checked)}
          className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
        />
        <div className="flex-1">
          <span className="font-medium text-gray-900 text-sm">
            Enable Rippling
          </span>
          <p className="text-xs text-gray-500 mt-1">
            Allow payments to ripple through this trustline. When enabled, the
            account acts as an intermediary for cross-currency payments.
          </p>
        </div>
      </label>
    </div>
  );
}
