"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDefaultDomain } from "../../contexts/DomainContext";
import { createChannel } from "../../_actions/channels";
import { KNOWN_EVENT_TYPES } from "../event-types";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  SubmitButton,
  ErrorBanner,
  DomainWarning,
} from "../../components/layout";

const URL_PATTERN = /^https?:\/\/.+/i;
const CUSTOM_OPTION = "__custom__";

export default function NewChannelPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { defaultDomainId } = useDefaultDomain();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [maxRetries, setMaxRetries] = useState("");
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [eventTypeSelection, setEventTypeSelection] = useState("");
  const [customEventType, setCustomEventType] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const isCustomSelection = eventTypeSelection === CUSTOM_OPTION;

  const mutation = useMutation({
    mutationFn: () => {
      const maxRetriesNum = maxRetries.trim() ? Number(maxRetries) : undefined;
      return createChannel(defaultDomainId!, {
        name: name.trim(),
        url: url.trim(),
        supportedEventTypes: eventTypes,
        maxRetries: maxRetriesNum,
      });
    },
    onSuccess: (channel) => {
      queryClient.invalidateQueries({
        queryKey: ["channels", defaultDomainId],
      });
      if (channel.id) {
        router.push(`/channels/${channel.id}`);
      } else {
        router.push("/channels");
      }
    },
  });

  const addEventType = () => {
    const t = isCustomSelection
      ? customEventType.trim()
      : eventTypeSelection.trim();
    if (!t) return;
    if (!eventTypes.includes(t)) {
      setEventTypes([...eventTypes, t]);
    }
    setEventTypeSelection("");
    setCustomEventType("");
  };

  const removeEventType = (t: string) => {
    setEventTypes(eventTypes.filter((x) => x !== t));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!name.trim()) {
      setValidationError("Name is required.");
      return;
    }
    if (!url.trim()) {
      setValidationError("URL is required.");
      return;
    }
    if (!URL_PATTERN.test(url.trim())) {
      setValidationError("URL must start with http:// or https://.");
      return;
    }
    if (eventTypes.length === 0) {
      setValidationError("Add at least one supported event type.");
      return;
    }
    if (maxRetries.trim()) {
      const n = Number(maxRetries);
      if (!Number.isInteger(n) || n < 0) {
        setValidationError("Max retries must be a non-negative integer.");
        return;
      }
    }
    mutation.mutate();
  };

  const submitDisabled = !defaultDomainId || mutation.isPending;

  return (
    <Page>
      <PageHeader
        title="Create Channel"
        subtitle="Channels · Create"
        breadcrumbs={[
          { label: "Channels", href: "/channels" },
          { label: "Create" },
        ]}
      />
      <PageContainer width="form">
        <PageHero
          theme="sky"
          icon="📡"
          title="Create Channel"
          description="Register a webhook endpoint to receive event notifications. Channels deliver real-time updates for the event types you select."
          badge={{ label: "Channel", note: "Webhook notification channel" }}
        />

        {!defaultDomainId && <DomainWarning action="creating a channel" />}

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="My webhook channel"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Webhook URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors font-mono"
                placeholder="https://example.com/hook"
                required
              />
              <p className="mt-1 text-xs text-gray-400">
                Must start with http:// or https://
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Max retries
              </label>
              <input
                type="number"
                min={0}
                value={maxRetries}
                onChange={(e) => setMaxRetries(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="(default)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Supported event types <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={eventTypeSelection}
                  onChange={(e) => {
                    setEventTypeSelection(e.target.value);
                    if (e.target.value !== CUSTOM_OPTION) {
                      setCustomEventType("");
                    }
                  }}
                  className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                >
                  <option value="">Select an event type…</option>
                  <optgroup label="Known event types">
                    {KNOWN_EVENT_TYPES.map((t) => (
                      <option
                        key={t}
                        value={t}
                        disabled={eventTypes.includes(t)}
                      >
                        {t}
                        {eventTypes.includes(t) ? " (added)" : ""}
                      </option>
                    ))}
                  </optgroup>
                  <option value={CUSTOM_OPTION}>Custom…</option>
                </select>
                <button
                  type="button"
                  onClick={addEventType}
                  disabled={
                    !eventTypeSelection ||
                    (isCustomSelection && !customEventType.trim())
                  }
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 text-sm font-medium rounded-lg transition-colors flex-shrink-0"
                >
                  Add
                </button>
              </div>
              {isCustomSelection && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={customEventType}
                    onChange={(e) => setCustomEventType(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addEventType();
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors font-mono"
                    placeholder="Enter custom event type"
                    autoFocus
                  />
                </div>
              )}
              {eventTypes.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {eventTypes.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100"
                    >
                      <span className="font-mono">{t}</span>
                      <button
                        type="button"
                        onClick={() => removeEventType(t)}
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

            {validationError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {validationError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <Link
                href="/channels"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </Link>
            </div>

            <SubmitButton
              theme="sky"
              pending={mutation.isPending}
              disabled={submitDisabled}
              pendingLabel="Creating…"
            >
              Create channel
            </SubmitButton>
          </form>

          <ErrorBanner error={mutation.error} />
      </PageContainer>
    </Page>
  );
}
