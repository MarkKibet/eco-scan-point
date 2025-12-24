import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PointsBadge } from '@/components/PointsBadge';
import { 
  Gift, 
  Check, 
  X, 
  ChevronLeft, 
  Smartphone, 
  Zap, 
  ShoppingCart, 
  Loader2,
  CheckCircle2,
  Copy,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type RedemptionStep = 'select' | 'confirm' | 'processing' | 'success';

interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: 'airtime' | 'tokens' | 'points';
  icon: React.ReactNode;
  brand: string;
  brandColor: string;
  requiresPhone?: boolean;
  requiresMeter?: boolean;
}

const KENYAN_REWARDS: Reward[] = [
  { 
    id: 'saf-50', 
    title: 'KSh 50 Airtime', 
    description: 'Safaricom prepaid airtime',
    pointsCost: 50, 
    category: 'airtime', 
    icon: <Smartphone className="w-6 h-6" />,
    brand: 'Safaricom',
    brandColor: 'bg-green-500',
    requiresPhone: true
  },
  { 
    id: 'saf-100', 
    title: 'KSh 100 Airtime', 
    description: 'Safaricom prepaid airtime',
    pointsCost: 100, 
    category: 'airtime', 
    icon: <Smartphone className="w-6 h-6" />,
    brand: 'Safaricom',
    brandColor: 'bg-green-500',
    requiresPhone: true
  },
  { 
    id: 'saf-250', 
    title: 'KSh 250 Airtime', 
    description: 'Safaricom prepaid airtime',
    pointsCost: 250, 
    category: 'airtime', 
    icon: <Smartphone className="w-6 h-6" />,
    brand: 'Safaricom',
    brandColor: 'bg-green-500',
    requiresPhone: true
  },
  { 
    id: 'kplc-100', 
    title: 'KSh 100 KPLC Tokens', 
    description: 'Kenya Power prepaid electricity',
    pointsCost: 100, 
    category: 'tokens', 
    icon: <Zap className="w-6 h-6" />,
    brand: 'KPLC',
    brandColor: 'bg-orange-500',
    requiresMeter: true
  },
  { 
    id: 'kplc-250', 
    title: 'KSh 250 KPLC Tokens', 
    description: 'Kenya Power prepaid electricity',
    pointsCost: 250, 
    category: 'tokens', 
    icon: <Zap className="w-6 h-6" />,
    brand: 'KPLC',
    brandColor: 'bg-orange-500',
    requiresMeter: true
  },
  { 
    id: 'kplc-500', 
    title: 'KSh 500 KPLC Tokens', 
    description: 'Kenya Power prepaid electricity',
    pointsCost: 500, 
    category: 'tokens', 
    icon: <Zap className="w-6 h-6" />,
    brand: 'KPLC',
    brandColor: 'bg-orange-500',
    requiresMeter: true
  },
  { 
    id: 'naivas-100', 
    title: '100 Naivas Points', 
    description: 'Convert to Naivas loyalty points',
    pointsCost: 100, 
    category: 'points', 
    icon: <ShoppingCart className="w-6 h-6" />,
    brand: 'Naivas',
    brandColor: 'bg-red-500',
    requiresPhone: true
  },
  { 
    id: 'naivas-250', 
    title: '250 Naivas Points', 
    description: 'Convert to Naivas loyalty points',
    pointsCost: 250, 
    category: 'points', 
    icon: <ShoppingCart className="w-6 h-6" />,
    brand: 'Naivas',
    brandColor: 'bg-red-500',
    requiresPhone: true
  },
];

