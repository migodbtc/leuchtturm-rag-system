"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type SidebarContextValue = {
  isOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextValue | undefined>(
  undefined,
);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  const openSidebar = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      openSidebar,
      closeSidebar,
      toggleSidebar,
    }),
    [isOpen, openSidebar, closeSidebar, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
