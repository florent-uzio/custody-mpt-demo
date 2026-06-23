"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CopyButton } from "../../components/CopyButton";
import { JsonViewer } from "../../components/JsonViewer";
import { LockBadge } from "../components/LockBadge";
import { LOCK_STYLES, type TrustedUser } from "../users.types";
import { getUser } from "../../_actions/users";
import { UserEditForm } from "./UserEditForm";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  ErrorBanner,
} from "../../components/layout";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider sm:w-36 flex-shrink-0 mt-0.5">
        {label}
      </span>
      <span className="text-sm text-gray-800 break-all flex-1">{value}</span>
    </div>
  );
}

function InfoCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{icon}</span>
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function UserDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params.id as string;
  const domainId = searchParams.get("domainId") ?? "";
  const [isEditing, setIsEditing] = useState(false);

  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ["user", userId, domainId],
    queryFn: () => getUser(domainId, userId) as Promise<TrustedUser>,
    enabled: !!userId && !!domainId,
    staleTime: 60_000,
  });

  const lock = user?.data.lock;
  const cfg = lock ? (LOCK_STYLES[lock] ?? LOCK_STYLES.Archived) : LOCK_STYLES.Archived;

  const editAction = user && !isEditing ? (
    <button
      onClick={() => setIsEditing(true)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
      Edit
    </button>
  ) : null;

  return (
    <Page>
      <PageHeader
        title="User"
        breadcrumbs={[
          { label: "Users", href: "/users" },
          { label: user?.data.alias ?? userId },
        ]}
        actions={editAction}
      />
      <PageContainer width="detail">
        <PageHero
          theme="violet"
          icon="👥"
          title={user?.data.alias ?? userId}
          description={userId}
          badge={lock ? { label: lock } : undefined}
        />

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <svg
              className="animate-spin w-8 h-8 text-blue-500"
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
            <p className="text-gray-500 text-sm">Loading user…</p>
          </div>
        )}

        {isError && <ErrorBanner error={error} />}

        {user && !isLoading && isEditing && (
          <UserEditForm
            user={user}
            onCancel={() => setIsEditing(false)}
          />
        )}

        {user && !isLoading && !isEditing && (
          <div className="space-y-5">
            {/* Summary bar */}
            <div className={`bg-white rounded-xl border ${cfg.border} shadow-sm p-5`}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                    Alias
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {user.data.alias}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                    Lock
                  </p>
                  <LockBadge status={user.data.lock} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                    Created
                  </p>
                  <p className="text-sm text-gray-700">
                    {formatDate(user.data.metadata.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
                    Last Modified
                  </p>
                  <p className="text-sm text-gray-700">
                    {formatDate(user.data.metadata.lastModifiedAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Identity */}
              <InfoCard title="Identity" icon="🪪">
                <InfoRow
                  label="User ID"
                  value={
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs">
                        {user.data.id}
                      </span>
                      <CopyButton text={user.data.id} />
                    </div>
                  }
                />
                <InfoRow label="Alias" value={user.data.alias} />
                <InfoRow
                  label="Domain ID"
                  value={
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs">
                        {user.data.domainId}
                      </span>
                      <CopyButton text={user.data.domainId} />
                    </div>
                  }
                />
                <InfoRow
                  label="Lock"
                  value={<LockBadge status={user.data.lock} />}
                />
                {user.data.metadata.description && (
                  <InfoRow
                    label="Description"
                    value={user.data.metadata.description}
                  />
                )}
              </InfoCard>

              {/* Roles */}
              <InfoCard title="Roles & Access" icon="🔐">
                <InfoRow
                  label="Roles"
                  value={
                    user.data.roles.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {user.data.roles.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-300 italic">No roles</span>
                    )
                  }
                />
                <InfoRow
                  label="Public Key"
                  value={
                    <div className="flex items-start gap-1.5">
                      <span className="font-mono text-xs break-all text-gray-600">
                        {user.data.publicKey}
                      </span>
                      <CopyButton text={user.data.publicKey} />
                    </div>
                  }
                />
                {user.data.loginIds && user.data.loginIds.length > 0 && (
                  <InfoRow
                    label="Login IDs"
                    value={
                      <div className="space-y-1">
                        {user.data.loginIds.map((login, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">
                              {login.providerId}
                            </span>
                            <span className="font-mono text-gray-700">
                              {login.id}
                            </span>
                          </div>
                        ))}
                      </div>
                    }
                  />
                )}
              </InfoCard>

              {/* Metadata */}
              <InfoCard title="Metadata" icon="🏷️">
                <InfoRow
                  label="Created At"
                  value={formatDate(user.data.metadata.createdAt)}
                />
                <InfoRow
                  label="Last Modified"
                  value={formatDate(user.data.metadata.lastModifiedAt)}
                />
                <InfoRow
                  label="Revision"
                  value={
                    <span className="font-mono text-xs">
                      {user.data.metadata.revision}
                    </span>
                  }
                />
                {Object.keys(user.data.metadata.customProperties ?? {})
                  .length > 0 && (
                  <InfoRow
                    label="Custom Props"
                    value={
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(
                          user.data.metadata.customProperties,
                        ).map(([k, v]) => (
                          <span
                            key={k}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-600"
                          >
                            <span className="text-gray-400">{k}:</span>
                            {v}
                          </span>
                        ))}
                      </div>
                    }
                  />
                )}
              </InfoCard>
            </div>

            <JsonViewer data={user} title="Full User (Raw)" />
          </div>
        )}
      </PageContainer>
    </Page>
  );
}
