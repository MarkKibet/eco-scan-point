export type BagType = 'recyclable' | 'general';

export interface User {
  id: string;
  phone: string;
  name: string;
  location: string;
  totalPoints: number;
  createdAt: Date;
}

export interface ScanRecord {
  id: string;
  userId: string;
  qrCode: string;
  bagType: BagType;
  pointsEarned: number;
  timestamp: Date;
  synced: boolean;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: 'airtime' | 'voucher' | 'token';
  icon: string;
  available: boolean;
}

export interface Redemption {
  id: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
}

export interface RecyclingTip {
  id: string;
  title: string;
  content: string;
  icon: string;
}
