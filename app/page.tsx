"use client";

import { useState } from "react";
import { RequestsTab } from "./components/RequestsTab";
import { IntentsTab } from "./components/IntentsTab";
import { BalancesTab } from "./components/BalancesTab";

type Tab =
  | "requests"
  | "intents"
  | "transactions"
  | "tickers"
  | "balances"
  | "mpt-authorize"
  | "mpt-payment";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("requests");

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "requests", label: "Requests", icon: "📋" },
    { id: "intents", label: "Intents", icon: "🎯" },
    { id: "transactions", label: "Transactions", icon: "💸" },
    { id: "tickers", label: "Tickers", icon: "📊" },
    { id: "balances", label: "Balances", icon: "💰" },
    { id: "mpt-authorize", label: "MPT Authorize", icon: "✅" },
    { id: "mpt-payment", label: "MPT Payment", icon: "💳" },
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
            {activeTab === "transactions" && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Transactions tab - Coming soon</p>
              </div>
            )}
            {activeTab === "tickers" && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Tickers tab - Coming soon</p>
              </div>
            )}
            {activeTab === "balances" && <BalancesTab />}
            {activeTab === "mpt-authorize" && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">MPT Authorize tab - Coming soon</p>
              </div>
            )}
            {activeTab === "mpt-payment" && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">MPT Payment tab - Coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

