"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Core_TrustedUser } from "@florent-uzio/custody";
import { JsonViewer } from "../../components/JsonViewer";
import { useSubmitUpdateUser } from "../../hooks/useSubmitUpdateUser";

const AVAILABLE_ROLES = [
  { id: "admin", label: "Admin" },
  { id: "user", label: "User" },
  { id: "viewer", label: "Viewer" },
  { id: "operator", label: "Operator" },
];

type LoginId = NonNullable<
  NonNullable<Core_TrustedUser["data"]["loginIds"]>[number]
>;

export function UserEditForm({
  user,
  onCancel,
}: {
  user: Core_TrustedUser;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const { mutate, isPending, data: response, error } = useSubmitUpdateUser();

  const initial = user.data;

  const [alias, setAlias] = useState(initial.alias);
  const [description, setDescription] = useState(
    initial.metadata.description ?? "",
  );
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initial.roles);
  const [customRoleInput, setCustomRoleInput] = useState("");
  const [loginIds, setLoginIds] = useState<LoginId[]>(
    initial.loginIds ? initial.loginIds.map((l) => ({ ...l })) : [],
  );

  const customRoleIsValid = /^[a-z0-9-]+$/.test(customRoleInput.trim());
  const customRoles = useMemo(
    () =>
      selectedRoles.filter((r) => !AVAILABLE_ROLES.some((ar) => ar.id === r)),
    [selectedRoles],
  );

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((r) => r !== roleId)
        : [...prev, roleId],
    );
  };

  const addCustomRole = (raw: string): string[] => {
    const value = raw.toLowerCase().trim();
    if (!value || !/^[a-z0-9-]+$/.test(value)) return selectedRoles;
    if (selectedRoles.includes(value)) {
      setCustomRoleInput("");
      return selectedRoles;
    }
    const next = [...selectedRoles, value];
    setSelectedRoles(next);
    setCustomRoleInput("");
    return next;
  };

  const addLoginId = () =>
    setLoginIds([...loginIds, { id: "", providerId: "harmonize" }]);
  const removeLoginId = (index: number) =>
    setLoginIds(loginIds.filter((_, i) => i !== index));
  const updateLoginIdField = (
    index: number,
    field: "id" | "providerId",
    value: string,
  ) => {
    setLoginIds((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const roles = customRoleInput.trim()
      ? addCustomRole(customRoleInput)
      : selectedRoles;
    if (roles.length === 0) return;

    const cleanedLoginIds = loginIds.filter((l) => l.id.trim());

    mutate(
      {
        domainId: initial.domainId,
        reference: { id: initial.id, revision: initial.metadata.revision },
        alias: alias.trim(),
        roles,
        ...(description.trim() && { description: description.trim() }),
        customProperties: initial.metadata.customProperties ?? {},
        ...(cleanedLoginIds.length > 0 && { loginIds: cleanedLoginIds }),
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["user", initial.id, initial.domainId],
          });
        },
      },
    );
  };

  return (
    <div className="space-y-5">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Proposes a <span className="font-mono">v0_UpdateUser</span>{" "}
              intent. Revision{" "}
              <span className="font-mono">{initial.metadata.revision}</span>{" "}
              will be referenced.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>

        <div>
          <label
            htmlFor="edit-alias"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Alias *
          </label>
          <input
            id="edit-alias"
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            maxLength={75}
            required
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="edit-description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Description
          </label>
          <input
            id="edit-description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={250}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Roles *
            </label>
            <span className="text-xs text-gray-500">
              {selectedRoles.length} selected
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {AVAILABLE_ROLES.map((role) => (
              <label
                key={role.id}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedRoles.includes(role.id)
                    ? "border-teal-500 bg-teal-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role.id)}
                  onChange={() => handleRoleToggle(role.id)}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {role.label}
                  </div>
                  <div className="text-xs text-gray-400 font-mono">
                    {role.id}
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={customRoleInput}
                onChange={(e) => setCustomRoleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomRole(customRoleInput);
                  }
                }}
                placeholder="custom-role"
                pattern="[a-z0-9\-]+"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
              <button
                type="button"
                onClick={() => addCustomRole(customRoleInput)}
                disabled={!customRoleIsValid}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>
            {customRoleInput.trim() && !customRoleIsValid && (
              <p className="mt-2 text-xs text-red-600">
                Use lowercase letters, digits, and hyphens only.
              </p>
            )}
            {customRoles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {customRoles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-full text-xs font-mono"
                  >
                    {role}
                    <button
                      type="button"
                      onClick={() => handleRoleToggle(role)}
                      className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-teal-200 text-teal-700"
                      aria-label={`Remove ${role}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Login IDs
            </label>
            <button
              type="button"
              onClick={addLoginId}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium"
            >
              + Add Login ID
            </button>
          </div>
          {loginIds.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No login IDs.</p>
          ) : (
            <div className="space-y-2">
              {loginIds.map((loginId, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={loginId.id}
                      onChange={(e) =>
                        updateLoginIdField(index, "id", e.target.value)
                      }
                      placeholder="user@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                    <input
                      type="text"
                      value={loginId.providerId}
                      onChange={(e) =>
                        updateLoginIdField(index, "providerId", e.target.value)
                      }
                      placeholder="harmonize"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLoginId(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                    aria-label="Remove login ID"
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
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending || !alias.trim() || selectedRoles.length === 0}
            className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all"
          >
            {isPending ? "Submitting…" : "Propose Update"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700 font-medium">
            {error instanceof Error ? error.message : String(error)}
          </p>
        </div>
      )}

      {response && (
        <div className="space-y-4">
          <JsonViewer data={response.request} title="Request Payload" />
          <JsonViewer data={response.response} title="API Response" />
        </div>
      )}
    </div>
  );
}
