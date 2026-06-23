import { getTheme, type ThemeName } from "./pageTheme";

interface SubmitButtonProps {
  theme: ThemeName;
  pending: boolean;
  disabled?: boolean;
  /** Label shown while pending (defaults to "Submitting…"). */
  pendingLabel?: string;
  children: React.ReactNode;
}

/** Full-width gradient submit button with an inline spinner while pending. */
export function SubmitButton({
  theme,
  pending,
  disabled,
  pendingLabel = "Submitting…",
  children,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`w-full px-6 py-4 ${getTheme(theme).button} text-white rounded-xl font-semibold disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl`}
    >
      {pending ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
