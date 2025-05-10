import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Toaster } from '@/components/ui/toaster';

interface MainLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  showFooter = true,
  className = 'bg-neutral-50'
}) => {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      {showFooter && <Footer />}
      <Toaster />
    </div>
  );
};

export default MainLayout;
