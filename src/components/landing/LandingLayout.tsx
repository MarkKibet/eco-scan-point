import { ReactNode } from 'react';
import LandingNavbar from './LandingNavbar';
import LandingFooter from './LandingFooter';

interface LandingLayoutProps {
  children: ReactNode;
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />
      <main className="flex-1 pt-16 md:pt-20">
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}
