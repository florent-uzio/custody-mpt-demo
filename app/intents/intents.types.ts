export type IntentStatus =
  | "Open"
  | "Approved"
  | "Executed"
  | "Failed"
  | "Expired"
  | "Rejected"
  | "Executing";

// Supported by the custody SDK intents.list API
export type IntentSortBy =
  | "id"
  | "state.status"
  | "details.expiryAt"
  | "details.metadata.createdAt"
  | "state.lastModifiedAt";

export type SortOrder = "ASC" | "DESC";

export interface IntentEntity {
  id: string;
  details: {
    payload: { type: string };
    expiryAt: string;
    author: { id: string; domainId: string };
    targetDomainId: string;
    metadata: {
      description?: string;
      createdAt: string;
      customProperties: Record<string, string>;
    };
  };
  state: {
    status: IntentStatus;
    lastModifiedAt?: string;
    error?: { code: string; message: string };
  };
}

export interface TrustedIntent {
  data: IntentEntity;
}

export interface IntentsCollection {
  items: TrustedIntent[];
  count: number;
  nextStartingAfter?: string;
}

export const STATUS_STYLES: Record<
  IntentStatus,
  { bg: string; text: string; dot: string }
> = {
  Open:      { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500" },
  Approved:  { bg: "bg-green-50",   text: "text-green-700",   dot: "bg-green-500" },
  Executed:  { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Executing: { bg: "bg-yellow-50",  text: "text-yellow-700",  dot: "bg-yellow-500" },
  Failed:    { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500" },
  Rejected:  { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-400" },
  Expired:   { bg: "bg-gray-100",   text: "text-gray-600",    dot: "bg-gray-400" },
};
