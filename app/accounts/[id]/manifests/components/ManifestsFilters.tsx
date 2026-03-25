"use client";

import type {
  ManifestContentType,
  ManifestProcessingStatus,
} from "../manifests.types";

interface Props {
  contentTypeFilter: ManifestContentType | "";
  onContentTypeChange: (v: ManifestContentType | "") => void;
  processingStatusFilter: ManifestProcessingStatus | "";
  onProcessingStatusChange: (v: ManifestProcessingStatus | "") => void;
  limit: number;
  onLimitChange: (v: number) => void;
}

export function ManifestsFilters({
  contentTypeFilter,
  onContentTypeChange,
  processingStatusFilter,
  onProcessingStatusChange,
  limit,
  onLimitChange,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Filters
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Processing Status
          </label>
          <select
            value={processingStatusFilter}
            onChange={(e) =>
              onProcessingStatusChange(
                e.target.value as ManifestProcessingStatus | "",
              )
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
          >
            <option value="">All statuses</option>
            {(["Pending", "Preparing", "Completed"] as ManifestProcessingStatus[]).map(
              (s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ),
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Content Type
          </label>
          <select
            value={contentTypeFilter}
            onChange={(e) =>
              onContentTypeChange(e.target.value as ManifestContentType | "")
            }
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
          >
            <option value="">All types</option>
            {(["EIP-191", "JWT", "Unsafe"] as ManifestContentType[]).map(
              (t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ),
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Per page
          </label>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
