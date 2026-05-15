"use client";

import type { ReactNode } from "react";
import { LogOut, PanelLeft, PanelLeftClose } from "lucide-react";
import SidebarNavigation from "./_components/SidebarNavigation";
import { SidebarProvider, useSidebar } from "./_components/SidebarContext";
import { logoutAction } from "./actions";

function HomeShell({ children }: { children: ReactNode }) {
  const { isOpen, closeSidebar, toggleSidebar } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {isOpen ? (
        <button
          type="button"
          onClick={closeSidebar}
          aria-label="Close sidebar backdrop"
          className="fixed inset-0 z-20 bg-gray-900/30 md:hidden"
        />
      ) : null}

      <div className="relative z-30 flex min-h-screen">
        <SidebarNavigation />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="z-10 flex h-20 items-center justify-between border-b border-slate-300 bg-white px-4 md:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleSidebar}
                aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
                className="inline-flex h-10 w-10 items-center justify-center text-gray-500 transition hover:cursor-pointer"
              >
                {isOpen ? (
                  <PanelLeftClose size={24} />
                ) : (
                  <PanelLeft size={24} />
                )}
              </button>
            </div>
            <button
              type="button"
              onClick={async () => {
                await logoutAction();
              }}
              className="cursor-pointer inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </header>

          <main className="h-[calc(100vh-5rem)] overflow-y-auto bg-gray-100">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <HomeShell>{children}</HomeShell>
    </SidebarProvider>
  );
}
