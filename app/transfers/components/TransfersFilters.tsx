"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";

interface Props {
  kind: string;
  onKindChange: (v: string) => void;
  quarantinedFilter: string;
  onQuarantinedChange: (v: string) => void;
  domainId?: string;
}

export function TransfersFilters({
  kind,
  onKindChange,
  quarantinedFilter,
  onQuarantinedChange,
  domainId,
}: Props) {
  const router = useRouter();
  const idInputRef = useRef<HTMLInputElement>(null);

  const handleIdSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = idInputRef.current?.value.trim();
    if (!id) return;
    const params = domainId ? `?domainId=${domainId}` : "";
    router.push(`/transfers/${id}${params}`);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        Filters
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Kind
          </label>
          <select
            value={kind}
            onChange={(e) => onKindChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
          >
            <option value="">All kinds</option>
            <option value="Transfer">Transfer</option>
            <option value="Fee">Fee</option>
            <option value="Recovery">Recovery</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Quarantined
          </label>
          <select
            value={quarantinedFilter}
            onChange={(e) => onQuarantinedChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
          >
            <option value="">Any</option>
            <option value="true">Quarantined</option>
            <option value="false">Not quarantined</option>
          </select>
        </div>

        <form onSubmit={handleIdSearch}>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Find by ID
          </label>
          <div className="flex gap-2">
            <input
              ref={idInputRef}
              type="text"
              placeholder="Enter transfer ID…"
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
    </div>
  );
}
