import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PointsBadge } from '@/components/PointsBadge';
import { Gift, Check, X, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function RewardsPage() {
  const navigate = useNavigate();
  const { user, rewards, redeemReward } = useApp();
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleRedeemClick = (rewardId: string) => {
    setSelectedReward(rewardId);
    setIsConfirmOpen(true);
  };

  const handleConfirmRedeem = () => {
    if (!selectedReward) return;

    const success = redeemReward(selectedReward);
    if (success) {
      const reward = rewards.find(r => r.id === selectedReward);
      toast.success(`Successfully redeemed ${reward?.title}!`);
    } else {
      toast.error('Not enough points to redeem this reward');
    }
    setIsConfirmOpen(false);
    setSelectedReward(null);
  };

  const selected = rewards.find(r => r.id === selectedReward);

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 bg-card border-b border-border">
        <Button variant="outline" size="icon" onClick={() => navigate('/auth')}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">Rewards Store</h1>
          <p className="text-sm text-muted-foreground">Redeem your eco-points</p>
        </div>
        <PointsBadge points={user?.totalPoints || 0} size="lg" />
      </header>

      {/* Rewards Grid */}
      <div className="p-4 grid gap-4">
        {rewards.map((reward) => {
          const canAfford = (user?.totalPoints || 0) >= reward.pointsCost;
          
          return (
            <Card
              key={reward.id}
              className={`transition-all ${
                canAfford ? 'hover:shadow-eco' : 'opacity-60'
              }`}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-14 h-14 bg-eco-green-light rounded-2xl flex items-center justify-center text-2xl">
                  {reward.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{reward.title}</h3>
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
                  onClick={() => handleRedeemClick(reward.id)}
                >
                  Redeem
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Confirm Redemption
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to redeem this reward?
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
              <div className="w-12 h-12 bg-eco-green-light rounded-xl flex items-center justify-center text-xl">
                {selected.icon}
              </div>
              <div>
                <p className="font-semibold text-foreground">{selected.title}</p>
                <p className="text-sm text-muted-foreground">{selected.pointsCost} points</p>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
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
        </DialogContent>
      </Dialog>
    </div>
  );
}