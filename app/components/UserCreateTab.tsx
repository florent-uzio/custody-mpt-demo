"use client";

import { useState } from "react";
import { JsonViewer } from "./JsonViewer";
import { useDefaultDomain } from "../contexts/DomainContext";
import { CopyButton } from "./CopyButton";
import { saveSubmittedIntent } from "../utils/intentStorage";

const AVAILABLE_ROLES = [
  { id: "admin", label: "Admin", description: "Full administrative access" },
  { id: "user", label: "User", description: "Standard user access" },
  { id: "viewer", label: "Viewer", description: "Read-only access" },
  { id: "operator", label: "Operator", description: "Operational access" },
];

export function UserCreateTab() {
  const { defaultDomainId } = useDefaultDomain();

  // Form state
  const [alias, setAlias] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["user"]);
  const [lock, setLock] = useState<"Unlocked" | "Locked">("Unlocked");
  const [description, setDescription] = useState("");

  // Login IDs (optional)
  const [loginIds, setLoginIds] = useState<
    { id: string; providerId: string }[]
  >([]);
  const [showLoginIds, setShowLoginIds] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{
    request: unknown;
    response: unknown;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((r) => r !== roleId)
        : [...prev, roleId]
    );
  };

  const addLoginId = () => {
    setLoginIds([...loginIds, { id: "", providerId: "harmonize" }]);
  };

  const removeLoginId = (index: number) => {
    setLoginIds(loginIds.filter((_, i) => i !== index));
  };

  const updateLoginId = (
    index: number,
    field: "id" | "providerId",
    value: string
  ) => {
    const newLoginIds = [...loginIds];
    newLoginIds[index][field] = value;
    setLoginIds(newLoginIds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    if (selectedRoles.length === 0) {
      setError("At least one role must be selected");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainId: defaultDomainId,
          alias,
          publicKey,
          roles: selectedRoles,
          lock,
          description: description || undefined,
          loginIds:
            loginIds.length > 0 ? loginIds.filter((l) => l.id) : undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create user");
      }

      const result = await res.json();
      setResponse(result);

      // Save to localStorage if we have a requestId
      const responseData = result?.response || result;
      const requestId =
        responseData?.id || responseData?.requestId || responseData?.data?.id;
      if (requestId) {
        saveSubmittedIntent({
          type: "CreateUser",
          requestId: requestId,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Create User</h2>
        </div>
        <p className="text-teal-100 text-sm">
          Create a new user in your Custody domain by proposing a user creation
          intent. The user will be added with the specified roles and
          permissions.
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="px-2 py-1 bg-white/20 rounded-full">
            Intent-based
          </span>
          <span className="text-teal-200">Uses v0_CreateUser payload</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
              1
            </span>
            User Details
          </h3>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="alias"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                User Alias *
              </label>
              <input
                type="text"
                id="alias"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                maxLength={75}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
                placeholder="John Doe"
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                A friendly name to identify the user (1-75 characters)
              </p>
            </div>

            <div>
              <label
                htmlFor="publicKey"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Public Key (Base64) *
              </label>
              <textarea
                id="publicKey"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors font-mono text-sm"
                placeholder="MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE..."
                rows={4}
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                The user&apos;s public key in Base64 format. This key will be
                used to verify the user&apos;s identity and sign requests.
              </p>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description (Optional)
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={250}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
                placeholder="Operations team member"
              />
              <p className="mt-2 text-xs text-gray-500">
                Optional description for the user (max 250 characters)
              </p>
            </div>
          </div>
        </div>

        {/* Roles Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
              2
            </span>
            User Roles *
            <span className="ml-auto text-sm font-normal text-gray-500">
              {selectedRoles.length} selected
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_ROLES.map((role) => (
              <label
                key={role.id}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedRoles.includes(role.id)
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role.id)}
                  onChange={() => handleRoleToggle(role.id)}
                  className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">
                      {role.label}
                    </span>
                    <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                      {role.id}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {role.description}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {/* Custom role input */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              Need a custom role? Enter it manually (lowercase, alphanumeric
              with hyphens):
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="custom-role"
                pattern="[a-z0-9\-]+"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    const value = input.value.toLowerCase().trim();
                    if (value && !selectedRoles.includes(value)) {
                      setSelectedRoles([...selectedRoles, value]);
                      input.value = "";
                    }
                  }
                }}
              />
              <span className="text-xs text-gray-400 self-center">
                Press Enter to add
              </span>
            </div>
          </div>
        </div>

        {/* Lock Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
              3
            </span>
            Lock Status
          </h3>

          <div className="flex gap-4">
            <label
              className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                lock === "Unlocked"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="lock"
                value="Unlocked"
                checked={lock === "Unlocked"}
                onChange={() => setLock("Unlocked")}
                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔓</span>
                  <span className="font-medium text-gray-900">Unlocked</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  User can perform actions immediately
                </p>
              </div>
            </label>

            <label
              className={`flex-1 flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                lock === "Locked"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="lock"
                value="Locked"
                checked={lock === "Locked"}
                onChange={() => setLock("Locked")}
                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  <span className="font-medium text-gray-900">Locked</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  User is created but cannot perform actions
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Login IDs (Optional) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center text-sm font-bold">
                4
              </span>
              Login IDs (Optional)
            </h3>
            <button
              type="button"
              onClick={() => setShowLoginIds(!showLoginIds)}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              {showLoginIds ? "Hide" : "Show"}
            </button>
          </div>

          {showLoginIds && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Domain-unique loginId-loginProviderId pairs. For internal login,
                set providerId to &quot;harmonize&quot;.
              </p>

              {loginIds.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No login IDs added. Click the button below to add one.
                </p>
              ) : (
                <div className="space-y-3">
                  {loginIds.map((loginId, index) => (
                    <div
                      key={index}
                      className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            User ID
                          </label>
                          <input
                            type="text"
                            value={loginId.id}
                            onChange={(e) =>
                              updateLoginId(index, "id", e.target.value)
                            }
                            placeholder="user@example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Provider ID
                          </label>
                          <input
                            type="text"
                            value={loginId.providerId}
                            onChange={(e) =>
                              updateLoginId(index, "providerId", e.target.value)
                            }
                            placeholder="harmonize"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLoginId(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors mt-5"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={addLoginId}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                + Add Login ID
              </button>
            </div>
          )}
        </div>

        {/* Configuration Summary */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
          <h4 className="font-medium text-gray-700 mb-3 text-sm">
            Configuration Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 block text-xs">Domain ID</span>
              <span className="font-mono text-xs text-gray-800 truncate block">
                {defaultDomainId || "Not set"}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Alias</span>
              <span className="font-mono text-gray-800 truncate block">
                {alias || "—"}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Roles</span>
              <span className="font-mono text-gray-800">
                {selectedRoles.length > 0 ? selectedRoles.join(", ") : "—"}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Lock Status</span>
              <span className="font-mono text-gray-800">{lock}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            loading ||
            !defaultDomainId ||
            !alias ||
            !publicKey ||
            selectedRoles.length === 0
          }
          className="w-full px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              Creating User...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Create User Intent
            </span>
          )}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-600 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-red-800 font-medium">Error: {error}</p>
          </div>
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="space-y-4">
          <JsonViewer data={response.request} title="Request Payload" />
          <JsonViewer data={response.response} title="API Response" />
        </div>
      )}
    </div>
  );
}
