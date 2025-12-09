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
  Trash2
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

interface DashboardStats {
  totalHouseholds: number;
  totalCollectors: number;
  totalBags: number;
  approvedBags: number;
  disapprovedBags: number;
  pendingBags: number;
  totalPointsAwarded: number;
  recyclableBags: number;
  organicBags: number;
}

interface RecentActivity {
  id: string;
  type: 'bag_activated' | 'bag_approved' | 'bag_disapproved' | 'user_registered';
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

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalHouseholds: 0,
    totalCollectors: 0,
    totalBags: 0,
    approvedBags: 0,
    disapprovedBags: 0,
    pendingBags: 0,
    totalPointsAwarded: 0,
    recyclableBags: 0,
    organicBags: 0
  });
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [bags, setBags] = useState<BagRecord[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'collectors' | 'activity'>('overview');
  const [loading, setLoading] = useState(true);

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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchDashboardData = async () => {
    setLoading(true);

    // Fetch user roles to count households and collectors
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    console.log('Roles data:', rolesData, 'Error:', rolesError);

    const householdIds = rolesData?.filter(r => r.role === 'household').map(r => r.user_id) || [];
    const collectorIds = rolesData?.filter(r => r.role === 'collector').map(r => r.user_id) || [];

    console.log('Household IDs:', householdIds.length, 'Collector IDs:', collectorIds.length);

    // Fetch all bags
    const { data: bagsData } = await supabase
      .from('bags')
      .select('*');

    // Fetch all reviews
    const { data: reviewsData } = await supabase
      .from('bag_reviews')
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

    console.log('Household profiles:', householdProfiles.length, 'Collector profiles:', collectorProfiles.length);

    const approvedReviews = reviewsData?.filter(r => r.status === 'approved') || [];
    const disapprovedReviews = reviewsData?.filter(r => r.status === 'disapproved') || [];
    const totalPoints = approvedReviews.reduce((sum, r) => sum + (r.points_awarded || 0), 0);

    const recyclableBags = bagsData?.filter(b => b.bag_type === 'recyclable' || b.qr_code?.startsWith('WWR')) || [];
    const organicBags = bagsData?.filter(b => b.bag_type === 'organic' || b.qr_code?.startsWith('WWO')) || [];

    setStats({
      totalHouseholds: householdIds.length,
      totalCollectors: collectorIds.length,
      totalBags: bagsData?.length || 0,
      approvedBags: approvedReviews.length,
      disapprovedBags: disapprovedReviews.length,
      pendingBags: (bagsData?.length || 0) - approvedReviews.length - disapprovedReviews.length,
      totalPointsAwarded: totalPoints,
      recyclableBags: recyclableBags.length,
      organicBags: organicBags.length
    });

    // Combine profiles with roles
    const allProfiles = [
      ...(householdProfiles || []).map(p => ({ ...p, role: 'household' })),
      ...(collectorProfiles || []).map(p => ({ ...p, role: 'collector' }))
    ];

    setUsers(allProfiles as UserRecord[]);
    setBags((bagsData || []) as BagRecord[]);

    // Build recent activity from bags and reviews
    const activities: RecentActivity[] = [];
    
    bagsData?.slice(-10).forEach(bag => {
      activities.push({
        id: `bag-${bag.id}`,
        type: 'bag_activated',
        description: `Bag activated (${bag.qr_code}) - ${bag.bag_type === 'organic' ? 'Organic' : 'Recyclable'}`,
        timestamp: bag.activated_at || ''
      });
    });

    reviewsData?.slice(-10).forEach(review => {
      activities.push({
        id: `review-${review.id}`,
        type: review.status === 'approved' ? 'bag_approved' : 'bag_disapproved',
        description: `Bag ${review.status} (+${review.points_awarded || 0} pts)`,
        timestamp: review.reviewed_at || ''
      });
    });

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setRecentActivity(activities.slice(0, 15));

    setLoading(false);
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
            { id: 'activity', label: 'Activity', icon: Activity }
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
              <div className="grid grid-cols-2 gap-3">
                <Card className="border-primary/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <Leaf className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-primary">{stats.recyclableBags}</p>
                        <p className="text-xs text-muted-foreground">Green Bags (15 pts)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-amber-500/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                        <Trash2 className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-amber-600">{stats.organicBags}</p>
                        <p className="text-xs text-muted-foreground">Black Bags (5 pts)</p>
                      </div>
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
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                          <TableCell>{user.phone || 'N/A'}</TableCell>
                          <TableCell>{user.location || 'N/A'}</TableCell>
                          <TableCell>{user.total_points}</TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
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
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                          <TableCell>{user.phone || 'N/A'}</TableCell>
                          <TableCell>{user.location || 'N/A'}</TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
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
                          : 'bg-accent text-primary'
                      }`}>
                        {activity.type === 'bag_approved' && <CheckCircle className="w-4 h-4" />}
                        {activity.type === 'bag_disapproved' && <XCircle className="w-4 h-4" />}
                        {activity.type === 'bag_activated' && <Package className="w-4 h-4" />}
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
        </div>
      )}
    </div>
  );
}