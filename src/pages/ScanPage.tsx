import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, CheckCircle, AlertCircle, User, MapPin, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ScanState = 'ready' | 'scanning' | 'success' | 'error' | 'duplicate' | 'review';

interface BagDetails {
  id: string;
  qr_code: string;
  household_id: string;
  activated_at: string;
  status: string;
  household?: {
    name: string;
    location: string | null;
    total_points: number;
  };
}

export default function ScanPage() {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const [scanState, setScanState] = useState<ScanState>('ready');
  const [manualCode, setManualCode] = useState('');
  const [bagDetails, setBagDetails] = useState<BagDetails | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isCollector = role === 'collector';

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setScanState('scanning');
    } catch (error) {
      console.error('Camera access denied:', error);
      toast.error('Camera access denied. Please enable camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handleHouseholdScan = async (code: string) => {
    if (!user) return;

    // Check if bag already exists
    const { data: existingBag } = await supabase
      .from('bags')
      .select('*')
      .eq('qr_code', code)
      .maybeSingle();

    if (existingBag) {
      setScanState('duplicate');
      toast.error('This bag has already been activated');
      return;
    }

    // Activate new bag
    const { error } = await supabase
      .from('bags')
      .insert({
        qr_code: code,
        household_id: user.id
      });

    if (error) {
      console.error('Error activating bag:', error);
      setScanState('error');
      toast.error('Failed to activate bag');
    } else {
      setScanState('success');
      toast.success('Bag activated successfully!');
    }
  };

  const handleCollectorScan = async (code: string) => {
    // Look up the bag and household info
    const { data: bag, error } = await supabase
      .from('bags')
      .select('*')
      .eq('qr_code', code)
      .maybeSingle();

    if (error || !bag) {
      setScanState('error');
      toast.error('Bag not found. Has it been activated?');
      return;
    }

    if (bag.status !== 'activated') {
      setScanState('error');
      toast.error(`This bag has already been ${bag.status}`);
      return;
    }

    // Fetch household profile
    const { data: householdProfile } = await supabase
      .from('profiles')
      .select('name, location, total_points')
      .eq('id', bag.household_id)
      .maybeSingle();

    setBagDetails({
      ...bag,
      household: householdProfile || undefined
    });
    setScanState('review');
    stopCamera();
  };

  const handleScan = async (code: string) => {
    stopCamera();
    
    if (isCollector) {
      await handleCollectorScan(code);
    } else {
      await handleHouseholdScan(code);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScan(manualCode.trim());
    }
  };

  const handleReview = async (approved: boolean) => {
    if (!bagDetails || !user) return;
    
    setSubmitting(true);
    const pointsAwarded = approved ? 15 : 0;

    const { error } = await supabase
      .from('bag_reviews')
      .insert({
        bag_id: bagDetails.id,
        collector_id: user.id,
        status: approved ? 'approved' : 'disapproved',
        points_awarded: pointsAwarded,
        notes: reviewNotes || null
      });

    setSubmitting(false);

    if (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } else {
      toast.success(approved ? 'Bag approved! Points awarded.' : 'Bag marked as not meeting threshold.');
      resetScan();
    }
  };

  const resetScan = () => {
    setScanState('ready');
    setBagDetails(null);
    setManualCode('');
    setReviewNotes('');
  };

  const simulateScan = () => {
    const randomCode = 'ECO-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    handleScan(randomCode);
  };

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-card border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <X className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold">
          {isCollector ? 'Review Bag' : 'Activate Bag'}
        </h1>
        <div className="w-10" />
      </header>

      <div className="p-4">
        {scanState === 'ready' && (
          <div className="flex flex-col items-center gap-6 py-8 animate-slide-up">
            <div className="w-32 h-32 bg-accent rounded-3xl flex items-center justify-center">
              <Camera className="w-16 h-16 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {isCollector ? 'Scan to Review' : 'Ready to Activate'}
              </h2>
              <p className="text-muted-foreground">
                {isCollector 
                  ? 'Scan the QR code to review the household\'s sorting'
                  : 'Scan the QR code on your trash bag to activate it'
                }
              </p>
            </div>
            <Button onClick={startCamera} size="lg" className="w-full max-w-xs">
              <Camera className="w-5 h-5 mr-2" />
              Open Camera
            </Button>

            <div className="w-full max-w-xs">
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or enter manually
                  </span>
                </div>
              </div>

              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter QR code..."
                  className="flex-1 h-11 px-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button type="submit" disabled={!manualCode.trim()}>
                  Submit
                </Button>
              </form>
            </div>

            <Button variant="outline" onClick={simulateScan} className="w-full max-w-xs">
              Demo Scan (Test)
            </Button>
          </div>
        )}

        {scanState === 'scanning' && (
          <div className="relative animate-scale-in">
            <div className="aspect-square max-w-sm mx-auto rounded-3xl overflow-hidden bg-foreground/10 relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-4 border-primary rounded-3xl relative">
                  <div className="absolute inset-0 bg-primary/5" />
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />
                  <div className="absolute left-4 right-4 h-0.5 bg-primary animate-scan-line" />
                </div>
              </div>
            </div>
            <p className="text-center text-muted-foreground mt-4">
              Align QR code within the frame
            </p>
            <div className="flex gap-3 mt-6 justify-center">
              <Button variant="outline" onClick={() => { stopCamera(); resetScan(); }}>
                Cancel
              </Button>
              <Button onClick={simulateScan}>
                Simulate Scan
              </Button>
            </div>
          </div>
        )}

        {scanState === 'success' && (
          <div className="flex flex-col items-center gap-6 py-8 animate-scale-in">
            <div className="w-32 h-32 bg-accent rounded-full flex items-center justify-center animate-celebrate">
              <CheckCircle className="w-16 h-16 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Bag Activated!</h2>
              <p className="text-muted-foreground">
                Your bag is now registered. Points will be awarded after collector review.
              </p>
            </div>
            <div className="flex gap-3 w-full max-w-xs">
              <Button variant="outline" onClick={resetScan} className="flex-1">
                Scan Another
              </Button>
              <Button onClick={() => navigate('/')} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        )}

        {scanState === 'review' && bagDetails && (
          <div className="space-y-4 py-4 animate-slide-up">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-3">Household Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{bagDetails.household?.name || 'Unknown'}</span>
                  </div>
                  {bagDetails.household?.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{bagDetails.household.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Total Points:</span>
                    <span className="font-medium text-primary">{bagDetails.household?.total_points || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-foreground mb-3">Bag Info</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Code: </span>
                    <span className="font-mono">{bagDetails.qr_code}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Activated: </span>
                    <span>{new Date(bagDetails.activated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Notes (optional)</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes about the sorting quality..."
                className="w-full h-20 px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => handleReview(false)}
                disabled={submitting}
                className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                Disapprove
              </Button>
              <Button
                onClick={() => handleReview(true)}
                disabled={submitting}
                className="flex-1"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Approve (+15 pts)
              </Button>
            </div>
          </div>
        )}

        {(scanState === 'error' || scanState === 'duplicate') && (
          <div className="flex flex-col items-center gap-6 py-8 animate-scale-in">
            <div className="w-32 h-32 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-16 h-16 text-destructive" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">
                {scanState === 'duplicate' ? 'Already Activated' : 'Scan Error'}
              </h2>
              <p className="text-muted-foreground">
                {scanState === 'duplicate'
                  ? 'This bag has already been activated'
                  : 'Could not process this QR code'}
              </p>
            </div>
            <Button onClick={resetScan} className="w-full max-w-xs">
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
