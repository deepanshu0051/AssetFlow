import React from 'react';
import Sidebar from './Sidebar';
import NotificationPanel from './NotificationPanel';
import { useNotification } from '../context/NotificationContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { isPanelOpen } = useNotification();

  return (
    <div className={`app-layout ${isPanelOpen ? 'panel-open' : ''}`}>
      <Sidebar />
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
