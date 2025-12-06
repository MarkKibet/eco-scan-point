import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, Scan, History, Gift, TrendingUp, Users, QrCode, X, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScanButton } from '@/components/ScanButton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function HomePage() {
  const { profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const isCollector = role === 'collector';
  const isAdmin = role === 'admin';
  const isHousehold = role === 'household';

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  const handleLogoClick = () => {
    if (!isAdmin) {
      setShowAdminLogin(true);
    }
  };

  const handleAdminLogin = async () => {
    setAdminLoading(true);
    
    // Hardcoded admin credentials
    const adminPhone = '0717151928';
    const adminPassword = 'Eco@123';
    const adminEmail = `${adminPhone}@ecosort.local`;

    // Sign out current user first if logged in
    if (profile) {
      await signOut();
    }

    // Try to sign in as admin
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });

    if (signInError) {
      // If admin doesn't exist, create the account
      if (signInError.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: adminEmail,
          password: adminPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              name: 'System Admin',
              phone: adminPhone,
              role: 'admin'
            }
          }
        });

        if (signUpError) {
          toast.error('Admin login failed');
          setAdminLoading(false);
          return;
        }

        toast.success('Admin account created & logged in!');
      } else {
        toast.error('Admin login failed');
        setAdminLoading(false);
        return;
      }
    } else {
      toast.success('Logged in as Admin!');
    }

    setAdminLoading(false);
    setShowAdminLogin(false);
    // Force reload to refresh auth state
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      <header className="p-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLogoClick}
            className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Hello, {profile?.name || 'User'}</h1>
            <p className="text-sm text-muted-foreground capitalize">{role || 'Loading...'}</p>
          </div>
        </div>
      </header>

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm animate-scale-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Admin Access</h2>
                </div>
                <button onClick={() => setShowAdminLogin(false)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                This will log you in as the system administrator.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAdminLogin(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAdminLogin} disabled={adminLoading} className="flex-1">
                  {adminLoading ? 'Logging in...' : 'Login as Admin'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="p-4 space-y-4">
        {isHousehold && (
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
          {/* Admin actions */}
          {isAdmin && (
            <>
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => navigate('/qr-generator')}>
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center mb-2">
                    <QrCode className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium text-foreground text-sm">Generate QR Codes</p>
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
      {(isHousehold || isCollector) && <ScanButton />}
    </div>
  );
}