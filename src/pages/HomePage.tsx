import { useApp } from '@/context/AppContext';
import { PointsBadge } from '@/components/PointsBadge';
import { ScanButton } from '@/components/ScanButton';
import { RecyclingTips } from '@/components/RecyclingTips';
import { Leaf, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const { user, pendingScans } = useApp();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4 animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-eco">
            <Leaf className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">EcoSort</h1>
            <p className="text-sm text-muted-foreground">Hello, {user?.name || 'Guest'}!</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isOnline && (
            <div className="flex items-center gap-1 text-muted-foreground text-xs bg-muted px-2 py-1 rounded-full">
              <WifiOff className="w-3 h-3" />
              <span>Offline</span>
            </div>
          )}
          {pendingScans.length > 0 && (
            <div className="bg-points-gold-bg text-points-gold text-xs px-2 py-1 rounded-full">
              {pendingScans.length} pending
            </div>
          )}
        </div>
      </header>

      {/* Points Card */}
      <div className="bg-gradient-to-br from-primary to-eco-leaf rounded-3xl p-6 mb-8 text-primary-foreground shadow-eco-lg">
        <p className="text-sm opacity-90 mb-1">Your Points</p>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold">{user?.totalPoints.toLocaleString() || 0}</span>
          <span className="text-lg opacity-80">pts</span>
        </div>
        <p className="text-sm opacity-80 mt-2">
          Keep sorting to earn more rewards!
        </p>
      </div>

      {/* Scan Button */}
      <div className="flex justify-center mb-8">
        <ScanButton />
      </div>

      {/* Tips Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <span>💡</span> Recycling Tips
        </h2>
        <RecyclingTips />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-recyclable-bg rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-recyclable">♻️</div>
          <p className="text-sm font-medium text-foreground mt-1">Recyclables</p>
          <p className="text-xs text-muted-foreground">+15 pts each</p>
        </div>
        <div className="bg-general-waste-bg rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-general-waste">🗑️</div>
          <p className="text-sm font-medium text-foreground mt-1">General Waste</p>
          <p className="text-xs text-muted-foreground">+5 pts each</p>
        </div>
      </div>
    </div>
  );
}
