"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDefaultDomain } from "../../contexts/DomainContext";
import { useSidebarContext } from "../../contexts/SidebarContext";
import { createChannel } from "../../_actions/channels";
import { KNOWN_EVENT_TYPES } from "../event-types";

const URL_PATTERN = /^https?:\/\/.+/i;
const CUSTOM_OPTION = "__custom__";

export default function NewChannelPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { defaultDomainId } = useDefaultDomain();
  const { sidebarOpen, setSidebarOpen } = useSidebarContext();

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
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 shadow-md flex-shrink-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-start gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mt-0.5 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {sidebarOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href="/channels"
                  className="text-white/60 hover:text-white text-xs font-medium transition-colors"
                >
                  Channels
                </Link>
                <span className="text-white/40 text-xs">/</span>
                <span className="text-white/80 text-xs font-medium">New</span>
              </div>
              <h1 className="text-white text-lg font-semibold">
                Create channel
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!defaultDomainId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3 mb-6">
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
                Set a <strong>Default Domain ID</strong> in the sidebar before
                creating a channel.
              </p>
            </div>
          )}

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

            {mutation.isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : "Failed to create channel"}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <Link
                href="/channels"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitDisabled}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                {mutation.isPending ? "Creating…" : "Create channel"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
