import { STATUS_STYLES, type IntentStatus } from "../intents.types";

export function StatusBadge({ status }: { status: IntentStatus }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.Expired;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}
