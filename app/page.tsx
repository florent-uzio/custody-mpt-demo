"use client";

import { useState, useEffect } from "react";
import { RequestsTab } from "./components/RequestsTab";
import { BalancesTab } from "./components/BalancesTab";
import { TransfersTab } from "./components/TransfersTab";
import { TickersTab } from "./components/TickersTab";
import { PaymentTab } from "./components/PaymentTab";
import { MPTAuthorizeTab } from "./components/MPTAuthorizeTab";
import { MPTCreateTab } from "./components/MPTCreateTab";
import { MPTSetTab } from "./components/MPTSetTab";
import { MPTDestroyTab } from "./components/MPTDestroyTab";
import { UserCreateTab } from "./components/UserCreateTab";
import { TransactionsTab } from "./components/TransactionsTab";
import { SubmittedIntentsTab } from "./components/SubmittedIntentsTab";
import { DomainsTab } from "./components/DomainsTab";
import { AccountsTab } from "./components/AccountsTab";
import { AccountCreateTab } from "./components/AccountCreateTab";
import { AppSidebar, TABS } from "./components/AppSidebar";
import type { Tab } from "./components/AppSidebar";

const NOTES_STORAGE_KEY = "mpt_demo_notes";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("domains");
  const [notes, setNotes] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
      if (savedNotes) setNotes(savedNotes);

      // Restore tab from URL ?tab= param (e.g. navigating back from intents pages)
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") as Tab;
      if (tab && TABS.some((t) => t.id === tab) && tab !== "intents-list") {
        setActiveTab(tab);
      }
    }
  }, []);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    if (typeof window !== "undefined") {
      localStorage.setItem(NOTES_STORAGE_KEY, newNotes);
    }
  };

  const activeTabMeta = TABS.find((t) => t.id === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex h-screen overflow-hidden">
        <AppSidebar
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle sidebar"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
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
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTabMeta?.label || "Dashboard"}
                </h1>
                <p className="text-sm text-gray-600">
                  {activeTabMeta?.category || "General"} Operations
                </p>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Notes Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Notes{" "}
                  <span className="text-gray-400 font-normal">
                    (MPT IDs, etc.)
                  </span>
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
                  Your notes are automatically saved and will persist across
                  sessions.
                </p>
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {activeTab === "domains" && <DomainsTab />}
                {activeTab === "accounts" && <AccountsTab />}
                {activeTab === "account-create" && <AccountCreateTab />}
                {activeTab === "user-invitations" && <UserCreateTab />}
                {activeTab === "requests" && <RequestsTab />}
                {activeTab === "transfers" && <TransfersTab />}
                {activeTab === "transactions" && <TransactionsTab />}
                {activeTab === "submitted-intents" && <SubmittedIntentsTab />}
                {activeTab === "tickers" && <TickersTab />}
                {activeTab === "balances" && <BalancesTab />}
                {activeTab === "payment" && <PaymentTab />}
                {activeTab === "mpt-create" && <MPTCreateTab />}
                {activeTab === "mpt-authorize" && <MPTAuthorizeTab />}
                {activeTab === "mpt-set" && <MPTSetTab />}
                {activeTab === "mpt-destroy" && <MPTDestroyTab />}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
