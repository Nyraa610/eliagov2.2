
import React, { createContext, useContext, useState, ReactNode } from 'react';

type SidebarContextType = {
  collapsed: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  toggleSidebar: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <SidebarContext.Provider value={{ collapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}
