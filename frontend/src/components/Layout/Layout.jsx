import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const Layout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/':
        return 'Overview Dashboard';
      case '/create-campaign':
        return 'Create Automation Campaign';
      case '/campaigns':
        return 'My Campaigns';
      case '/pins':
        return 'Generated Pinterest Pins';
      case '/calendar':
        return 'Publishing Calendar';
      case '/pinterest-accounts':
        return 'Pinterest Business Accounts';
      case '/analytics':
        return 'Performance Analytics';
      case '/settings':
        return 'Platform Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Sidebar isMobileOpen={isMobileOpen} closeMobile={() => setIsMobileOpen(false)} />
      
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Navbar toggleMobile={() => setIsMobileOpen((prev) => !prev)} title={getPageTitle(location.pathname)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
