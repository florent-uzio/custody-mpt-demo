"use client";

import Link from "next/link";
import { Core_TrustedDomain } from "custody";
import { CopyButton } from "../CopyButton";
import { useSidebarContext } from "../../contexts/SidebarContext";
import { LockStatusConfig } from "./config";

type LockStatus = Core_TrustedDomain["data"]["lock"];

interface Props {
  domainId: string;
  alias?: string;
  lockStatus?: LockStatus;
  cfg: LockStatusConfig;
}

export function DomainHeader({ domainId, alias, lockStatus, cfg }: Props) {
  const { sidebarOpen, setSidebarOpen } = useSidebarContext();

  return (
    <div className={`bg-gradient-to-r ${cfg.headerBg} shadow-md flex-shrink-0`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mt-0.5 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-white"
              aria-label="Toggle sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {sidebarOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href="/?tab=domains"
                  className="text-white/60 hover:text-white text-xs font-medium transition-colors"
                >
                  Domains
                </Link>
                <span className="text-white/40 text-xs">/</span>
                <span className="text-white/80 text-xs font-medium">Detail</span>
              </div>
              {alias && (
                <p className="text-white/90 text-lg font-semibold mb-0.5">{alias}</p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-white font-mono text-sm font-semibold break-all">
                  {domainId}
                </h1>
                <div className="bg-white/20 rounded p-0.5">
                  <CopyButton text={domainId} className="text-white hover:bg-white/20" />
                </div>
              </div>
            </div>
          </div>

          {lockStatus && (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText} flex-shrink-0`}
            >
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              {lockStatus}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
