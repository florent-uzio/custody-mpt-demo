"use client";

import { useState, useEffect } from "react";
import { useConfig, useConfigMutation } from "../hooks/useConfig";
import type { ConfigKey } from "../lib/config";

const FIELDS: {
  key: ConfigKey;
  label: string;
  required: boolean;
  sensitive: boolean;
  description: string;
}[] = [
  {
    key: "AUTH_URL",
    label: "Auth URL",
    required: true,
    sensitive: false,
    description: "Authentication endpoint for the Custody SDK",
  },
  {
    key: "API_URL",
    label: "API URL",
    required: true,
    sensitive: false,
    description: "API base URL for the Custody SDK",
  },
  {
    key: "PRIVATE_KEY",
    label: "Private Key",
    required: false,
    sensitive: true,
    description: "EC/EdDSA private key in PEM format",
  },
  {
    key: "PUBLIC_KEY",
    label: "Public Key",
    required: false,
    sensitive: true,
    description: "Public key in DER format",
  },
];

function SourceBadge({ source }: { source: "override" | "env" | "empty" }) {
  if (source === "override") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded bg-blue-100 text-blue-700 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        Override
      </span>
    );
  }
  if (source === "env") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        From .env
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded bg-gray-100 text-gray-500 border border-gray-200">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Not set
    </span>
  );
}

export function ConfigTab() {
  const { data: config, isLoading, error } = useConfig();
  const mutation = useConfigMutation();

  const [formValues, setFormValues] = useState<Record<ConfigKey, string>>({
    AUTH_URL: "",
    API_URL: "",
    PRIVATE_KEY: "",
    PUBLIC_KEY: "",
  });
  const [visibleFields, setVisibleFields] = useState<Set<ConfigKey>>(new Set());
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (config) {
      setFormValues({
        AUTH_URL: config.AUTH_URL.value,
        API_URL: config.API_URL.value,
        PRIVATE_KEY: config.PRIVATE_KEY.value,
        PUBLIC_KEY: config.PUBLIC_KEY.value,
      });
    }
  }, [config]);

  const handleSave = () => {
    setSuccessMessage("");
    mutation.mutate(formValues, {
      onSuccess: () => {
        setSuccessMessage("Configuration saved. SDK will use the new values.");
      },
    });
  };

  const handleReset = () => {
    setSuccessMessage("");
    mutation.mutate(
      { reset: true },
      {
        onSuccess: () => {
          setSuccessMessage(
            "All overrides cleared. SDK will use .env defaults.",
          );
        },
      },
    );
  };

  const toggleVisibility = (key: ConfigKey) => {
    setVisibleFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const hasOverrides =
    config &&
    Object.values(config).some((entry) => entry.source === "override");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-gray-500">
          <svg
            className="animate-spin h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Loading configuration...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load configuration: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          SDK Configuration
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Override environment variables at runtime. Empty fields fall back to
          values defined in your <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">.env</code> file.
          Changes reset when the server restarts.
        </p>
      </div>

      {/* Security Warning */}
      <div className="relative rounded-lg border border-amber-300 bg-amber-50 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
        <div className="px-5 py-4 flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg
              className="h-5 w-5 text-amber-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-amber-800">
              Test / Devbox Environments Only
            </h3>
            <p className="mt-1 text-sm text-amber-700 leading-relaxed">
              The <strong>Private Key</strong> and <strong>Public Key</strong>{" "}
              fields on this page should only be used for test or devbox
              environments.{" "}
              <strong className="text-amber-900">
                Never enter production keys here.
              </strong>{" "}
              For production, configure keys exclusively through environment
              variables or a secrets manager.
            </p>
          </div>
        </div>
      </div>

      {/* Config Fields */}
      <div className="space-y-5">
        {FIELDS.map((field) => {
          const entry = config?.[field.key];
          const isVisible = visibleFields.has(field.key);

          return (
            <div
              key={field.key}
              className="rounded-lg border border-gray-200 bg-gray-50/50 p-4"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <label
                    htmlFor={`config-${field.key}`}
                    className="text-sm font-semibold text-gray-800"
                  >
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-0.5">*</span>
                    )}
                  </label>
                  {entry && <SourceBadge source={entry.source} />}
                </div>
                <code className="text-[11px] text-gray-400 font-mono">
                  {field.key}
                </code>
              </div>

              <p className="text-xs text-gray-500 mb-2.5">
                {field.description}
              </p>

              <div className="relative">
                {field.sensitive ? (
                  <textarea
                    id={`config-${field.key}`}
                    value={formValues[field.key]}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors font-mono text-sm resize-y bg-white"
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                    style={
                      !isVisible
                        ? {
                            color: "transparent",
                            textShadow: "0 0 8px rgba(0,0,0,0.5)",
                          }
                        : undefined
                    }
                  />
                ) : (
                  <input
                    id={`config-${field.key}`}
                    type="text"
                    value={formValues[field.key]}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        [field.key]: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors font-mono text-sm bg-white"
                    placeholder={`Enter ${field.label.toLowerCase()}...`}
                  />
                )}

                {field.sensitive && (
                  <button
                    type="button"
                    onClick={() => toggleVisibility(field.key)}
                    className="absolute top-2.5 right-2.5 p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    title={isVisible ? "Hide value" : "Show value"}
                  >
                    {isVisible ? (
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
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
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
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                )}
              </div>

              {entry?.source === "override" && entry.hasEnvFallback && (
                <p className="mt-1.5 text-xs text-blue-600">
                  Overriding .env value. Clear this field and save to restore
                  the default.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={mutation.isPending}
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? "Saving..." : "Save Configuration"}
        </button>

        {hasOverrides && (
          <button
            onClick={handleReset}
            disabled={mutation.isPending}
            className="px-5 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset to .env Defaults
          </button>
        )}
      </div>

      {/* Feedback Messages */}
      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
          {successMessage}
        </div>
      )}

      {mutation.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
          {mutation.error.message}
        </div>
      )}
    </div>
  );
}
