import { Core_TrustedDomain } from "custody";

type Domain = Core_TrustedDomain["data"];
type LockStatus = Domain["lock"];

export type LockStatusConfig = {
  headerBg: string;
  badgeBg: string;
  badgeText: string;
  dot: string;
  border: string;
};

const LOCK_STATUS_CONFIG: Record<LockStatus, LockStatusConfig> = {
  Unlocked: {
    headerBg: "from-emerald-500 to-teal-500",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
    dot: "bg-emerald-400",
    border: "border-emerald-200",
  },
  Locked: {
    headerBg: "from-red-500 to-rose-500",
    badgeBg: "bg-red-100",
    badgeText: "text-red-800",
    dot: "bg-red-400",
    border: "border-red-200",
  },
  Archived: {
    headerBg: "from-gray-400 to-gray-500",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-700",
    dot: "bg-gray-400",
    border: "border-gray-200",
  },
};

const FALLBACK_CONFIG: LockStatusConfig = {
  headerBg: "from-gray-400 to-gray-500",
  badgeBg: "bg-gray-100",
  badgeText: "text-gray-700",
  dot: "bg-gray-400",
  border: "border-gray-200",
};

export function getLockStatusConfig(
  status: LockStatus | undefined,
): LockStatusConfig {
  return status
    ? (LOCK_STATUS_CONFIG[status] ?? FALLBACK_CONFIG)
    : FALLBACK_CONFIG;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
