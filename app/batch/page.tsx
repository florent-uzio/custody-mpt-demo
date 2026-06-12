"use client";

import { useSidebarContext } from "../contexts/SidebarContext";
import { BatchWorkbench } from "../components/batch/BatchWorkbench";

export default function BatchPage() {
  const { sidebarOpen, setSidebarOpen } = useSidebarContext();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center gap-3 flex-shrink-0 shadow-sm">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Batch</h1>
          <p className="text-xs text-gray-500">XRPL · XLS-56</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BatchWorkbench />
        </div>
      </div>
    </div>
  );
}
