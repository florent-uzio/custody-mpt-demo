"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDefaultDomain } from "../contexts/DomainContext";
import { CopyButton } from "./CopyButton";

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  category: string;
  href: string;
}

/** Single source of truth for sidebar navigation. Every entry is a real route. */
export const NAV_ITEMS: NavItem[] = [
  { id: "config", label: "Configuration", icon: "⚙️", category: "Settings", href: "/config" },
  { id: "domains", label: "Domains", icon: "🌐", category: "General", href: "/domains" },
  { id: "accounts", label: "Accounts", icon: "👤", category: "General", href: "/accounts" },
  { id: "users-list", label: "Users", icon: "👥", category: "Users", href: "/users" },
  { id: "users-me", label: "Me", icon: "🪪", category: "Users", href: "/users/me" },
  { id: "requests", label: "Requests", icon: "📋", category: "Operations", href: "/requests" },
  { id: "transfers", label: "Transfers", icon: "💸", category: "Operations", href: "/transfers" },
  { id: "transactions", label: "Transactions", icon: "📝", category: "Operations", href: "/transactions" },
  { id: "channels", label: "Channels", icon: "📡", category: "Operations", href: "/channels" },
  { id: "intents-list", label: "Intents List", icon: "🗂️", category: "Operations", href: "/intents" },
  { id: "policies", label: "Policies", icon: "🛡️", category: "Operations", href: "/policies" },
  { id: "tickers", label: "Tickers", icon: "📊", category: "Data", href: "/tickers" },
  { id: "payment", label: "Payment", icon: "💳", category: "XRPL", href: "/payment" },
  { id: "mpt-create", label: "MPT Create", icon: "🪙", category: "XRPL", href: "/mpt/create" },
  { id: "mpt-authorize", label: "MPT Authorize", icon: "✅", category: "XRPL", href: "/mpt/authorize" },
  { id: "mpt-set", label: "MPT Set", icon: "⚙️", category: "XRPL", href: "/mpt/set" },
  { id: "mpt-destroy", label: "MPT Destroy", icon: "🗑️", category: "XRPL", href: "/mpt/destroy" },
  { id: "trustset", label: "TrustSet", icon: "🔗", category: "XRPL", href: "/trustset" },
  { id: "accountset", label: "AccountSet", icon: "🔧", category: "XRPL", href: "/accountset" },
  { id: "clawback", label: "Clawback", icon: "↩️", category: "XRPL", href: "/clawback" },
  { id: "tickets", label: "Tickets", icon: "🎟️", category: "XRPL", href: "/tickets" },
  { id: "batch", label: "Batch", icon: "📦", category: "XRPL", href: "/batch" },
  { id: "keypair", label: "Keypair Generator", icon: "🔑", category: "Tools", href: "/keypair" },
  { id: "jwt-token", label: "JWT Token", icon: "🎫", category: "Tools", href: "/jwt-token" },
  { id: "genesis", label: "Run Genesis", icon: "🌱", category: "Setup", href: "/genesis" },
];

interface AppSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Returns the id of the nav item that best matches the current pathname using
 * longest-prefix matching, so e.g. `/accounts/new` lights "Create Account"
 * (not "Accounts") and `/users/me` lights "Me" (not "Users").
 */
function activeNavId(pathname: string): string | null {
  let best: NavItem | null = null;
  for (const item of NAV_ITEMS) {
    if (pathname === item.href || pathname.startsWith(item.href + "/")) {
      if (!best || item.href.length > best.href.length) best = item;
    }
  }
  return best?.id ?? null;
}

export function AppSidebar({ open, onOpenChange }: AppSidebarProps) {
  const { defaultDomainId, setDefaultDomainId } = useDefaultDomain();
  const pathname = usePathname();
  const activeId = activeNavId(pathname);

  const groupedItems = NAV_ITEMS.reduce(
    (acc, item) => {
      (acc[item.category] ??= []).push(item);
      return acc;
    },
    {} as Record<string, NavItem[]>,
  );

  const closeOnMobile = () => {
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
          <Link
            href="/"
            title="Go to home dashboard"
            aria-label="Ripple Custody — go to home dashboard"
            className="group flex items-center gap-3 p-6 border-b border-gray-200 hover:bg-blue-50 transition-colors"
          >
            <span className="w-10 h-10 flex-shrink-0 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xl group-hover:bg-blue-200 transition-colors">
              🏠
            </span>
            <div>
              <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                Ripple Custody
              </h2>
              <p className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                Operations Dashboard
              </p>
            </div>
          </Link>

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
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                  {category}
                </h3>
                <div className="space-y-1">
                  {items.map((item) => {
                    const active = activeId === item.id;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={closeOnMobile}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                          active
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <span className="text-lg flex-shrink-0">
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </Link>
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
