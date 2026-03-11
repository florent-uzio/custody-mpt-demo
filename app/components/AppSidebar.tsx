"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDefaultDomain } from "../contexts/DomainContext";
import { CopyButton } from "./CopyButton";

export type Tab =
  | "domains"
  | "accounts"
  | "account-create"
  | "user-invitations"
  | "requests"
  | "transfers"
  | "transactions"
  | "tickers"
  | "balances"
  | "mpt-create"
  | "mpt-authorize"
  | "payment"
  | "mpt-set"
  | "mpt-destroy"
  | "submitted-intents"
  | "intents-list"
  | "users-list"
  | "users-me"
  | "keypair";

export const TABS: {
  id: Tab;
  label: string;
  icon: string;
  category: string;
}[] = [
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
  {
    id: "intents-list",
    label: "Intents List",
    icon: "🗂️",
    category: "Operations",
  },
  {
    id: "users-list",
    label: "Users",
    icon: "👥",
    category: "Users",
  },
  {
    id: "users-me",
    label: "Me",
    icon: "🪪",
    category: "Users",
  },
  { id: "tickers", label: "Tickers", icon: "📊", category: "Data" },
  { id: "balances", label: "Balances", icon: "💰", category: "Data" },
  { id: "payment", label: "Payment", icon: "💳", category: "XRPL" },
  { id: "mpt-create", label: "MPT Create", icon: "🪙", category: "XRPL" },
  { id: "mpt-authorize", label: "MPT Authorize", icon: "✅", category: "XRPL" },
  { id: "mpt-set", label: "MPT Set", icon: "⚙️", category: "XRPL" },
  { id: "mpt-destroy", label: "MPT Destroy", icon: "🗑️", category: "XRPL" },
  { id: "keypair", label: "Keypair Generator", icon: "🔑", category: "Tools" },
];

interface AppSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
}

export function AppSidebar({
  open,
  onOpenChange,
  activeTab,
  onTabChange,
}: AppSidebarProps) {
  const { defaultDomainId, setDefaultDomainId } = useDefaultDomain();
  const pathname = usePathname();
  const isNavMode =
    pathname.startsWith("/intents") ||
    pathname.startsWith("/transactions") ||
    pathname.startsWith("/transfers") ||
    pathname.startsWith("/users");

  const groupedTabs = TABS.reduce(
    (acc, tab) => {
      if (!acc[tab.category]) acc[tab.category] = [];
      acc[tab.category].push(tab);
      return acc;
    },
    {} as Record<string, typeof TABS>,
  );

  const isActive = (tab: (typeof TABS)[0]) => {
    if (tab.id === "intents-list") return pathname.startsWith("/intents");
    if (tab.id === "transactions") return pathname.startsWith("/transactions");
    if (tab.id === "transfers") return pathname.startsWith("/transfers");
    if (tab.id === "users-list") return pathname === "/users";
    if (tab.id === "users-me") return pathname.startsWith("/users/me");
    if (isNavMode) return false;
    return activeTab === tab.id;
  };

  const handleTabClick = (tab: (typeof TABS)[0]) => {
    if (tab.id === "intents-list" || tab.id === "users-list" || tab.id === "users-me") return;
    if (onTabChange) onTabChange(tab.id);
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      onOpenChange(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 flex-shrink-0
          bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ease-in-out
          ${open ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-0"}
          overflow-hidden
        `}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Ripple Custody</h2>
            <p className="text-xs text-gray-500 mt-1">Operations Dashboard</p>
          </div>

          {/* Default Domain ID */}
          <div className="p-4 border-b border-gray-200">
            <label
              htmlFor="sidebar-domainId"
              className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
            >
              Default Domain ID
            </label>
            <div className="flex items-center gap-1">
              <input
                type="text"
                id="sidebar-domainId"
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
            {Object.entries(groupedTabs).map(([category, tabs]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                  {category}
                </h3>
                <div className="space-y-1">
                  {tabs.map((tab) => {
                    const active = isActive(tab);
                    const cls = `w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      active
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`;

                    if (tab.id === "intents-list") {
                      return (
                        <Link key={tab.id} href="/intents" className={cls}>
                          <span className="text-lg flex-shrink-0">
                            {tab.icon}
                          </span>
                          <span className="truncate">{tab.label}</span>
                        </Link>
                      );
                    }

                    if (tab.id === "users-list") {
                      return (
                        <Link key={tab.id} href="/users" className={cls}>
                          <span className="text-lg flex-shrink-0">{tab.icon}</span>
                          <span className="truncate">{tab.label}</span>
                        </Link>
                      );
                    }

                    if (tab.id === "users-me") {
                      return (
                        <Link key={tab.id} href="/users/me" className={cls}>
                          <span className="text-lg flex-shrink-0">{tab.icon}</span>
                          <span className="truncate">{tab.label}</span>
                        </Link>
                      );
                    }

                    if (isNavMode) {
                      return (
                        <Link
                          key={tab.id}
                          href={`/?tab=${tab.id}`}
                          className={cls}
                        >
                          <span className="text-lg flex-shrink-0">
                            {tab.icon}
                          </span>
                          <span className="truncate">{tab.label}</span>
                        </Link>
                      );
                    }

                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab)}
                        className={cls}
                      >
                        <span className="text-lg flex-shrink-0">
                          {tab.icon}
                        </span>
                        <span className="truncate">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
