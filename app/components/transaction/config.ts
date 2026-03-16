export type ProcessingStatus =
  | "Broadcasting"
  | "Completed"
  | "Failed"
  | "Interrupted"
  | "Pending"
  | "Prepared"
  | "Preparing"
  | "Reserved";

export type StatusConfig = {
  headerBg: string;
  badgeBg: string;
  badgeText: string;
  dot: string;
  border: string;
};

export const FALLBACK_CONFIG: StatusConfig = {
  headerBg: "from-gray-400 to-gray-500",
  badgeBg: "bg-gray-100",
  badgeText: "text-gray-700",
  dot: "bg-gray-400",
  border: "border-gray-200",
};

export const STATUS_CONFIG: Record<ProcessingStatus, StatusConfig> = {
  Completed: {
    headerBg: "from-emerald-500 to-teal-500",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
    dot: "bg-emerald-400",
    border: "border-emerald-200",
  },
  Failed: {
    headerBg: "from-red-500 to-rose-500",
    badgeBg: "bg-red-100",
    badgeText: "text-red-800",
    dot: "bg-red-400",
    border: "border-red-200",
  },
  Interrupted: {
    headerBg: "from-orange-500 to-red-400",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-800",
    dot: "bg-orange-400",
    border: "border-orange-200",
  },
  Broadcasting: {
    headerBg: "from-blue-500 to-blue-600",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-800",
    dot: "bg-blue-400",
    border: "border-blue-200",
  },
  Pending: {
    headerBg: "from-yellow-400 to-orange-400",
    badgeBg: "bg-yellow-100",
    badgeText: "text-yellow-800",
    dot: "bg-yellow-400",
    border: "border-yellow-200",
  },
  Prepared: {
    headerBg: "from-indigo-400 to-indigo-600",
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-800",
    dot: "bg-indigo-400",
    border: "border-indigo-200",
  },
  Preparing: {
    headerBg: "from-violet-400 to-purple-500",
    badgeBg: "bg-violet-100",
    badgeText: "text-violet-800",
    dot: "bg-violet-400",
    border: "border-violet-200",
  },
  Reserved: {
    headerBg: "from-gray-400 to-gray-500",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-700",
    dot: "bg-gray-400",
    border: "border-gray-200",
  },
};

export const LEDGER_STATUS_STYLES: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  Confirmed: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-400" },
  Detected: { bg: "bg-blue-100", text: "text-blue-800", dot: "bg-blue-400" },
  Expired: { bg: "bg-orange-100", text: "text-orange-800", dot: "bg-orange-400" },
  Replaced: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400" },
};

export function getStatusConfig(
  status: ProcessingStatus | undefined,
): StatusConfig {
  return status ? (STATUS_CONFIG[status] ?? FALLBACK_CONFIG) : FALLBACK_CONFIG;
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
