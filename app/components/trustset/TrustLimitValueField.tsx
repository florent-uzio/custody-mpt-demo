import {
  CUSTODY_VALUE_SCALE_EXPONENT,
  isDecimalString,
  scaleByPowerOfTen,
} from "../../lib/token-amount";

interface Props {
  value: string;
  onValueChange: (value: string) => void;
  scaleValue: boolean;
  onScaleChange: (value: boolean) => void;
}

export function TrustLimitValueField({
  value,
  onValueChange,
  scaleValue,
  onScaleChange,
}: Props) {
  const showPreview = scaleValue && isDecimalString(value);
  const preview = showPreview
    ? scaleByPowerOfTen(value, CUSTODY_VALUE_SCALE_EXPONENT)
    : null;

  return (
    <div>
      <label
        htmlFor="trustset-value"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Trust Limit Value
      </label>
      <input
        type="text"
        id="trustset-value"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
        placeholder="100"
        required
      />
      <p className="mt-1 text-xs text-gray-500">
        Maximum amount of this currency the account is willing to hold (0 or
        positive)
      </p>

      <label className="mt-3 flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={scaleValue}
          onChange={(e) => onScaleChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
        <span className="text-sm text-gray-700">
          Auto-scale for Ripple Custody (× 10⁸¹)
        </span>
      </label>
      <p className="mt-1 ml-6 text-xs text-gray-500">
        Ripple Custody stores token amounts scaled by 10⁻⁸¹, so a raw value of
        100 would create a trustline for a vanishingly small amount. Leave this
        on to enter a human-readable value — it is multiplied by 10⁸¹ before
        submission. See{" "}
        <a
          href="https://xrpl.org/docs/concepts/tokens/fungible-tokens/trust-line-tokens#properties"
          target="_blank"
          rel="noreferrer"
          className="text-emerald-600 hover:text-emerald-700 underline"
        >
          XRPL token precision
        </a>{" "}
        (values down to 1.0 × 10⁻⁸¹).
      </p>

      {preview && (
        <div className="mt-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
          <p className="text-xs font-medium text-emerald-800">
            Will be submitted as:
          </p>
          <p className="mt-0.5 text-xs font-mono text-emerald-900 break-all">
            {preview}
          </p>
        </div>
      )}
    </div>
  );
}
