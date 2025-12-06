import { Home, Gift, History, User, ClipboardList } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function BottomNav() {
  const { role } = useAuth();
  const isCollector = role === 'collector';

  const householdItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/history', icon: History, label: 'History' },
    { to: '/rewards', icon: Gift, label: 'Rewards' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const collectorItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/reviews', icon: ClipboardList, label: 'Reviews' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const navItems = isCollector ? collectorItems : householdItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-inset-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]',
                isActive ? 'text-primary bg-accent' : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
