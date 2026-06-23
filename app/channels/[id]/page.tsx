"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EDS_Channel } from "@florent-uzio/custody";
import { CopyButton } from "../../components/CopyButton";
import { JsonViewer } from "../../components/JsonViewer";
import { useDefaultDomain } from "../../contexts/DomainContext";
import {
  deleteChannel,
  getChannel,
  updateChannel,
} from "../../_actions/channels";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  ErrorBanner,
} from "../../components/layout";

const STATUS_CONFIG = {
  ACTIVE: {
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
    dot: "bg-emerald-400",
    border: "border-emerald-200",
  },
  DISABLED: {
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-700",
    dot: "bg-gray-400",
    border: "border-gray-200",
  },
} as const;

function formatDate(iso?: string) {
  if (!iso) return "—";
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

export default function ChannelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const channelId = params.id as string;
  const { defaultDomainId } = useDefaultDomain();

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState<"ACTIVE" | "DISABLED">("ACTIVE");
  const [editMaxRetries, setEditMaxRetries] = useState<string>("");
  const [editEventTypes, setEditEventTypes] = useState<string[]>([]);
  const [editEventTypeInput, setEditEventTypeInput] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(false);

  const {
    data: channel,
    isLoading,
    isError,
    error,
  } = useQuery<EDS_Channel>({
    queryKey: ["channel", defaultDomainId, channelId],
    queryFn: () => getChannel(defaultDomainId!, channelId),
    enabled: !!defaultDomainId && !!channelId,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!editMode && channel) {
      setEditName(channel.name ?? "");
      setEditStatus(channel.status === "DISABLED" ? "DISABLED" : "ACTIVE");
      setEditMaxRetries(
        channel.maxRetries !== undefined ? String(channel.maxRetries) : "",
      );
      setEditEventTypes(channel.supportedEventTypes ?? []);
    }
  }, [channel, editMode]);

  const updateMutation = useMutation({
    mutationFn: () => {
      const maxRetriesNum = editMaxRetries.trim()
        ? Number(editMaxRetries)
        : undefined;
      if (
        maxRetriesNum !== undefined &&
        (Number.isNaN(maxRetriesNum) || maxRetriesNum < 0)
      ) {
        throw new Error("maxRetries must be a non-negative integer");
      }
      return updateChannel(defaultDomainId!, channelId, {
        name: editName.trim(),
        status: editStatus === "ACTIVE" ? "active" : "disabled",
        maxRetries: maxRetriesNum,
        supportedEventTypes: editEventTypes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["channel", defaultDomainId, channelId],
      });
      queryClient.invalidateQueries({
        queryKey: ["channels", defaultDomainId],
      });
      setEditMode(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteChannel(defaultDomainId!, channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["channels", defaultDomainId],
      });
      router.push("/channels");
    },
  });

  const status = channel?.status;
  const cfg =
    status === "DISABLED" ? STATUS_CONFIG.DISABLED : STATUS_CONFIG.ACTIVE;

  const addEditEventType = () => {
    const t = editEventTypeInput.trim();
    if (!t || editEventTypes.includes(t)) {
      setEditEventTypeInput("");
      return;
    }
    setEditEventTypes([...editEventTypes, t]);
    setEditEventTypeInput("");
  };

  const cancelEdit = () => {
    if (channel) {
      setEditName(channel.name ?? "");
      setEditStatus(channel.status === "DISABLED" ? "DISABLED" : "ACTIVE");
      setEditMaxRetries(
        channel.maxRetries !== undefined ? String(channel.maxRetries) : "",
      );
      setEditEventTypes(channel.supportedEventTypes ?? []);
    }
    updateMutation.reset();
    setEditMode(false);
  };

  const shortId = channelId.length > 12 ? `${channelId.slice(0, 8)}…` : channelId;

  return (
    <Page>
      <PageHeader
        title="Channel"
        breadcrumbs={[
          { label: "Channels", href: "/channels" },
          { label: shortId },
        ]}
      />
      <PageContainer width="detail">
        <PageHero
          theme="sky"
          icon="📡"
          title={channel?.name ?? channelId}
          description="Webhook channel receiving custody events for this domain."
          badge={status ? { label: status } : undefined}
        />

        {!defaultDomainId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-yellow-700">
                Set a <strong>Default Domain ID</strong> in the sidebar to load
                this channel.
              </p>
            </div>
          )}

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
              <p className="text-gray-500 text-sm">Loading channel…</p>
            </div>
          )}

          {isError && <ErrorBanner error={error} />}

          {channel && !isLoading && (
            <div className="space-y-5">
              <div className="flex items-center justify-end gap-2">
                {!editMode && (
                  <>
                    <button
                      onClick={() => setEditMode(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      <svg
                        className="w-4 h-4"
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
                  </>
                )}
              </div>

              {editMode ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Edit channel
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) =>
                          setEditStatus(e.target.value as "ACTIVE" | "DISABLED")
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="DISABLED">Disabled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Max retries
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={editMaxRetries}
                        onChange={(e) => setEditMaxRetries(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        placeholder="(default)"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Supported event types
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editEventTypeInput}
                        onChange={(e) => setEditEventTypeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addEditEventType();
                          }
                        }}
                        className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors font-mono"
                        placeholder="e.g. transaction.completed"
                      />
                      <button
                        type="button"
                        onClick={addEditEventType}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors flex-shrink-0"
                      >
                        Add
                      </button>
                    </div>
                    {editEventTypes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {editEventTypes.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100"
                          >
                            <span className="font-mono">{t}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setEditEventTypes(
                                  editEventTypes.filter((x) => x !== t),
                                )
                              }
                              className="hover:text-violet-900"
                              aria-label={`Remove ${t}`}
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {updateMutation.isError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                      {updateMutation.error instanceof Error
                        ? updateMutation.error.message
                        : "Failed to update channel"}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={updateMutation.isPending}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => updateMutation.mutate()}
                      disabled={updateMutation.isPending}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {updateMutation.isPending ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <InfoCard title="Configuration" icon="⚙️">
                    <InfoRow
                      label="Name"
                      value={
                        channel.name || (
                          <span className="text-gray-300 italic">unnamed</span>
                        )
                      }
                    />
                    <InfoRow
                      label="Type"
                      value={
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {channel.type ?? "—"}
                        </span>
                      }
                    />
                    <InfoRow
                      label="Status"
                      value={
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                          />
                          {channel.status ?? "—"}
                        </span>
                      }
                    />
                    <InfoRow
                      label="URL"
                      value={
                        channel.url ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs">
                              {channel.url}
                            </span>
                            <CopyButton text={channel.url} />
                          </div>
                        ) : (
                          <span className="text-gray-300 italic">None</span>
                        )
                      }
                    />
                    <InfoRow
                      label="Max retries"
                      value={
                        channel.maxRetries !== undefined
                          ? channel.maxRetries
                          : "—"
                      }
                    />
                    <InfoRow
                      label="Error rate"
                      value={
                        channel.errorRate !== undefined &&
                        channel.errorRate !== null
                          ? `${(channel.errorRate * 100).toFixed(2)}%`
                          : "—"
                      }
                    />
                  </InfoCard>

                  <InfoCard title="Event types" icon="📡">
                    {channel.supportedEventTypes &&
                    channel.supportedEventTypes.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {channel.supportedEventTypes.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100 font-mono"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-300 italic text-sm">None</span>
                    )}
                  </InfoCard>

                  <InfoCard title="Audit" icon="🪪">
                    <InfoRow
                      label="Created by"
                      value={
                        channel.createdBy ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs">
                              {channel.createdBy}
                            </span>
                            <CopyButton text={channel.createdBy} />
                          </div>
                        ) : (
                          "—"
                        )
                      }
                    />
                    <InfoRow
                      label="Created at"
                      value={formatDate(channel.createdAt)}
                    />
                    <InfoRow
                      label="Last updated by"
                      value={
                        channel.lastUpdatedBy ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs">
                              {channel.lastUpdatedBy}
                            </span>
                            <CopyButton text={channel.lastUpdatedBy} />
                          </div>
                        ) : (
                          "—"
                        )
                      }
                    />
                    <InfoRow
                      label="Last updated at"
                      value={formatDate(channel.lastUpdatedAt)}
                    />
                  </InfoCard>

                  <InfoCard title="Identity" icon="🔑">
                    <InfoRow
                      label="Channel ID"
                      value={
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs break-all">
                            {channel.id}
                          </span>
                          {channel.id && <CopyButton text={channel.id} />}
                        </div>
                      }
                    />
                    <InfoRow
                      label="Domain ID"
                      value={
                        channel.domainId ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs break-all">
                              {channel.domainId}
                            </span>
                            <CopyButton text={channel.domainId} />
                          </div>
                        ) : (
                          "—"
                        )
                      }
                    />
                  </InfoCard>
                </div>
              )}

              <JsonViewer data={channel} title="Full channel (raw)" />

              {!editMode && (
                <div className="bg-white rounded-xl border border-red-200 shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🗑️</span>
                    <h3 className="text-sm font-bold text-red-700 uppercase tracking-wide">
                      Danger zone
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Deleting a channel is permanent. The webhook will stop
                    receiving events immediately.
                  </p>
                  <label className="flex items-center gap-2 mb-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={confirmDelete}
                      onChange={(e) => setConfirmDelete(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    I understand this action cannot be undone.
                  </label>
                  {deleteMutation.isError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 mb-3">
                      {deleteMutation.error instanceof Error
                        ? deleteMutation.error.message
                        : "Failed to delete channel"}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate()}
                    disabled={!confirmDelete || deleteMutation.isPending}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {deleteMutation.isPending ? "Deleting…" : "Delete channel"}
                  </button>
                </div>
              )}
            </div>
          )}
      </PageContainer>
    </Page>
  );
}
