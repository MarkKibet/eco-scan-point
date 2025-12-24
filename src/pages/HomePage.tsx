import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Recycle, Scan, History, Gift, TrendingUp, Users, QrCode, BarChart3, LogOut, Info, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScanButton } from '@/components/ScanButton';
import RecyclingGuide from '@/components/RecyclingGuide';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function HomePage() {
  const { profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [showGuide, setShowGuide] = useState(false);
  
  const isCollector = role === 'collector';
  const isAdmin = role === 'admin';
  const isHousehold = role === 'household';
  const isReceiver = role === 'receiver';

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      <header className="p-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Recycle className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Hello, {profile?.name || 'User'}</h1>
            <p className="text-sm text-muted-foreground capitalize">{role || 'Loading...'}</p>
          </div>
          {(isHousehold || isCollector || isReceiver) && (
            <Dialog open={showGuide} onOpenChange={setShowGuide}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Sorting Guide</DialogTitle>
                </DialogHeader>
                <RecyclingGuide />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      <div className="p-4 space-y-4">
        {isHousehold && (
          <>
            <Card className="bg-gradient-to-br from-primary to-primary/80">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-foreground/80 text-sm">Your Points</p>
                    <p className="text-3xl font-bold text-primary-foreground">{profile?.total_points || 0}</p>
                  </div>
                  <div className="w-14 h-14 bg-primary-foreground/20 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-primary-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Compact Recycling Guide */}
            <RecyclingGuide compact />
          </>
        )}

        {isCollector && (
          <RecyclingGuide compact />
        )}

        <div className="grid grid-cols-2 gap-3">
          {/* Admin actions */}
          {isAdmin && (
            <>
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/admin')}>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-2">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium text-foreground text-sm">Dashboard</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/qr-generator')}>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-2">
                    <QrCode className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium text-foreground text-sm">Generate QR</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/reviews')}>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-2">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium text-foreground text-sm">View Reviews</p>
                </CardContent>
              </Card>
            </>
          )}

          {/* Collector actions */}
          {isCollector && (
            <>
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/scan')}>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-2">
                    <Scan className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium text-foreground text-sm">Review Bag</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/reviews')}>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-2">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium text-foreground text-sm">My Reviews</p>
                </CardContent>
              </Card>
            </>
          )}

          {/* Receiver actions */}
          {isReceiver && (
            <>
              <Card className="cursor-pointer hover:border-amber-500 transition-colors" onClick={() => navigate('/scan')}>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-2">
                    <Scan className="w-6 h-6 text-amber-600" />
                  </div>
                  <p className="font-medium text-foreground text-sm">Verify Review</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-amber-500 transition-colors" onClick={() => navigate('/reviews')}>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-2">
                    <History className="w-6 h-6 text-amber-600" />
                  </div>
                  <p className="font-medium text-foreground text-sm">My Verifications</p>
                </CardContent>
            </Card>
            </>
          )}

          {/* Household actions */}
          {isHousehold && (
            <>
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/scan')}>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-2">
                    <Scan className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium text-foreground text-sm">Activate Bag</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-purple-500 transition-colors" onClick={() => navigate('/trash-scanner')}>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-2">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="font-medium text-foreground text-sm">AI Sorter</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/history')}>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-2">
                    <History className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium text-foreground text-sm">View History</p>
                </CardContent>
              </Card>
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/rewards')}>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-2">
                    <Gift className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium text-foreground text-sm">Rewards</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
      {(isHousehold || isCollector || isReceiver) && <ScanButton />}
    </div>
  );
}