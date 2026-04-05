import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ClipboardList, ChevronLeft, Package, Leaf, Trash2 } from 'lucide-react';

interface ReviewWithHousehold {
  id: string;
  status: string;
  points_awarded: number;
  notes: string | null;
  reviewed_at: string;
  weight_kg: number | null;
  bag: {
    qr_code: string;
    bag_type: string | null;
  };
  household: {
    name: string;
    location: string | null;
  } | null;
}

interface WeightStats {
  total: number;
  recyclable: number;
  organic: number;
  residual: number;
  totalBags: number;
  approved: number;
  disapproved: number;
}

export default function CollectorReviewsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithHousehold[]>([]);
  const [loading, setLoading] = useState(true);
  const [weightStats, setWeightStats] = useState<WeightStats>({ total: 0, recyclable: 0, organic: 0, residual: 0, totalBags: 0, approved: 0, disapproved: 0 });

  useEffect(() => {
    if (!user) return;

    const fetchReviews = async () => {
      const { data: reviewsData } = await supabase
        .from('bag_reviews')
        .select('*, bags(*)')
        .eq('collector_id', user.id)
        .order('reviewed_at', { ascending: false });

      if (reviewsData) {
        const reviewsWithHouseholds = await Promise.all(
          reviewsData.map(async (review) => {
            const bag = review.bags as { qr_code: string; household_id: string; bag_type: string | null };
            const { data: household } = await supabase
              .from('profiles')
              .select('name, location')
              .eq('id', bag.household_id)
              .maybeSingle();

            return {
              id: review.id,
              status: review.status,
              points_awarded: review.points_awarded,
              notes: review.notes,
              reviewed_at: review.reviewed_at,
              weight_kg: review.weight_kg,
              bag: { qr_code: bag.qr_code, bag_type: bag.bag_type },
              household
            };
          })
        );

        setReviews(reviewsWithHouseholds);

        // Calculate weight stats
        let total = 0, recyclable = 0, organic = 0, residual = 0;
        let approved = 0, disapproved = 0;
        reviewsData.forEach((r) => {
          const w = Number(r.weight_kg) || 0;
          total += w;
          const bag = r.bags as { bag_type: string | null; qr_code: string };
          if (bag.bag_type === 'recyclable' || bag.qr_code?.startsWith('WWR')) recyclable += w;
          else if (bag.bag_type === 'biodegradable' || bag.bag_type === 'organic' || bag.qr_code?.startsWith('WWO')) organic += w;
          else if (bag.bag_type === 'residual' || bag.qr_code?.startsWith('WWS')) residual += w;
          if (r.status === 'approved') approved++;
          else if (r.status === 'disapproved') disapproved++;
        });
        setWeightStats({
          total: Math.round(total * 100) / 100,
          recyclable: Math.round(recyclable * 100) / 100,
          organic: Math.round(organic * 100) / 100,
          residual: Math.round(residual * 100) / 100,
          totalBags: reviewsData.length,
          approved,
          disapproved
        });
      }
      setLoading(false);
    };

    fetchReviews();
  }, [user]);

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
          <h1 className="text-xl font-bold text-foreground">My Reviews</h1>
          <p className="text-sm text-muted-foreground">Bags you've reviewed</p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Weight & Stats Summary */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Package className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold">{weightStats.totalBags}</p>
              <p className="text-xs text-muted-foreground">Bags Reviewed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Package className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold">{weightStats.total} kg</p>
              <p className="text-xs text-muted-foreground">Total Weight</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <CheckCircle className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold">{weightStats.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <XCircle className="w-5 h-5 text-destructive mx-auto mb-1" />
              <p className="text-xl font-bold">{weightStats.disapproved}</p>
              <p className="text-xs text-muted-foreground">Disapproved</p>
            </CardContent>
          </Card>
        </div>

        {/* Weight Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Weight by Bag Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="text-sm text-muted-foreground">Recyclables</span>
              </div>
              <span className="text-sm font-bold text-blue-600">{weightStats.recyclable} kg</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-600" />
                <span className="text-sm text-muted-foreground">Biodegradables</span>
              </div>
              <span className="text-sm font-bold text-green-600">{weightStats.organic} kg</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-900 dark:bg-gray-500" />
                <span className="text-sm text-muted-foreground">Residuals</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-gray-300">{weightStats.residual} kg</span>
            </div>
          </CardContent>
        </Card>

        {/* Reviews List */}
        <h3 className="text-sm font-semibold text-foreground">Review History</h3>
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No reviews yet</h3>
            <p className="text-muted-foreground text-sm">Start scanning bags to review them</p>
          </div>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{review.household?.name || 'Unknown Household'}</p>
                    {review.household?.location && (
                      <p className="text-xs text-muted-foreground">{review.household.location}</p>
                    )}
                    <p className="font-mono text-xs text-muted-foreground mt-1">{review.bag.qr_code}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground">
                        {new Date(review.reviewed_at).toLocaleDateString()}
                      </p>
                      {review.weight_kg != null && (
                        <span className="text-xs font-medium text-primary">{review.weight_kg} kg</span>
                      )}
                    </div>
                    {review.notes && (
                      <p className="text-xs text-muted-foreground mt-2 italic">"{review.notes}"</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {review.status === 'approved' ? (
                      <div className="flex items-center gap-1 text-primary">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Approved</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-destructive">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Disapproved</span>
                      </div>
                    )}
                    {review.status === 'approved' && (
                      <span className="text-xs text-muted-foreground">+{review.points_awarded} pts</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
