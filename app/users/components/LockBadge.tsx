import { LOCK_STYLES, type LockStatus } from "../users.types";

export function LockBadge({ status }: { status: LockStatus }) {
  const s = LOCK_STYLES[status] ?? LOCK_STYLES.Archived;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}
