"use client";

import { useState, useEffect } from "react";
import { RequestsTab } from "./components/RequestsTab";
import { IntentsTab } from "./components/IntentsTab";
import { BalancesTab } from "./components/BalancesTab";
import { TransfersTab } from "./components/TransfersTab";
import { TickersTab } from "./components/TickersTab";
import { MPTPaymentTab } from "./components/MPTPaymentTab";
import { TransactionsTab } from "./components/TransactionsTab";
import { SubmittedIntentsTab } from "./components/SubmittedIntentsTab";

type Tab =
  | "requests"
  | "intents"
  | "transfers"
  | "transactions"
  | "tickers"
  | "balances"
  // | "mpt-authorize"
  | "mpt-payment"
  | "submitted-intents";

const NOTES_STORAGE_KEY = "mpt_demo_notes";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("requests");
  const [notes, setNotes] = useState<string>("");

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

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "requests", label: "Requests", icon: "📋" },
    { id: "intents", label: "Intents", icon: "🎯" },
    { id: "transfers", label: "Transfers", icon: "💸" },
    { id: "transactions", label: "Transactions", icon: "📝" },
    { id: "tickers", label: "Tickers", icon: "📊" },
    { id: "balances", label: "Balances", icon: "💰" },
    // { id: "mpt-authorize", label: "MPT Authorize", icon: "✅" },
    { id: "mpt-payment", label: "MPT Payment", icon: "💳" },
    { id: "submitted-intents", label: "Submitted Intents", icon: "📜" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Ripple Custody MPT Demo
          </h1>
          <p className="text-gray-600">
            Showcase MPT operations with Ripple Custody system
          </p>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
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

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                    ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "requests" && <RequestsTab />}
            {activeTab === "intents" && <IntentsTab />}
            {activeTab === "transfers" && <TransfersTab />}
            {activeTab === "transactions" && <TransactionsTab />}
            {activeTab === "tickers" && <TickersTab />}
            {activeTab === "balances" && <BalancesTab />}
            {/* {activeTab === "mpt-authorize" && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">MPT Authorize tab - Coming soon</p>
              </div>
            )} */}
            {activeTab === "mpt-payment" && <MPTPaymentTab />}
            {activeTab === "submitted-intents" && <SubmittedIntentsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
