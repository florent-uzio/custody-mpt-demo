"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { NAV_ITEMS } from "./components/AppSidebar";
import { Page, PageHeader, PageContainer, PageHero } from "./components/layout";

const NOTES_STORAGE_KEY = "mpt_demo_notes";

export default function Home() {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(NOTES_STORAGE_KEY);
    if (saved) setNotes(saved);
  }, []);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    localStorage.setItem(NOTES_STORAGE_KEY, e.target.value);
  };

  // Group nav items by category for the quick-links grid.
  const groups = NAV_ITEMS.reduce(
    (acc, item) => {
      (acc[item.category] ??= []).push(item);
      return acc;
    },
    {} as Record<string, typeof NAV_ITEMS>,
  );

  return (
    <Page>
      <PageHeader title="Dashboard" subtitle="Ripple Custody · Operations" />
      <PageContainer width="list">
        <PageHero
          theme="blue"
          icon="🏠"
          title="Ripple Custody Operations"
          description="Manage domains, accounts, users and XRPL operations. Pick a tool below or jump in from the sidebar."
          badge={{ label: "Internal", note: "Operations dashboard" }}
        />

        {/* Notes scratchpad */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Notes{" "}
            <span className="text-gray-400 font-normal">(MPT IDs, etc.)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={handleNotesChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-y font-mono text-sm"
            placeholder="Save your MPT IDs, notes, or any other information here...&#10;&#10;Example:&#10;MPT Issuance ID: 00CA8BD9F2582AF39B51725D510C5401ED4495ECFB250591"
          />
          <p className="mt-2 text-xs text-gray-500">
            Your notes are automatically saved and will persist across sessions.
          </p>
        </div>

        {/* Quick links */}
        <div className="space-y-6">
          {Object.entries(groups).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                {category}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </Page>
  );
}
