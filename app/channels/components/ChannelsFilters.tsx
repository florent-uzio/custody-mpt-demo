"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

interface Props {
  status: "ALL" | "ACTIVE" | "DISABLED";
  onStatusChange: (v: "ALL" | "ACTIVE" | "DISABLED") => void;
  nameQuery: string;
  onNameQueryChange: (v: string) => void;
  selectedEventTypes: string[];
  onSelectedEventTypesChange: (v: string[]) => void;
  availableEventTypes: string[];
}

export function ChannelsFilters({
  status,
  onStatusChange,
  nameQuery,
  onNameQueryChange,
  selectedEventTypes,
  onSelectedEventTypesChange,
  availableEventTypes,
}: Props) {
  const router = useRouter();
  const idInputRef = useRef<HTMLInputElement>(null);

  const handleIdSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = idInputRef.current?.value.trim();
    if (!id) return;
    router.push(`/channels/${id}`);
  };

  const toggleEventType = (type: string) => {
    if (selectedEventTypes.includes(type)) {
      onSelectedEventTypesChange(
        selectedEventTypes.filter((t) => t !== type),
      );
    } else {
      onSelectedEventTypesChange([...selectedEventTypes, type]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Filters
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Status
          </label>
          <select
            value={status}
            onChange={(e) =>
              onStatusChange(e.target.value as "ALL" | "ACTIVE" | "DISABLED")
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
          >
            <option value="ALL">All</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Name
          </label>
          <input
            type="text"
            value={nameQuery}
            onChange={(e) => onNameQueryChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            placeholder="Search by name…"
          />
        </div>

        <form onSubmit={handleIdSearch}>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Find by ID
          </label>
          <div className="flex gap-2">
            <input
              ref={idInputRef}
              type="text"
              placeholder="Enter channel ID…"
              className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors font-mono"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
            >
              Go
            </button>
          </div>
        </form>
      </div>

      {availableEventTypes.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Event types
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableEventTypes.map((type) => {
              const active = selectedEventTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleEventType(type)}
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    active
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {type}
                </button>
              );
            })}
            {selectedEventTypes.length > 0 && (
              <button
                type="button"
                onClick={() => onSelectedEventTypesChange([])}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
