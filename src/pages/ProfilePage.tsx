import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, MapPin, Phone, Calendar, LogOut, Star, Home, Truck, ChevronLeft } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, role, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      <header className="p-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/auth')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground">Your account details</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent rounded-full">
            {role === 'collector' ? <Truck className="w-4 h-4 text-primary" /> : <Home className="w-4 h-4 text-primary" />}
            <span className="font-medium text-foreground capitalize">{role}</span>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">{profile?.name || 'User'}</h3>
                <p className="text-sm text-muted-foreground capitalize">{role} Account</p>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              {profile?.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{profile.phone}</span>
                </div>
              )}
              {profile?.location && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{profile.location}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {role === 'household' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-xl font-bold text-foreground">{profile?.total_points || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Button variant="outline" onClick={handleLogout} className="w-full border-destructive text-destructive hover:bg-destructive/10">
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
