import { PROCESSING_STYLES } from "../manifests.types";
import type { ManifestProcessingStatus } from "../manifests.types";

interface Props {
  status: ManifestProcessingStatus;
}

export function ProcessingBadge({ status }: Props) {
  const s = PROCESSING_STYLES[status] ?? {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}
