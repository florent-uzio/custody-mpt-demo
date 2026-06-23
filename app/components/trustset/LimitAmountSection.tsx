import { IssuerField } from "./IssuerField";
import { TrustLimitValueField } from "./TrustLimitValueField";

interface Props {
  currency: string;
  onCurrencyChange: (value: string) => void;
  issuer: string;
  onIssuerChange: (value: string) => void;
  value: string;
  onValueChange: (value: string) => void;
  scaleValue: boolean;
  onScaleChange: (value: boolean) => void;
}

export function LimitAmountSection({
  currency,
  onCurrencyChange,
  issuer,
  onIssuerChange,
  value,
  onValueChange,
  scaleValue,
  onScaleChange,
}: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
          2
        </span>
        Limit Amount
      </h3>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="trustset-currency"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Currency Code
          </label>
          <input
            type="text"
            id="trustset-currency"
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors"
            placeholder="USD, RLUSD, EUR..."
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Currencies longer than 3 characters will be hex-encoded automatically
          </p>
        </div>

        <IssuerField issuer={issuer} onIssuerChange={onIssuerChange} />

        <TrustLimitValueField
          value={value}
          onValueChange={onValueChange}
          scaleValue={scaleValue}
          onScaleChange={onScaleChange}
        />
      </div>
    </div>
  );
}
