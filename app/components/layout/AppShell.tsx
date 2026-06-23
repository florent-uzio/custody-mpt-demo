"use client";

import { useState } from "react";
import { AppSidebar } from "../AppSidebar";
import { SidebarContext } from "../../contexts/SidebarContext";

/**
 * App-wide shell: owns sidebar open/close state, provides it via SidebarContext
 * (so every PageHeader can toggle it), and renders the sidebar next to the
 * scrollable page area. Mounted once in the root layout — replaces the
 * formerly-duplicated per-route layout.tsx files.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
