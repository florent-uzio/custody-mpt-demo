"use client";

import { useState } from "react";
import { AppSidebar } from "../components/AppSidebar";
import { SidebarContext } from "../contexts/SidebarContext";

export default function PoliciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
