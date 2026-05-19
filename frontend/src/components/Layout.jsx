import React from 'react';
import Sidebar from './Sidebar';
import NotificationPanel from './NotificationPanel';
import { useNotification } from '../context/NotificationContext';
import { useSidebar } from '../context/SidebarContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { isPanelOpen } = useNotification();
  const { mobileSidebarOpen, closeMobileSidebar } = useSidebar();

  return (
    <div className={`app-layout ${isPanelOpen ? 'panel-open' : ''} ${mobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}>
      <Sidebar />
      {mobileSidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeMobileSidebar} />
      )}
      <main className="main-content-wrapper">
        <div className="scroll-container custom-scrollbar">
          {children}
        </div>
      </main>
      <NotificationPanel />
    </div>
  );
};

export default Layout;
