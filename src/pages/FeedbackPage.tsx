import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, MessageCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { HouseholdFeedbackForm } from '@/components/HouseholdFeedbackForm';
import { format } from 'date-fns';

interface Feedback {
  id: string;
  subject: string;
  message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
}

export default function FeedbackPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFeedback();
    }
  }, [user]);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('household_feedback')
        .select('*')
        .eq('household_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedbackList(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'reviewed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'reviewed':
        return 'Reviewed';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-4 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Feedback & Reviews</h1>
            <p className="text-sm text-muted-foreground">Share your thoughts with us</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <HouseholdFeedbackForm />

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Your Feedback History
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : feedbackList.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No feedback submitted yet</p>
              </CardContent>
            </Card>
          ) : (
            feedbackList.map((feedback) => (
              <Card key={feedback.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{feedback.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(feedback.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {getStatusIcon(feedback.status)}
                      <span className="text-muted-foreground">{getStatusLabel(feedback.status)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{feedback.message}</p>
                  {feedback.admin_response && (
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-xs font-medium text-primary mb-1">Admin Response:</p>
                      <p className="text-sm text-foreground">{feedback.admin_response}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
