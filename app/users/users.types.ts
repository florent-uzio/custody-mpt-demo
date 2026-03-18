export type LockStatus = "Unlocked" | "Locked" | "Archived";

export type UserSortBy =
  | "id"
  | "alias"
  | "lock"
  | "metadata.createdAt"
  | "metadata.lastModifiedAt";

export type SortOrder = "ASC" | "DESC";

export interface UserMetadata {
  description?: string;
  revision: number;
  createdAt: string;
  lastModifiedAt: string;
  customProperties: Record<string, string>;
}

export interface UserEntity {
  id: string;
  domainId: string;
  alias: string;
  publicKey: string;
  roles: string[];
  lock: LockStatus;
  metadata: UserMetadata;
  loginIds?: { id: string; providerId: string }[];
}

export interface TrustedUser {
  data: UserEntity;
  signature: string;
  signingKey: string;
}

export interface UsersCollection {
  items: TrustedUser[];
  count: number;
  nextStartingAfter?: string;
}

export const LOCK_STYLES: Record<
  LockStatus,
  { bg: string; text: string; dot: string; headerBg: string; border: string }
> = {
  Unlocked: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    headerBg: "from-emerald-500 to-teal-500",
    border: "border-emerald-200",
  },
  Locked: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    headerBg: "from-amber-500 to-orange-500",
    border: "border-amber-200",
  },
  Archived: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
    headerBg: "from-gray-400 to-gray-500",
    border: "border-gray-200",
  },
};
