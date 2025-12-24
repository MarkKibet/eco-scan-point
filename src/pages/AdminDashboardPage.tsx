import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  Users, 
  Truck, 
  Package, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Download,
  ShieldAlert,
  Activity,
  Leaf,
  Trash2,
  ChevronRight,
  ClipboardCheck,
  AlertTriangle,
  MessageSquare,
  Send
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import UserActivitySheet from '@/components/UserActivitySheet';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface DashboardStats {
  totalHouseholds: number;
  totalCollectors: number;
  totalReceivers: number;
  totalBags: number;
  approvedBags: number;
  disapprovedBags: number;
  pendingBags: number;
  totalPointsAwarded: number;
  recyclableBags: number;
  organicBags: number;
  residualBags: number;
  // Receiver verification stats
  receiverApproved: number;
  receiverDisapproved: number;
  pendingReceiverReview: number;
}

interface CollectorAccuracy {
  id: string;
  name: string;
  totalReviews: number;
  receiverApproved: number;
  receiverDisapproved: number;
  accuracyRate: number;
}

interface ReceiverStats {
  id: string;
  name: string;
  totalVerifications: number;
  approved: number;
  disapproved: number;
}

interface RecentActivity {
  id: string;
  type: 'bag_activated' | 'bag_approved' | 'bag_disapproved' | 'user_registered' | 'receiver_approved' | 'receiver_disapproved';
  description: string;
  timestamp: string;
}

interface UserRecord {
  id: string;
  name: string;
  phone: string | null;
  location: string | null;
  total_points: number;
  created_at: string;
  role: string;
}

interface BagRecord {
  id: string;
  qr_code: string;
  status: string;
  bag_type: string;
  points_value: number;
  activated_at: string;
}

const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--muted))'];
const RECEIVER_COLORS = ['#10b981', '#ef4444', '#6b7280'];

