import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Scan, History, Gift, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScanButton } from '@/components/ScanButton';

export default function HomePage() {
  const { profile, role } = useAuth();
  const navigate = useNavigate();
  const isCollector = role === 'collector';

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      <header className="p-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Hello, {profile?.name || 'User'}</h1>
            <p className="text-sm text-muted-foreground capitalize">{role || 'Loading...'}</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {!isCollector && (
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
        )}

        <div className="grid grid-cols-2 gap-3">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/scan')}>
            <CardContent className="p-4 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-2">
                <Scan className="w-6 h-6 text-primary" />
              </div>
              <p className="font-medium text-foreground text-sm">{isCollector ? 'Review Bag' : 'Activate Bag'}</p>
            </CardContent>
          </Card>

          {!isCollector ? (
            <>
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
          ) : (
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/reviews')}>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium text-foreground text-sm">My Reviews</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <ScanButton />
    </div>
  );
}