// Generate mock token/voucher codes
const generateMockCode = (type: string): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default function RewardsPage() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [step, setStep] = useState<RedemptionStep>('select');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [meterNumber, setMeterNumber] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [userPoints, setUserPoints] = useState(profile?.total_points || 0);

  // Sync userPoints with profile when profile updates
  useEffect(() => {
    if (profile?.total_points !== undefined) {
      setUserPoints(profile.total_points);
    }
  }, [profile?.total_points]);

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward);
    setStep('confirm');
    setPhoneNumber('');
    setMeterNumber('');
  };

  const validateInput = (): boolean => {
    if (selectedReward?.requiresPhone && !phoneNumber.match(/^(07|01)\d{8}$/)) {
      toast.error('Please enter a valid Kenyan phone number (e.g., 0712345678)');
      return false;
    }
    if (selectedReward?.requiresMeter && !meterNumber.match(/^\d{10,14}$/)) {
      toast.error('Please enter a valid KPLC meter number (10-14 digits)');
      return false;
    }
    return true;
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward || !profile || !user) {
      console.log('Missing data:', { selectedReward: !!selectedReward, profile: !!profile, user: !!user });
      toast.error('Please log in to redeem rewards');
      return;
    }
    if (!validateInput()) return;

    if (userPoints < selectedReward.pointsCost) {
      toast.error('Not enough points to redeem this reward');
      return;
    }

    setStep('processing');

    // Simulate API processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Deduct points from database
    const newPoints = Math.max(0, userPoints - selectedReward.pointsCost);
    
    console.log('Attempting to update points:', { userId: user.id, currentPoints: userPoints, newPoints, cost: selectedReward.pointsCost });
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ total_points: newPoints })
      .eq('id', user.id)
      .select();

    console.log('Update result:', { data, error });

    if (error) {
      console.error('Error deducting points:', error);
      toast.error('Failed to process redemption. Please try again.');
      setStep('confirm');
      return;
    }

    if (!data || data.length === 0) {
      console.error('No rows updated - possible RLS issue');
      toast.error('Failed to update points. Please try again.');
      setStep('confirm');
      return;
    }

    // Update local state
    setUserPoints(newPoints);
    toast.success(`${selectedReward.pointsCost} points deducted successfully!`);

    // Generate mock confirmation
    const code = generateMockCode(selectedReward.category);
    setGeneratedCode(code);
    
    setStep('success');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success('Code copied to clipboard!');
  };

  const handleClose = () => {
    setSelectedReward(null);
    setStep('select');
    setPhoneNumber('');
    setMeterNumber('');
    setGeneratedCode('');
  };

  const handleNewRedemption = () => {
    handleClose();
  };

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 bg-card border-b border-border">
        <Button variant="outline" size="icon" onClick={() => navigate('/')}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Rewards Store</h1>
          <p className="text-sm text-muted-foreground">Redeem your eco-points</p>
        </div>
        <PointsBadge points={userPoints} size="lg" />
      </header>

      {/* Category Tabs */}
      <div className="p-4 border-b border-border">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button variant="outline" size="sm" className="whitespace-nowrap border-green-500 text-green-600">
            <Smartphone className="w-4 h-4 mr-1" /> Airtime
          </Button>
          <Button variant="outline" size="sm" className="whitespace-nowrap border-orange-500 text-orange-600">
            <Zap className="w-4 h-4 mr-1" /> KPLC Tokens
          </Button>
          <Button variant="outline" size="sm" className="whitespace-nowrap border-red-500 text-red-600">
            <ShoppingCart className="w-4 h-4 mr-1" /> Naivas Points
          </Button>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="p-4 grid gap-4">
        {KENYAN_REWARDS.map((reward) => {
          const canAfford = userPoints >= reward.pointsCost;
          
          return (
            <Card
              key={reward.id}
              className={`transition-all border-l-4 ${
                canAfford ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'
              }`}
              style={{ borderLeftColor: reward.brandColor.includes('green') ? '#22c55e' : reward.brandColor.includes('orange') ? '#f97316' : '#ef4444' }}
              onClick={() => canAfford && handleRedeemClick(reward)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-14 h-14 ${reward.brandColor} rounded-2xl flex items-center justify-center text-white`}>
                  {reward.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${reward.brandColor} text-white`}>
                      {reward.brand}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mt-1">{reward.title}</h3>
                  <p className="text-sm text-muted-foreground">{reward.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <PointsBadge points={reward.pointsCost} size="sm" showIcon={false} />
                    <span className="text-xs text-muted-foreground">points</span>
                  </div>
                </div>
                <Button
                  variant={canAfford ? 'default' : 'secondary'}
                  size="sm"
                  disabled={!canAfford}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRedeemClick(reward);
                  }}
                >
                  Redeem
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Redemption Dialog */}
      <Dialog open={!!selectedReward} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-sm mx-auto">
          {step === 'confirm' && selectedReward && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  Redeem Reward
                </DialogTitle>
                <DialogDescription>
                  Enter your details to complete redemption
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                <div className={`w-12 h-12 ${selectedReward.brandColor} rounded-xl flex items-center justify-center text-white`}>
                  {selectedReward.icon}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedReward.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedReward.pointsCost} points</p>
                </div>
              </div>

              <div className="space-y-4">
                {selectedReward.requiresPhone && (
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {selectedReward.category === 'points' ? 'Naivas Registered Phone' : 'Phone Number'}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      maxLength={10}
                    />
                    <p className="text-xs text-muted-foreground">
                      {selectedReward.category === 'airtime' 
                        ? 'Airtime will be sent to this number'
                        : 'Points will be added to your Naivas loyalty account'
                      }
                    </p>
                  </div>
                )}

                {selectedReward.requiresMeter && (
                  <div className="space-y-2">
                    <Label htmlFor="meter" className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      KPLC Meter Number
                    </Label>
                    <Input
                      id="meter"
                      type="text"
                      placeholder="Enter meter number"
                      value={meterNumber}
                      onChange={(e) => setMeterNumber(e.target.value.replace(/\D/g, ''))}
                      maxLength={14}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your prepaid electricity meter number (10-14 digits)
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Balance after redemption:</strong> {userPoints - selectedReward.pointsCost} points
                </p>
              </div>

              <DialogFooter className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleConfirmRedeem} className="flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  Confirm
                </Button>
              </DialogFooter>
            </>
          )}

          {step === 'processing' && selectedReward && (
            <div className="py-12 text-center">
              <div className={`w-20 h-20 ${selectedReward.brandColor} rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse`}>
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Processing...</h3>
              <p className="text-muted-foreground text-sm">
                {selectedReward.category === 'airtime' && 'Sending airtime to your phone...'}
                {selectedReward.category === 'tokens' && 'Generating KPLC tokens...'}
                {selectedReward.category === 'points' && 'Adding points to Naivas account...'}
              </p>
            </div>
          )}

          {step === 'success' && selectedReward && (
            <div className="py-6 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Redemption Successful!</h3>
              <p className="text-muted-foreground text-sm mb-6">
                {selectedReward.category === 'airtime' && `KSh ${selectedReward.title.match(/\d+/)?.[0]} airtime sent to ${phoneNumber}`}
                {selectedReward.category === 'tokens' && 'Your KPLC token is ready'}
                {selectedReward.category === 'points' && `Points added to Naivas account (${phoneNumber})`}
              </p>

              {selectedReward.category === 'tokens' && (
                <div className="bg-muted p-4 rounded-xl mb-6">
                  <p className="text-xs text-muted-foreground mb-2">Your KPLC Token</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-lg font-mono font-bold text-foreground tracking-wider">
                      {generatedCode}
                    </code>
                    <Button variant="ghost" size="icon" onClick={handleCopyCode}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter this token on your meter
                  </p>
                </div>
              )}

              {selectedReward.category === 'airtime' && (
                <div className="bg-green-50 p-4 rounded-xl mb-6 border border-green-200">
                  <p className="text-sm text-green-800">
                    You will receive an SMS confirmation from Safaricom shortly
                  </p>
                </div>
              )}

              {selectedReward.category === 'points' && (
                <div className="bg-red-50 p-4 rounded-xl mb-6 border border-red-200">
                  <p className="text-sm text-red-800">
                    Show your phone number at Naivas checkout to use your points
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Close
                </Button>
                <Button onClick={handleNewRedemption} className="flex-1">
                  <Gift className="w-4 h-4 mr-2" />
                  Redeem More
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
