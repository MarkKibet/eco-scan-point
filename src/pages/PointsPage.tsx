import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Recycle, Trash2, Calendar, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function PointsPage() {
  const navigate = useNavigate();
  const { user, scans } = useApp();

  const totalRecyclable = scans.filter(s => s.bagType === 'recyclable').length;
  const totalGeneral = scans.filter(s => s.bagType === 'general').length;

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 bg-card border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Points Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track your eco-contributions</p>
        </div>
      </header>

      <div className="p-4">
        {/* Total Points Card */}
        <Card className="bg-gradient-to-br from-points-gold to-yellow-500 border-0 mb-6">
          <CardContent className="p-6 text-center text-primary-foreground">
            <Award className="w-12 h-12 mx-auto mb-2 opacity-90" />
            <p className="text-sm opacity-90">Total Points</p>
            <p className="text-4xl font-bold">{user?.totalPoints.toLocaleString() || 0}</p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Recycle className="w-8 h-8 mx-auto mb-2 text-recyclable" />
              <p className="text-2xl font-bold text-foreground">{totalRecyclable}</p>
              <p className="text-sm text-muted-foreground">Recyclables</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trash2 className="w-8 h-8 mx-auto mb-2 text-general-waste" />
              <p className="text-2xl font-bold text-foreground">{totalGeneral}</p>
              <p className="text-sm text-muted-foreground">General Waste</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Activity
          </h2>

          {scans.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No scans yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start scanning bags to earn points!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {scans.slice(0, 10).map((scan) => (
                <Card key={scan.id} className="animate-slide-up">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        scan.bagType === 'recyclable' ? 'bg-recyclable-bg' : 'bg-general-waste-bg'
                      }`}>
                        {scan.bagType === 'recyclable' ? (
                          <Recycle className="w-5 h-5 text-recyclable" />
                        ) : (
                          <Trash2 className="w-5 h-5 text-general-waste" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground capitalize">
                          {scan.bagType === 'recyclable' ? 'Recyclable' : 'General Waste'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(scan.timestamp), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">+{scan.pointsEarned}</p>
                      {!scan.synced && (
                        <p className="text-xs text-muted-foreground">Pending sync</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}