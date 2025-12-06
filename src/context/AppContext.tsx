import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, ScanRecord, Reward, Redemption, BagType } from '@/types';

interface AppContextType {
  user: User | null;
  isAuthenticated: boolean;
  scans: ScanRecord[];
  rewards: Reward[];
  redemptions: Redemption[];
  login: (phone: string, name: string, location: string) => void;
  logout: () => void;
  addScan: (qrCode: string, bagType: BagType) => number;
  redeemReward: (rewardId: string) => boolean;
  pendingScans: ScanRecord[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const POINTS_CONFIG = {
  recyclable: 15,
  general: 5,
};

const MOCK_REWARDS: Reward[] = [
  { id: '1', title: '₦100 Airtime', description: 'Any network', pointsCost: 100, category: 'airtime', icon: '📱', available: true },
  { id: '2', title: '₦500 Airtime', description: 'Any network', pointsCost: 450, category: 'airtime', icon: '📱', available: true },
  { id: '3', title: 'Shopping Voucher', description: '₦1000 store credit', pointsCost: 800, category: 'voucher', icon: '🛒', available: true },
  { id: '4', title: 'Eco Token', description: 'Trade or gift', pointsCost: 200, category: 'token', icon: '🌱', available: true },
  { id: '5', title: 'Coffee Voucher', description: 'Free coffee at partner cafes', pointsCost: 150, category: 'voucher', icon: '☕', available: true },
  { id: '6', title: '₦2000 Airtime', description: 'Any network', pointsCost: 1600, category: 'airtime', icon: '📱', available: true },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ecoSortUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [scans, setScans] = useState<ScanRecord[]>(() => {
    const saved = localStorage.getItem('ecoSortScans');
    return saved ? JSON.parse(saved) : [];
  });

  const [redemptions, setRedemptions] = useState<Redemption[]>(() => {
    const saved = localStorage.getItem('ecoSortRedemptions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('ecoSortUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('ecoSortUser');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('ecoSortScans', JSON.stringify(scans));
  }, [scans]);

  useEffect(() => {
    localStorage.setItem('ecoSortRedemptions', JSON.stringify(redemptions));
  }, [redemptions]);

  const login = (phone: string, name: string, location: string) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      phone,
      name,
      location,
      totalPoints: 0,
      createdAt: new Date(),
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    setScans([]);
    setRedemptions([]);
    localStorage.removeItem('ecoSortUser');
    localStorage.removeItem('ecoSortScans');
    localStorage.removeItem('ecoSortRedemptions');
  };

  const addScan = (qrCode: string, bagType: BagType): number => {
    if (!user) return 0;

    const existingScan = scans.find(s => s.qrCode === qrCode);
    if (existingScan) return 0;

    const pointsEarned = POINTS_CONFIG[bagType];
    
    const newScan: ScanRecord = {
      id: `scan_${Date.now()}`,
      userId: user.id,
      qrCode,
      bagType,
      pointsEarned,
      timestamp: new Date(),
      synced: navigator.onLine,
    };

    setScans(prev => [newScan, ...prev]);
    setUser(prev => prev ? { ...prev, totalPoints: prev.totalPoints + pointsEarned } : null);

    return pointsEarned;
  };

  const redeemReward = (rewardId: string): boolean => {
    if (!user) return false;

    const reward = MOCK_REWARDS.find(r => r.id === rewardId);
    if (!reward || user.totalPoints < reward.pointsCost) return false;

    const newRedemption: Redemption = {
      id: `redemption_${Date.now()}`,
      userId: user.id,
      rewardId,
      pointsSpent: reward.pointsCost,
      status: 'completed',
      timestamp: new Date(),
    };

    setRedemptions(prev => [newRedemption, ...prev]);
    setUser(prev => prev ? { ...prev, totalPoints: prev.totalPoints - reward.pointsCost } : null);

    return true;
  };

  const pendingScans = scans.filter(s => !s.synced);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        scans,
        rewards: MOCK_REWARDS,
        redemptions,
        login,
        logout,
        addScan,
        redeemReward,
        pendingScans,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
