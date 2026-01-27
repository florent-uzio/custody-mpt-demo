"use client";

import { useState, useEffect } from "react";
import { RequestsTab } from "./components/RequestsTab";
import { IntentsTab } from "./components/IntentsTab";
import { BalancesTab } from "./components/BalancesTab";
import { TransfersTab } from "./components/TransfersTab";
import { TickersTab } from "./components/TickersTab";
import { MPTPaymentTab } from "./components/MPTPaymentTab";
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
import { useDefaultDomain } from "./contexts/DomainContext";
import { CopyButton } from "./components/CopyButton";

type Tab =
  | "domains"
  | "accounts"
  | "account-create"
  | "user-invitations"
  | "requests"
  | "intents"
  | "transfers"
  | "transactions"
  | "tickers"
  | "balances"
  | "mpt-create"
  | "mpt-authorize"
  | "mpt-payment"
  | "mpt-set"
  | "mpt-destroy"
  | "submitted-intents";

const NOTES_STORAGE_KEY = "mpt_demo_notes";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("domains");
  const [notes, setNotes] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { defaultDomainId, setDefaultDomainId } = useDefaultDomain();

  useEffect(() => {
    // Load notes from localStorage
    if (typeof window !== "undefined") {
      const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
      if (savedNotes) {
        setNotes(savedNotes);
      }
    }
  }, []);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(NOTES_STORAGE_KEY, newNotes);
    }
  };

  const tabs: { id: Tab; label: string; icon: string; category?: string }[] = [
    { id: "domains", label: "Domains", icon: "🌐", category: "General" },
    { id: "accounts", label: "Accounts", icon: "👤", category: "General" },
    {
      id: "account-create",
      label: "Create Account",
      icon: "➕",
      category: "General",
    },
    {
      id: "user-invitations",
      label: "User Invitations",
      icon: "✉️",
      category: "Users",
    },
    { id: "requests", label: "Requests", icon: "📋", category: "Operations" },
    { id: "intents", label: "Get Intent", icon: "🎯", category: "Operations" },
    { id: "transfers", label: "Transfers", icon: "💸", category: "Operations" },
    {
      id: "transactions",
      label: "Transactions",
      icon: "📝",
      category: "Operations",
    },
    {
      id: "submitted-intents",
      label: "Submitted Intents",
      icon: "📜",
      category: "Operations",
    },
    { id: "tickers", label: "Tickers", icon: "📊", category: "Data" },
    { id: "balances", label: "Balances", icon: "💰", category: "Data" },
    {
      id: "mpt-create",
      label: "MPT Create",
      icon: "🪙",
      category: "XRPL",
    },
    {
      id: "mpt-authorize",
      label: "MPT Authorize",
      icon: "✅",
      category: "XRPL",
    },
    { id: "mpt-payment", label: "MPT Payment", icon: "💳", category: "XRPL" },
    {
      id: "mpt-set",
      label: "MPT Set",
      icon: "⚙️",
      category: "XRPL",
    },
    {
      id: "mpt-destroy",
      label: "MPT Destroy",
      icon: "🗑️",
      category: "XRPL",
    },
  ];

  const groupedTabs = tabs.reduce((acc, tab) => {
    const category = tab.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(tab);
    return acc;
  }, {} as Record<string, typeof tabs>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex h-screen overflow-hidden">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out
            ${
              sidebarOpen
                ? "translate-x-0 w-64"
                : "-translate-x-full lg:translate-x-0 lg:w-0"
            }
            overflow-hidden
          `}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                Ripple Custody
              </h2>
              <p className="text-xs text-gray-500 mt-1">Operations Dashboard</p>
            </div>

            {/* Default Domain ID Section */}
            <div className="p-4 border-b border-gray-200">
              <label
                htmlFor="defaultDomainId"
                className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
              >
                Default Domain ID
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  id="defaultDomainId"
                  value={defaultDomainId}
                  onChange={(e) => setDefaultDomainId(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Enter domain UUID"
                />
                {defaultDomainId && <CopyButton text={defaultDomainId} />}
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                Used as default for API calls
              </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-6">
              {Object.entries(groupedTabs).map(([category, categoryTabs]) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                    {category}
                  </h3>
                  <div className="space-y-1">
                    {categoryTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          // Close sidebar on mobile after selection
                          if (
                            typeof window !== "undefined" &&
                            window.innerWidth < 1024
                          ) {
                            setSidebarOpen(false);
                          }
                        }}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                          ${
                            activeTab === tab.id
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          }
                        `}
                      >
                        <span className="text-lg flex-shrink-0">
                          {tab.icon}
                        </span>
                        <span className="truncate">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

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
                  {tabs.find((t) => t.id === activeTab)?.label || "Dashboard"}
                </h1>
                <p className="text-sm text-gray-600">
                  {tabs.find((t) => t.id === activeTab)?.category || "General"}{" "}
                  Operations
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
                {activeTab === "intents" && <IntentsTab />}
                {activeTab === "transfers" && <TransfersTab />}
                {activeTab === "transactions" && <TransactionsTab />}
                {activeTab === "submitted-intents" && <SubmittedIntentsTab />}
                {activeTab === "tickers" && <TickersTab />}
                {activeTab === "balances" && <BalancesTab />}
                {activeTab === "mpt-create" && <MPTCreateTab />}
                {activeTab === "mpt-authorize" && <MPTAuthorizeTab />}
                {activeTab === "mpt-payment" && <MPTPaymentTab />}
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
