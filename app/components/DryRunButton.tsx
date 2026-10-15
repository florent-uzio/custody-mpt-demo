interface DryRunButtonProps {
  pending: boolean;
  disabled?: boolean;
  onClick: () => void;
  /** Tailwind classes for the themed border/text/hover (complete literals). */
  className: string;
}

/** Secondary outline button that triggers a dry run without submitting. */
export function DryRunButton({
  pending,
  disabled,
  onClick,
  className,
}: DryRunButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending || disabled}
      className={`w-full px-6 py-3 rounded-xl border-2 font-semibold bg-white disabled:border-gray-300 disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {pending ? "Running dry run..." : "🧪 Dry Run (nothing is submitted)"}
    </button>
  );
}