interface FeedbackRecord {
  id: string;
  household_id: string;
  subject: string;
  message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
  household_name?: string;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalHouseholds: 0,
    totalCollectors: 0,
    totalReceivers: 0,
    totalBags: 0,
    approvedBags: 0,
    disapprovedBags: 0,
    pendingBags: 0,
    totalPointsAwarded: 0,
    recyclableBags: 0,
    organicBags: 0,
    residualBags: 0,
    receiverApproved: 0,
    receiverDisapproved: 0,
    pendingReceiverReview: 0
  });
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [bags, setBags] = useState<BagRecord[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [collectorAccuracy, setCollectorAccuracy] = useState<CollectorAccuracy[]>([]);
  const [receiverStats, setReceiverStats] = useState<ReceiverStats[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'collectors' | 'receivers' | 'activity' | 'feedback'>('overview');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [feedbackList, setFeedbackList] = useState<FeedbackRecord[]>([]);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  const isAdmin = role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
      setupRealtimeSubscription();
    }
  }, [isAdmin]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('admin-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_roles' }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bags' }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bag_reviews' }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'receiver_reviews' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchDashboardData = async () => {
    setLoading(true);

    // Fetch user roles to count households, collectors, and receivers
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    console.log('Roles data:', rolesData, 'Error:', rolesError);

    const householdIds = rolesData?.filter(r => r.role === 'household').map(r => r.user_id) || [];
    const collectorIds = rolesData?.filter(r => r.role === 'collector').map(r => r.user_id) || [];
    const receiverIds = rolesData?.filter(r => r.role === 'receiver').map(r => r.user_id) || [];

    console.log('Household IDs:', householdIds.length, 'Collector IDs:', collectorIds.length, 'Receiver IDs:', receiverIds.length);

    // Fetch all bags
    const { data: bagsData } = await supabase
      .from('bags')
      .select('*');

    // Fetch all collector reviews
    const { data: reviewsData } = await supabase
      .from('bag_reviews')
      .select('*');

    // Fetch all receiver reviews
    const { data: receiverReviewsData } = await supabase
      .from('receiver_reviews')
      .select('*');

    // Fetch profiles for households - skip if no IDs
    let householdProfiles: any[] = [];
    if (householdIds.length > 0) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('id', householdIds);
      householdProfiles = data || [];
    }

    // Fetch profiles for collectors - skip if no IDs
    let collectorProfiles: any[] = [];
    if (collectorIds.length > 0) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('id', collectorIds);
      collectorProfiles = data || [];
    }

    // Fetch profiles for receivers - skip if no IDs
    let receiverProfiles: any[] = [];
    if (receiverIds.length > 0) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .in('id', receiverIds);
      receiverProfiles = data || [];
    }

    console.log('Household profiles:', householdProfiles.length, 'Collector profiles:', collectorProfiles.length, 'Receiver profiles:', receiverProfiles.length);

    const approvedReviews = reviewsData?.filter(r => r.status === 'approved') || [];
    const disapprovedReviews = reviewsData?.filter(r => r.status === 'disapproved') || [];
    const totalPoints = approvedReviews.reduce((sum, r) => sum + (r.points_awarded || 0), 0);

    const recyclableBags = bagsData?.filter(b => b.bag_type === 'recyclable' || b.qr_code?.startsWith('WWR')) || [];
    const biodegradableBags = bagsData?.filter(b => b.bag_type === 'biodegradable' || b.bag_type === 'organic' || b.qr_code?.startsWith('WWO')) || [];
    const residualBags = bagsData?.filter(b => b.bag_type === 'residual' || b.qr_code?.startsWith('WWS')) || [];

    // Receiver verification stats
    const receiverApprovedReviews = receiverReviewsData?.filter(r => r.status === 'approved') || [];
    const receiverDisapprovedReviews = receiverReviewsData?.filter(r => r.status === 'disapproved') || [];
    const pendingReceiverReview = approvedReviews.length - (receiverReviewsData?.length || 0);

    setStats({
      totalHouseholds: householdIds.length,
      totalCollectors: collectorIds.length,
      totalReceivers: receiverIds.length,
      totalBags: bagsData?.length || 0,
      approvedBags: approvedReviews.length,
      disapprovedBags: disapprovedReviews.length,
      pendingBags: (bagsData?.length || 0) - approvedReviews.length - disapprovedReviews.length,
      totalPointsAwarded: totalPoints,
      recyclableBags: recyclableBags.length,
      organicBags: biodegradableBags.length,
      residualBags: residualBags.length,
      receiverApproved: receiverApprovedReviews.length,
      receiverDisapproved: receiverDisapprovedReviews.length,
      pendingReceiverReview: Math.max(0, pendingReceiverReview)
    });

    // Calculate collector accuracy
    const collectorAccuracyMap = new Map<string, { approved: number; disapproved: number }>();
    
    reviewsData?.forEach(review => {
      if (!collectorAccuracyMap.has(review.collector_id)) {
        collectorAccuracyMap.set(review.collector_id, { approved: 0, disapproved: 0 });
      }
    });

    receiverReviewsData?.forEach(receiverReview => {
      const bagReview = reviewsData?.find(r => r.id === receiverReview.bag_review_id);
      if (bagReview) {
        const stats = collectorAccuracyMap.get(bagReview.collector_id);
        if (stats) {
          if (receiverReview.status === 'approved') {
            stats.approved++;
          } else {
            stats.disapproved++;
          }
        }
      }
    });

    const accuracyData: CollectorAccuracy[] = [];
    for (const [collectorId, data] of collectorAccuracyMap) {
      const profile = collectorProfiles.find(p => p.id === collectorId);
      const total = data.approved + data.disapproved;
      accuracyData.push({
        id: collectorId,
        name: profile?.name || 'Unknown',
        totalReviews: reviewsData?.filter(r => r.collector_id === collectorId).length || 0,
        receiverApproved: data.approved,
        receiverDisapproved: data.disapproved,
        accuracyRate: total > 0 ? Math.round((data.approved / total) * 100) : 0
      });
    }
    setCollectorAccuracy(accuracyData.sort((a, b) => b.totalReviews - a.totalReviews));

    // Calculate receiver stats
    const receiverStatsMap = new Map<string, { approved: number; disapproved: number }>();
    receiverReviewsData?.forEach(review => {
      if (!receiverStatsMap.has(review.receiver_id)) {
        receiverStatsMap.set(review.receiver_id, { approved: 0, disapproved: 0 });
      }
      const stats = receiverStatsMap.get(review.receiver_id)!;
      if (review.status === 'approved') {
        stats.approved++;
      } else {
        stats.disapproved++;
      }
    });

    const receiverStatsData: ReceiverStats[] = [];
    for (const [receiverId, data] of receiverStatsMap) {
      const profile = receiverProfiles.find(p => p.id === receiverId);
      receiverStatsData.push({
        id: receiverId,
        name: profile?.name || 'Unknown',
        totalVerifications: data.approved + data.disapproved,
        approved: data.approved,
        disapproved: data.disapproved
      });
    }
    setReceiverStats(receiverStatsData.sort((a, b) => b.totalVerifications - a.totalVerifications));

    // Combine profiles with roles
    const allProfiles = [
      ...(householdProfiles || []).map(p => ({ ...p, role: 'household' })),
      ...(collectorProfiles || []).map(p => ({ ...p, role: 'collector' })),
      ...(receiverProfiles || []).map(p => ({ ...p, role: 'receiver' }))
    ];

    setUsers(allProfiles as UserRecord[]);
    setBags((bagsData || []) as BagRecord[]);

    // Build recent activity from bags, reviews, and receiver reviews
    const activities: RecentActivity[] = [];
    
    bagsData?.slice(-10).forEach(bag => {
      let bagTypeName = 'Recyclable';
      if (bag.qr_code?.startsWith('WWO') || bag.bag_type === 'organic' || bag.bag_type === 'biodegradable') bagTypeName = 'Biodegradable';
      else if (bag.qr_code?.startsWith('WWS') || bag.bag_type === 'residual') bagTypeName = 'Residual';
      activities.push({
        id: `bag-${bag.id}`,
        type: 'bag_activated',
        description: `Bag activated (${bag.qr_code}) - ${bagTypeName}`,
        timestamp: bag.activated_at || ''
      });
    });

    reviewsData?.slice(-10).forEach(review => {
      activities.push({
        id: `review-${review.id}`,
        type: review.status === 'approved' ? 'bag_approved' : 'bag_disapproved',
        description: `Collector ${review.status} bag (+${review.points_awarded || 0} pts)`,
        timestamp: review.reviewed_at || ''
      });
    });

    receiverReviewsData?.slice(-10).forEach(review => {
      activities.push({
        id: `receiver-${review.id}`,
        type: review.status === 'approved' ? 'receiver_approved' : 'receiver_disapproved',
        description: `Receiver ${review.status} collector's review`,
        timestamp: review.reviewed_at || ''
      });
    });

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setRecentActivity(activities.slice(0, 20));

    setLoading(false);
    
    // Fetch household feedback
    fetchFeedback();
  };

  const fetchFeedback = async () => {
    try {
      const { data: feedbackData, error } = await supabase
        .from('household_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get household names
      const householdIds = [...new Set(feedbackData?.map(f => f.household_id) || [])];
      let profilesMap: Record<string, string> = {};
      
      if (householdIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', householdIds);
        
        profiles?.forEach(p => {
          profilesMap[p.id] = p.name;
        });
      }

      const feedbackWithNames = feedbackData?.map(f => ({
        ...f,
        household_name: profilesMap[f.household_id] || 'Unknown'
      })) || [];

      setFeedbackList(feedbackWithNames);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const handleRespondToFeedback = async (feedbackId: string) => {
    if (!responseText.trim()) return;

    try {
      const { error } = await supabase
        .from('household_feedback')
        .update({
          admin_response: responseText.trim(),
          status: 'reviewed'
        })
        .eq('id', feedbackId);

      if (error) throw error;

      setRespondingTo(null);
      setResponseText('');
      fetchFeedback();
    } catch (error) {
      console.error('Error responding to feedback:', error);
    }
  };

  const exportData = (type: 'users' | 'collectors') => {
    const filteredUsers = users.filter(u => 
      type === 'collectors' ? u.role === 'collector' : u.role === 'household'
    );
    
    const csv = [
      ['Name', 'Phone', 'Location', 'Points', 'Joined'],
      ...filteredUsers.map(u => [
        u.name,
        u.phone || 'N/A',
        u.location || 'N/A',
        u.total_points.toString(),
        new Date(u.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wastewise-${type}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center mb-4">
          <ShieldAlert className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Access Restricted</h1>
        <p className="text-muted-foreground text-center mb-6">
          Only administrators can access this dashboard
        </p>
        <Button onClick={() => navigate('/')}>Go Back Home</Button>
      </div>
    );
  }

  const pieData = [
    { name: 'Approved', value: stats.approvedBags },
    { name: 'Disapproved', value: stats.disapprovedBags },
    { name: 'Pending', value: stats.pendingBags }
  ];

  const bagTypeData = [
    { name: 'Recyclables', value: stats.recyclableBags, color: 'hsl(var(--primary))' },
    { name: 'Organics', value: stats.organicBags, color: '#D97706' }
  ];

  const barData = [
    { name: 'Households', value: stats.totalHouseholds },
    { name: 'Collectors', value: stats.totalCollectors },
    { name: 'Bags', value: stats.totalBags }
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">WasteWise Analytics</p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="p-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'users', label: 'Households', icon: Users },
            { id: 'collectors', label: 'Collectors', icon: Truck },
            { id: 'receivers', label: 'Receivers', icon: ClipboardCheck },
            { id: 'activity', label: 'Activity', icon: Activity },
            { id: 'feedback', label: 'Feedback', icon: MessageSquare }
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="px-4 space-y-4">
          {activeTab === 'overview' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.totalHouseholds}</p>
                        <p className="text-xs text-muted-foreground">Households</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                        <Truck className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.totalCollectors}</p>
                        <p className="text-xs text-muted-foreground">Collectors</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <ClipboardCheck className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.totalReceivers}</p>
                        <p className="text-xs text-muted-foreground">Receivers</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.totalBags}</p>
                        <p className="text-xs text-muted-foreground">Total Bags</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.totalPointsAwarded}</p>
                        <p className="text-xs text-muted-foreground">Points Given</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bag Type Stats */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="border-blue-500/50">
                  <CardContent className="p-3">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mb-1">
                        <Leaf className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xl font-bold text-blue-600">{stats.recyclableBags}</p>
                      <p className="text-xs text-muted-foreground">Blue (15 pts)</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-500/50">
                  <CardContent className="p-3">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mb-1">
                        <Trash2 className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xl font-bold text-green-600">{stats.organicBags}</p>
                      <p className="text-xs text-muted-foreground">Green (5 pts)</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-destructive/50">
                  <CardContent className="p-3">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-8 h-8 bg-destructive rounded-lg flex items-center justify-center mb-1">
                        <Trash2 className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xl font-bold text-destructive">{stats.residualBags}</p>
                      <p className="text-xs text-muted-foreground">Red (1 pt)</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bag Status Cards */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="border-primary/50">
                  <CardContent className="p-3 text-center">
                    <CheckCircle className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="text-xl font-bold">{stats.approvedBags}</p>
                    <p className="text-xs text-muted-foreground">Approved</p>
                  </CardContent>
                </Card>

                <Card className="border-destructive/50">
                  <CardContent className="p-3 text-center">
                    <XCircle className="w-5 h-5 text-destructive mx-auto mb-1" />
                    <p className="text-xl font-bold">{stats.disapprovedBags}</p>
                    <p className="text-xs text-muted-foreground">Disapproved</p>
                  </CardContent>
                </Card>

                <Card className="border-muted">
                  <CardContent className="p-3 text-center">
                    <Package className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-xl font-bold">{stats.pendingBags}</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Bag Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-2">
                    {pieData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-1">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: CHART_COLORS[index] }}
                        />
                        <span className="text-xs text-muted-foreground">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Platform Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Receiver Verification Stats */}
              <Card className="border-amber-500/30">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-amber-600" />
                    Receiver Verification Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                      <p className="text-xl font-bold text-emerald-600">{stats.receiverApproved}</p>
                      <p className="text-xs text-muted-foreground">Verified OK</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <XCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                      <p className="text-xl font-bold text-red-600">{stats.receiverDisapproved}</p>
                      <p className="text-xs text-muted-foreground">Rejected</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Package className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                      <p className="text-xl font-bold text-gray-600">{stats.pendingReceiverReview}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                  </div>

                  {/* Receiver verification chart */}
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Approved', value: stats.receiverApproved },
                            { name: 'Rejected', value: stats.receiverDisapproved },
                            { name: 'Pending', value: stats.pendingReceiverReview }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={45}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {RECEIVER_COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4">
                    {['Approved', 'Rejected', 'Pending'].map((label, index) => (
                      <div key={label} className="flex items-center gap-1">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: RECEIVER_COLORS[index] }}
                        />
                        <span className="text-xs text-muted-foreground">{label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Collector Accuracy Monitoring */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Collector Accuracy (Receiver Verified)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {collectorAccuracy.length > 0 ? (
                    <div className="space-y-3">
                      {collectorAccuracy.slice(0, 5).map(collector => (
                        <div key={collector.id} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{collector.name}</span>
                            <span className={`text-sm font-bold ${
                              collector.accuracyRate >= 80 ? 'text-emerald-600' : 
                              collector.accuracyRate >= 50 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {collector.accuracyRate}% accuracy
                            </span>
                          </div>
                          <Progress 
                            value={collector.accuracyRate} 
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{collector.totalReviews} reviews</span>
                            <span className="text-emerald-600">{collector.receiverApproved} ✓</span>
                            <span className="text-red-600">{collector.receiverDisapproved} ✗</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No receiver verifications yet</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'users' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Households ({users.filter(u => u.role === 'household').length})</CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportData('users')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.filter(u => u.role === 'household').map(user => (
                        <TableRow 
                          key={user.id} 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            setSelectedUser(user);
                            setSheetOpen(true);
                          }}
                        >
                          <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                          <TableCell>{user.phone || 'N/A'}</TableCell>
                          <TableCell>{user.location || 'N/A'}</TableCell>
                          <TableCell>{user.total_points}</TableCell>
                          <TableCell className="flex items-center gap-2">
                            {new Date(user.created_at).toLocaleDateString()}
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {users.filter(u => u.role === 'household').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No households registered yet</p>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'collectors' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Collectors ({users.filter(u => u.role === 'collector').length})</CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportData('collectors')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.filter(u => u.role === 'collector').map(user => (
                        <TableRow 
                          key={user.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => {
                            setSelectedUser(user);
                            setSheetOpen(true);
                          }}
                        >
                          <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                          <TableCell>{user.phone || 'N/A'}</TableCell>
                          <TableCell>{user.location || 'N/A'}</TableCell>
                          <TableCell className="flex items-center gap-2">
                            {new Date(user.created_at).toLocaleDateString()}
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {users.filter(u => u.role === 'collector').length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No collectors registered yet</p>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'receivers' && (
            <>
              {/* Receiver Stats */}
              <Card className="border-amber-500/30">
                <CardHeader>
                  <CardTitle className="text-sm">Receivers ({users.filter(u => u.role === 'receiver').length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Verifications</TableHead>
                          <TableHead>Approved</TableHead>
                          <TableHead>Rejected</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {receiverStats.length > 0 ? (
                          receiverStats.map(receiver => (
                            <TableRow key={receiver.id}>
                              <TableCell className="font-medium">{receiver.name}</TableCell>
                              <TableCell>{receiver.totalVerifications}</TableCell>
                              <TableCell className="text-emerald-600">{receiver.approved}</TableCell>
                              <TableCell className="text-red-600">{receiver.disapproved}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                              No receiver activity yet
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Collector Accuracy Full View */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Collector Accuracy by Receiver Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  {collectorAccuracy.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Collector</TableHead>
                            <TableHead>Total Reviews</TableHead>
                            <TableHead>Verified OK</TableHead>
                            <TableHead>Rejected</TableHead>
                            <TableHead>Accuracy</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {collectorAccuracy.map(collector => (
                            <TableRow key={collector.id}>
                              <TableCell className="font-medium">{collector.name}</TableCell>
                              <TableCell>{collector.totalReviews}</TableCell>
                              <TableCell className="text-emerald-600">{collector.receiverApproved}</TableCell>
                              <TableCell className="text-red-600">{collector.receiverDisapproved}</TableCell>
                              <TableCell>
                                <span className={`font-bold ${
                                  collector.accuracyRate >= 80 ? 'text-emerald-600' : 
                                  collector.accuracyRate >= 50 ? 'text-amber-600' : 'text-red-600'
                                }`}>
                                  {collector.accuracyRate}%
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No receiver verifications yet</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'activity' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map(activity => (
                    <div 
                      key={activity.id} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'bag_approved' 
                          ? 'bg-primary/20 text-primary'
                          : activity.type === 'bag_disapproved'
                          ? 'bg-destructive/20 text-destructive'
                          : activity.type === 'receiver_approved'
                          ? 'bg-emerald-100 text-emerald-600'
                          : activity.type === 'receiver_disapproved'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-accent text-primary'
                      }`}>
                        {activity.type === 'bag_approved' && <CheckCircle className="w-4 h-4" />}
                        {activity.type === 'bag_disapproved' && <XCircle className="w-4 h-4" />}
                        {activity.type === 'bag_activated' && <Package className="w-4 h-4" />}
                        {activity.type === 'receiver_approved' && <ClipboardCheck className="w-4 h-4" />}
                        {activity.type === 'receiver_disapproved' && <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {recentActivity.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feedback Tab */}
          {activeTab === 'feedback' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Household Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                {feedbackList.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No feedback submitted yet</p>
                ) : (
                  <div className="space-y-4">
                    {feedbackList.map((feedback) => (
                      <Card key={feedback.id} className="border">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{feedback.subject}</p>
                              <p className="text-xs text-muted-foreground">
                                From: {feedback.household_name} • {format(new Date(feedback.created_at), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              feedback.status === 'pending' 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {feedback.status === 'pending' ? 'Pending' : 'Reviewed'}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{feedback.message}</p>
                          
                          {feedback.admin_response ? (
                            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                              <p className="text-xs font-medium text-primary mb-1">Your Response:</p>
                              <p className="text-sm text-foreground">{feedback.admin_response}</p>
                            </div>
                          ) : respondingTo === feedback.id ? (
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Write your response..."
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleRespondToFeedback(feedback.id)}
                                  disabled={!responseText.trim()}
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  Send Response
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setRespondingTo(null);
                                    setResponseText('');
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRespondingTo(feedback.id)}
                            >
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Respond
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
      <UserActivitySheet 
        user={selectedUser} 
        open={sheetOpen} 
        onOpenChange={setSheetOpen} 
      />
    </div>
  );
}