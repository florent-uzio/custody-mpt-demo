export type ManifestSortBy = "id" | "metadata.createdAt" | "metadata.lastModifiedAt";

export type ManifestContentType = "EIP-191" | "JWT" | "Unsafe";

export type ManifestProcessingStatus = "Pending" | "Preparing" | "Completed";

export type SortOrder = "ASC" | "DESC";

export const PROCESSING_STYLES: Record<
  ManifestProcessingStatus,
  { bg: string; text: string; dot: string }
> = {
  Pending:   { bg: "bg-yellow-50",  text: "text-yellow-700",  dot: "bg-yellow-500" },
  Preparing: { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500" },
  Completed: { bg: "bg-green-50",   text: "text-green-700",   dot: "bg-green-500" },
};
