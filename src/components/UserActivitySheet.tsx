import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Package, 
  CheckCircle, 
  XCircle, 
  Calendar,
  MapPin,
  Phone,
  TrendingUp,
  Leaf,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface UserRecord {
  id: string;
  name: string;
  phone: string | null;
  location: string | null;
  total_points: number;
  created_at: string;
  role: string;
}

interface BagActivity {
  id: string;
  qr_code: string;
  bag_type: string;
  points_value: number;
  status: string;
  activated_at: string;
  review?: {
    status: string;
    points_awarded: number;
    reviewed_at: string;
    notes: string | null;
    disapproval_reason: string | null;
    collector_name?: string;
  };
}

interface ReviewActivity {
  id: string;
  bag_id: string;
  qr_code: string;
  bag_type: string;
  status: string;
  points_awarded: number;
  reviewed_at: string;
  notes: string | null;
  disapproval_reason: string | null;
  household_name?: string;
}

interface UserActivitySheetProps {
  user: UserRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserActivitySheet({ user, open, onOpenChange }: UserActivitySheetProps) {
  const [loading, setLoading] = useState(false);
  const [bagActivities, setBagActivities] = useState<BagActivity[]>([]);
  const [reviewActivities, setReviewActivities] = useState<ReviewActivity[]>([]);

  useEffect(() => {
    if (user && open) {
      fetchUserActivity();
    }
  }, [user, open]);

  const fetchUserActivity = async () => {
    if (!user) return;
    setLoading(true);

    if (user.role === 'household') {
      // Fetch bags activated by this household
      const { data: bags } = await supabase
        .from('bags')
        .select('*')
        .eq('household_id', user.id)
        .order('activated_at', { ascending: false });

      if (bags && bags.length > 0) {
        // Fetch reviews for these bags
        const bagIds = bags.map(b => b.id);
        const { data: reviews } = await supabase
          .from('bag_reviews')
          .select('*')
          .in('bag_id', bagIds);

        // Fetch collector profiles for reviews
        const collectorIds = [...new Set(reviews?.map(r => r.collector_id) || [])];
        let collectorProfiles: any[] = [];
        if (collectorIds.length > 0) {
          const { data } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', collectorIds);
          collectorProfiles = data || [];
        }

        const bagsWithReviews: BagActivity[] = bags.map(bag => {
          const review = reviews?.find(r => r.bag_id === bag.id);
          const collector = review ? collectorProfiles.find(c => c.id === review.collector_id) : null;
          return {
            id: bag.id,
            qr_code: bag.qr_code,
            bag_type: bag.bag_type || 'recyclable',
            points_value: bag.points_value || 15,
            status: bag.status || 'activated',
            activated_at: bag.activated_at || '',
            review: review ? {
              status: review.status,
              points_awarded: review.points_awarded || 0,
              reviewed_at: review.reviewed_at || '',
              notes: review.notes,
              disapproval_reason: review.disapproval_reason,
              collector_name: collector?.name || 'Unknown'
            } : undefined
          };
        });

        setBagActivities(bagsWithReviews);
      } else {
        setBagActivities([]);
      }
      setReviewActivities([]);
    } else if (user.role === 'collector') {
      // Fetch reviews made by this collector
      const { data: reviews } = await supabase
        .from('bag_reviews')
        .select('*')
        .eq('collector_id', user.id)
        .order('reviewed_at', { ascending: false });

      if (reviews && reviews.length > 0) {
        // Fetch bags for these reviews
        const bagIds = reviews.map(r => r.bag_id);
        const { data: bags } = await supabase
          .from('bags')
          .select('*')
          .in('id', bagIds);

        // Fetch household profiles
        const householdIds = [...new Set(bags?.map(b => b.household_id) || [])];
        let householdProfiles: any[] = [];
        if (householdIds.length > 0) {
          const { data } = await supabase
            .from('profiles')
            .select('id, name')
            .in('id', householdIds);
          householdProfiles = data || [];
        }

        const reviewsWithDetails: ReviewActivity[] = reviews.map(review => {
          const bag = bags?.find(b => b.id === review.bag_id);
          const household = bag ? householdProfiles.find(h => h.id === bag.household_id) : null;
          return {
            id: review.id,
            bag_id: review.bag_id,
            qr_code: bag?.qr_code || 'Unknown',
            bag_type: bag?.bag_type || 'recyclable',
            status: review.status,
            points_awarded: review.points_awarded || 0,
            reviewed_at: review.reviewed_at || '',
            notes: review.notes,
            disapproval_reason: review.disapproval_reason,
            household_name: household?.name || 'Unknown'
          };
        });

        setReviewActivities(reviewsWithDetails);
      } else {
        setReviewActivities([]);
      }
      setBagActivities([]);
    }

    setLoading(false);
  };

  if (!user) return null;

  const isHousehold = user.role === 'household';
  const approvedCount = isHousehold 
    ? bagActivities.filter(b => b.review?.status === 'approved').length
    : reviewActivities.filter(r => r.status === 'approved').length;
  const disapprovedCount = isHousehold
    ? bagActivities.filter(b => b.review?.status === 'disapproved').length
    : reviewActivities.filter(r => r.status === 'disapproved').length;
  const pendingCount = isHousehold
    ? bagActivities.filter(b => !b.review).length
    : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {user.name || 'Unknown User'}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* User Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant={isHousehold ? 'default' : 'secondary'}>
                {isHousehold ? 'Household' : 'Collector'}
              </Badge>
            </div>
            
            {user.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                {user.phone}
              </div>
            )}
            
