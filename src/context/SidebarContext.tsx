import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type SidebarContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({ sidebarOpen, setSidebarOpen, toggleSidebar }),
    [sidebarOpen, toggleSidebar],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
}
