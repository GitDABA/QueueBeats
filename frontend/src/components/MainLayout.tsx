import React, { useState, useEffect } from 'react';
import { Navigation } from './Navigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Listen for sidebar toggle events
  useEffect(() => {
    // Function to handle sidebar toggle events
    const handleSidebarToggle = (event: CustomEvent) => {
      setIsSidebarOpen(event.detail.isOpen);
    };

    // Add event listener
    window.addEventListener('sidebar-toggle' as any, handleSidebarToggle);

    // Clean up
    return () => {
      window.removeEventListener('sidebar-toggle' as any, handleSidebarToggle);
    };
  }, []);

  return (
    <div className={`min-h-screen bg-background text-foreground ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Navigation />
      <div className="main-content">
        <div className="flex justify-center w-full">
          <div className="w-full max-w-7xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
