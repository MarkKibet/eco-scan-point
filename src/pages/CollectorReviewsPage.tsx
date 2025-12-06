import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ClipboardList, ChevronLeft } from 'lucide-react';

interface ReviewWithHousehold {
  id: string;
  status: string;
  points_awarded: number;
  notes: string | null;
  reviewed_at: string;
  bag: {
    qr_code: string;
  };
  household: {
    name: string;
    location: string | null;
  } | null;
}

export default function CollectorReviewsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithHousehold[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchReviews = async () => {
      const { data: reviewsData } = await supabase
        .from('bag_reviews')
        .select('*, bags(*)')
        .eq('collector_id', user.id)
        .order('reviewed_at', { ascending: false });

      if (reviewsData) {
        // Fetch household profiles for each review
        const reviewsWithHouseholds = await Promise.all(
          reviewsData.map(async (review) => {
            const bag = review.bags as { qr_code: string; household_id: string };
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
              bag: { qr_code: bag.qr_code },
              household
            };
          })
        );

        setReviews(reviewsWithHouseholds);
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

      <div className="p-4 space-y-3">
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
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(review.reviewed_at).toLocaleDateString()}
                    </p>
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