import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Package, ChevronLeft, Leaf, Trash2, AlertTriangle } from 'lucide-react';

interface BagWithReview {
  id: string;
  qr_code: string;
  activated_at: string;
  status: string;
  review?: {
    status: string;
    points_awarded: number;
    notes: string | null;
    disapproval_reason: string | null;
    reviewed_at: string;
  };
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bags, setBags] = useState<BagWithReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchBags = async () => {
      const { data: bagsData } = await supabase
        .from('bags')
        .select('*')
        .eq('household_id', user.id)
        .order('activated_at', { ascending: false });

      if (bagsData) {
        // Fetch reviews for each bag
        const bagsWithReviews = await Promise.all(
          bagsData.map(async (bag) => {
            const { data: review } = await supabase
              .from('bag_reviews')
              .select('*')
              .eq('bag_id', bag.id)
              .maybeSingle();

            return {
              ...bag,
              review: review || undefined
            };
          })
        );

        setBags(bagsWithReviews);
      }
      setLoading(false);
    };

    fetchBags();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'receiver_approved':
        return <CheckCircle className="w-5 h-5 text-primary" />;
      case 'disapproved':
      case 'receiver_disapproved':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'receiver_approved':
        return 'Verified ✓';
      case 'disapproved':
        return 'Disapproved';
      case 'receiver_disapproved':
        return 'Rejected';
      default:
        return 'Pending Review';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'receiver_approved':
        return 'bg-primary/10 text-primary';
      case 'disapproved':
      case 'receiver_disapproved':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getBagTypeInfo = (qrCode: string) => {
    if (qrCode.startsWith('WWR')) {
      return { type: 'Recyclable', color: 'bg-blue-600', textColor: 'text-blue-600', icon: Leaf, points: 15 };
    } else if (qrCode.startsWith('WWO')) {
      return { type: 'Biodegradable', color: 'bg-green-600', textColor: 'text-green-600', icon: Trash2, points: 5 };
    } else if (qrCode.startsWith('WWS')) {
      return { type: 'Residual', color: 'bg-destructive', textColor: 'text-destructive', icon: AlertTriangle, points: 1 };
    }
    return { type: 'Unknown', color: 'bg-muted', textColor: 'text-muted-foreground', icon: Package, points: 0 };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      <header className="flex items-center gap-3 p-4 bg-card border-b border-border">
        <Button variant="outline" size="icon" onClick={() => navigate('/auth')}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Bag History</h1>
          <p className="text-sm text-muted-foreground">Track your activated bags</p>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {bags.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No bags yet</h3>
            <p className="text-muted-foreground text-sm">Activate your first bag to see it here</p>
          </div>
        ) : (
          bags.map((bag) => {
            const bagTypeInfo = getBagTypeInfo(bag.qr_code);
            const BagIcon = bagTypeInfo.icon;
            return (
              <Card key={bag.id} className={`border-l-4`} style={{ borderLeftColor: bagTypeInfo.color.includes('blue') ? '#2563eb' : bagTypeInfo.color.includes('green') ? '#16a34a' : bagTypeInfo.color.includes('destructive') ? 'hsl(var(--destructive))' : '#6b7280' }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${bagTypeInfo.color}`}>
                          <BagIcon className="w-3 h-3 text-white" />
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${bagTypeInfo.color} text-white`}>
                          {bagTypeInfo.type} ({bagTypeInfo.points} pts)
                        </span>
                      </div>
                      <p className="font-mono text-sm text-foreground">{bag.qr_code}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Activated {new Date(bag.activated_at).toLocaleDateString()}
                      </p>
                      {bag.review?.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          Note: "{bag.review.notes}"
                        </p>
                      )}
                      {bag.review?.disapproval_reason && (
                        <p className="text-xs text-destructive mt-2">
                          Reason: {bag.review.disapproval_reason}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bag.status)}`}>
                        {getStatusIcon(bag.status)}
                        <span>{getStatusText(bag.status)}</span>
                      </div>
                      {bag.status === 'approved' && bag.review && (
                        <span className={`text-sm font-semibold ${bagTypeInfo.textColor}`}>
                          +{bag.review.points_awarded} pts
                        </span>
                      )}
                      {(bag.status === 'disapproved' || bag.status === 'receiver_disapproved') && (
                        <span className="text-sm font-semibold text-destructive">
                          0 pts
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}