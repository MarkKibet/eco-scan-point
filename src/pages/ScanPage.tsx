import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle, AlertCircle, User, MapPin, ThumbsUp, ThumbsDown, Upload, ChevronLeft, Truck, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ScanState = 'ready' | 'scanning' | 'success' | 'error' | 'already-activated' | 'review';

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

const DISAPPROVAL_REASONS = [
  'Contaminated with non-recyclables',
  'Wrong waste type in bag',
  'Bag not properly sealed',
  'Mixed recyclables and general waste',
  'Hazardous materials found',
  'Other'
];

// Extract bag code from URL or scanned text (handles both direct codes and URLs)
const extractBagCode = (input: string): string => {
  // Check if it's a URL with a code parameter
  try {
    const url = new URL(input);
    const codeParam = url.searchParams.get('code');
    if (codeParam) return codeParam;
  } catch {
    // Not a URL, continue
  }
  // Return as-is if it's already just a code
  return input;
};

export default function ScanPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { role, user } = useAuth();
  const [scanState, setScanState] = useState<ScanState>('ready');
  const [manualCode, setManualCode] = useState('');
  const [bagDetails, setBagDetails] = useState<BagDetails | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [disapprovalReason, setDisapprovalReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerContainerId = 'qr-scanner-container';
  const processedUrlCode = useRef(false);

  const isCollector = role === 'collector';

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING state
          await scannerRef.current.stop();
        }
      } catch (error) {
        console.log('Scanner stop error:', error);
      }
    }
  }, []);

  const startScanner = async () => {
    setScanState('scanning');
    
    // Wait for DOM to update
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerId);
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          await stopScanner();
          handleScan(decodedText);
        },
        () => {} // Ignore errors during scanning
      );
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Camera access denied. Please enable camera permissions.');
      setScanState('ready');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerId + '-hidden');
      }

      const result = await scannerRef.current.scanFile(file, true);
      handleScan(result);
    } catch (error) {
      console.error('QR scan error:', error);
      toast.error('Could not read QR code from image. Please try another image.');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  // Handle code from URL parameter (when opened via external QR scanner)
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl && user && !processedUrlCode.current) {
      processedUrlCode.current = true;
      handleScan(codeFromUrl);
    }
  }, [searchParams, user]);

  const handleHouseholdScan = async (code: string) => {
    if (!user) return;

    const { data: existingBag } = await supabase
      .from('bags')
      .select('*')
      .eq('qr_code', code)
      .maybeSingle();

    if (existingBag) {
      // Bag already activated - show special state
      setScannedCode(code);
      setScanState('already-activated');
      return;
    }

    // Determine bag type and points from QR code prefix
    const isRecyclable = code.startsWith('WWR');
    const bagType = isRecyclable ? 'recyclable' : 'organic';
    const pointsValue = isRecyclable ? 15 : 5;

    const { error } = await supabase
      .from('bags')
      .insert({
        qr_code: code,
        household_id: user.id,
        bag_type: bagType,
        points_value: pointsValue
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
    const { data: bag, error } = await supabase
      .from('bags')
      .select('*')
      .eq('qr_code', code)
      .maybeSingle();

    if (error || !bag) {
      setScanState('error');
      toast.error('Bag not found. Has it been activated by a household?');
      return;
    }

    if (bag.status !== 'activated') {
      setScanState('error');
      toast.error(`This bag has already been ${bag.status}`);
      return;
    }

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
  };

  const handleScan = async (input: string) => {
    // Extract the bag code from URL or use as-is
    const code = extractBagCode(input);
    
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
    
    // Validate disapproval reason
    if (!approved && !disapprovalReason) {
      toast.error('Please select a reason for disapproval');
      return;
    }

    setSubmitting(true);
    // Determine points based on bag type from QR code prefix
    const isRecyclable = bagDetails.qr_code.startsWith('WWR');
    const pointsAwarded = approved ? (isRecyclable ? 15 : 5) : 0;
    const finalReason = disapprovalReason === 'Other' ? customReason : disapprovalReason;

    const { error } = await supabase
      .from('bag_reviews')
      .insert({
        bag_id: bagDetails.id,
        collector_id: user.id,
        status: approved ? 'approved' : 'disapproved',
        points_awarded: pointsAwarded,
        notes: reviewNotes || null,
        disapproval_reason: approved ? null : finalReason
      });

    setSubmitting(false);

    if (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } else {
      toast.success(approved ? 'Bag approved! Points awarded to household.' : 'Bag disapproved. Household notified.');
      resetScan();
    }
  };

  const resetScan = async () => {
    await stopScanner();
    setScanState('ready');
    setBagDetails(null);
    setManualCode('');
    setReviewNotes('');
    setDisapprovalReason('');
    setCustomReason('');
    setScannedCode('');
  };

  const goToCollectorLogin = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Hidden container for file scanning */}
      <div id={scannerContainerId + '-hidden'} style={{ display: 'none' }} />
      
      <header className="flex items-center justify-between p-4 bg-card border-b border-border">
        <Button variant="outline" size="icon" onClick={() => { stopScanner(); navigate('/auth'); }}>
          <ChevronLeft className="w-5 h-5" />
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
            
            <div className="flex gap-3 w-full max-w-xs">
              <Button onClick={startScanner} size="lg" className="flex-1">
                <Camera className="w-5 h-5 mr-2" />
                Camera
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

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
          </div>
        )}

        {scanState === 'scanning' && (
          <div className="animate-scale-in">
            <div 
              id={scannerContainerId}
              className="w-full max-w-sm mx-auto aspect-square rounded-3xl overflow-hidden bg-foreground/10"
            />
            <p className="text-center text-muted-foreground mt-4">
              Point camera at QR code
            </p>
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={resetScan}>
                Cancel
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

        {scanState === 'already-activated' && (
          <div className="flex flex-col items-center gap-6 py-8 animate-scale-in">
            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-16 h-16 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Already Activated</h2>
              <p className="text-muted-foreground mb-2">
                This bag has already been activated by a household.
              </p>
              <p className="text-xs font-mono text-muted-foreground bg-muted px-3 py-1 rounded">
                {scannedCode}
              </p>
            </div>
            
            <Card className="w-full max-w-xs">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Are you a collector?</p>
                    <p className="text-xs text-muted-foreground">Login to review this bag</p>
                  </div>
                </div>
                <Button onClick={goToCollectorLogin} className="w-full">
                  <LogIn className="w-4 h-4 mr-2" />
                  Collector Login
                </Button>
              </CardContent>
            </Card>

            <Button variant="outline" onClick={resetScan} className="w-full max-w-xs">
              Scan Different Bag
            </Button>
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
                {(() => {
                  const isRecyclable = bagDetails.qr_code.startsWith('WWR');
                  const bagType = isRecyclable ? 'Recyclable' : 'Organic';
                  const bagColor = isRecyclable ? 'bg-primary' : 'bg-gray-800';
                  const points = isRecyclable ? 15 : 5;
                  return (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Type: </span>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white ${bagColor}`}>
                          {bagType} Bag
                        </span>
                        <span className="text-primary font-medium">+{points} pts</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Code: </span>
                        <span className="font-mono">{bagDetails.qr_code}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Activated: </span>
                        <span>{new Date(bagDetails.activated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })()}
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

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Disapproval Reason (if applicable)</label>
              <select
                value={disapprovalReason}
                onChange={(e) => setDisapprovalReason(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a reason...</option>
                {DISAPPROVAL_REASONS.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            {disapprovalReason === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Specify reason</label>
                <input
                  type="text"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Enter custom reason..."
                  className="w-full h-11 px-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}

            {(() => {
              const isRecyclable = bagDetails.qr_code.startsWith('WWR');
              const points = isRecyclable ? 15 : 5;
              return (
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => handleReview(false)}
                    disabled={submitting || (!disapprovalReason || (disapprovalReason === 'Other' && !customReason))}
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
                    Approve (+{points} pts)
                  </Button>
                </div>
              );
            })()}
          </div>
        )}

        {scanState === 'error' && (
          <div className="flex flex-col items-center gap-6 py-8 animate-scale-in">
            <div className="w-32 h-32 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-16 h-16 text-destructive" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">Scan Error</h2>
              <p className="text-muted-foreground">
                Could not process this QR code
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