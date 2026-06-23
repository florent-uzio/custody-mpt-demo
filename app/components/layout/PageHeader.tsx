"use client";

import Link from "next/link";
import { useSidebarContext } from "../../contexts/SidebarContext";

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  /** Main title shown in the bar. */
  title: string;
  /** Optional small grey subtitle (e.g. "XRPL · TicketCreate"). */
  subtitle?: string;
  /** Optional breadcrumb trail rendered above the title. */
  breadcrumbs?: Breadcrumb[];
  /** Optional right-aligned actions (refresh button, "Create" link, …). */
  actions?: React.ReactNode;
}

/**
 * The persistent slim white top bar shared by every page. Owns the sidebar
 * toggle so individual pages never re-implement it.
 */
export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  const { sidebarOpen, setSidebarOpen } = useSidebarContext();

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between gap-3 flex-shrink-0 shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-5 h-5 text-gray-600"
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
        <div className="min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1.5 mb-0.5 text-xs">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-gray-400 hover:text-gray-700 font-medium transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-500 font-medium">
                      {crumb.label}
                    </span>
                  )}
                  {i < breadcrumbs.length - 1 && (
                    <span className="text-gray-300">/</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-xl font-bold text-gray-900 truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs text-gray-500 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </header>
  );
}
