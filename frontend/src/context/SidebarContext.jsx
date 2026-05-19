import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => setMobileSidebarOpen(prev => !prev);
  const openMobileSidebar = () => setMobileSidebarOpen(true);
  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <SidebarContext.Provider value={{ mobileSidebarOpen, toggleMobileSidebar, openMobileSidebar, closeMobileSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