            {user.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {user.location}
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              Joined {new Date(user.created_at).toLocaleDateString()}
            </div>

            {isHousehold && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="font-semibold">{user.total_points} points</span>
              </div>
            )}
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-primary/10 rounded-lg p-3 text-center">
              <CheckCircle className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold">{approvedCount}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
            <div className="bg-destructive/10 rounded-lg p-3 text-center">
              <XCircle className="w-5 h-5 text-destructive mx-auto mb-1" />
              <p className="text-lg font-bold">{disapprovedCount}</p>
              <p className="text-xs text-muted-foreground">Disapproved</p>
            </div>
            {isHousehold && (
              <div className="bg-muted rounded-lg p-3 text-center">
                <Package className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                <p className="text-lg font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            )}
            {!isHousehold && (
              <div className="bg-muted rounded-lg p-3 text-center">
                <Package className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                <p className="text-lg font-bold">{reviewActivities.length}</p>
                <p className="text-xs text-muted-foreground">Total Reviews</p>
              </div>
            )}
          </div>

          {/* Activity List */}
          <div>
            <h3 className="text-sm font-semibold mb-3">
              {isHousehold ? 'Bag History' : 'Review History'}
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {isHousehold ? (
                  bagActivities.length > 0 ? (
                    bagActivities.map(bag => {
                      const getBagTypeInfo = () => {
                        if (bag.qr_code.startsWith('WWS') || bag.bag_type === 'residual') {
                          return { label: 'Residual', points: 1, color: 'bg-destructive', textColor: 'text-destructive', Icon: AlertTriangle };
                        } else if (bag.qr_code.startsWith('WWO') || bag.bag_type === 'organic' || bag.bag_type === 'biodegradable') {
                          return { label: 'Biodegradable', points: 5, color: 'bg-green-600', textColor: 'text-green-600', Icon: Trash2 };
                        }
                        return { label: 'Recyclable', points: 15, color: 'bg-blue-600', textColor: 'text-blue-600', Icon: Leaf };
                      };
                      const typeInfo = getBagTypeInfo();
                      
                      return (
                        <div key={bag.id} className="border rounded-lg p-3 space-y-2" style={{ borderLeftWidth: '4px', borderLeftColor: typeInfo.color.includes('blue') ? '#2563eb' : typeInfo.color.includes('green') ? '#16a34a' : typeInfo.color.includes('destructive') ? 'hsl(var(--destructive))' : '#6b7280' }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${typeInfo.color}`}>
                                <typeInfo.Icon className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-sm font-mono">{bag.qr_code}</span>
                            </div>
                            <Badge variant={
                              bag.review?.status === 'approved' ? 'default' :
                              bag.review?.status === 'disapproved' ? 'destructive' : 'secondary'
                            }>
                              {bag.review?.status || 'Pending'}
                            </Badge>
                          </div>
                          
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>Type: <span className={`font-medium ${typeInfo.textColor}`}>{typeInfo.label} ({typeInfo.points} pts)</span></p>
                            <p>Activated: {new Date(bag.activated_at).toLocaleString()}</p>
                            
                            {bag.review && (
                              <>
                                <p>Reviewed by: {bag.review.collector_name}</p>
                                <p>Reviewed at: {new Date(bag.review.reviewed_at).toLocaleString()}</p>
                                {bag.review.status === 'approved' && (
                                  <p className={`font-medium ${typeInfo.textColor}`}>+{bag.review.points_awarded} points</p>
                                )}
                                {bag.review.status === 'disapproved' && (
                                  <p className="text-destructive font-medium">0 points</p>
                                )}
                                {bag.review.disapproval_reason && (
                                  <p className="text-destructive">Reason: {bag.review.disapproval_reason}</p>
                                )}
                                {bag.review.notes && (
                                  <p>Notes: {bag.review.notes}</p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No bags activated yet</p>
                  )
                ) : (
                  reviewActivities.length > 0 ? (
                    reviewActivities.map(review => {
                      const getBagTypeInfo = () => {
                        if (review.qr_code.startsWith('WWS') || review.bag_type === 'residual') {
                          return { label: 'Residual', points: 1, color: 'bg-destructive', textColor: 'text-destructive', Icon: AlertTriangle };
                        } else if (review.qr_code.startsWith('WWO') || review.bag_type === 'organic' || review.bag_type === 'biodegradable') {
                          return { label: 'Biodegradable', points: 5, color: 'bg-green-600', textColor: 'text-green-600', Icon: Trash2 };
                        }
                        return { label: 'Recyclable', points: 15, color: 'bg-blue-600', textColor: 'text-blue-600', Icon: Leaf };
                      };
                      const typeInfo = getBagTypeInfo();
                      
                      return (
                        <div key={review.id} className="border rounded-lg p-3 space-y-2" style={{ borderLeftWidth: '4px', borderLeftColor: typeInfo.color.includes('blue') ? '#2563eb' : typeInfo.color.includes('green') ? '#16a34a' : typeInfo.color.includes('destructive') ? 'hsl(var(--destructive))' : '#6b7280' }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${typeInfo.color}`}>
                                <typeInfo.Icon className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-sm font-mono">{review.qr_code}</span>
                            </div>
                            <Badge variant={review.status === 'approved' ? 'default' : 'destructive'}>
                              {review.status}
                            </Badge>
                          </div>
                          
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>Household: {review.household_name}</p>
                            <p>Type: <span className={`font-medium ${typeInfo.textColor}`}>{typeInfo.label}</span></p>
                            <p>Reviewed: {new Date(review.reviewed_at).toLocaleString()}</p>
                            {review.status === 'approved' && (
                              <p className={`font-medium ${typeInfo.textColor}`}>Awarded: +{review.points_awarded} points</p>
                            )}
                            {review.status === 'disapproved' && (
                              <p className="text-destructive font-medium">Awarded: 0 points</p>
                            )}
                            {review.disapproval_reason && (
                              <p className="text-destructive">Reason: {review.disapproval_reason}</p>
                            )}
                            {review.notes && (
                              <p>Notes: {review.notes}</p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No reviews yet</p>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
