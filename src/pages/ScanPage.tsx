import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, CheckCircle, AlertCircle, Flashlight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/AppContext';
import { BagType } from '@/types';
import { toast } from 'sonner';

type ScanState = 'ready' | 'scanning' | 'success' | 'error' | 'duplicate';

export default function ScanPage() {
  const navigate = useNavigate();
  const { addScan } = useApp();
  const [scanState, setScanState] = useState<ScanState>('ready');
  const [lastScan, setLastScan] = useState<{ bagType: BagType; points: number } | null>(null);
  const [manualCode, setManualCode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  const parseQRCode = (code: string): { bagType: BagType; valid: boolean } => {
    const upperCode = code.toUpperCase();
    if (upperCode.startsWith('ECO-R-') || upperCode.includes('RECYCLABLE')) {
      return { bagType: 'recyclable', valid: true };
    }
    if (upperCode.startsWith('ECO-G-') || upperCode.includes('GENERAL')) {
      return { bagType: 'general', valid: true };
    }
    return { bagType: 'general', valid: false };
  };

  const handleScan = (code: string) => {
    const { bagType, valid } = parseQRCode(code);

    if (!valid) {
      setScanState('error');
      toast.error('Invalid QR code format');
      return;
    }

    const points = addScan(code, bagType);

    if (points === 0) {
      setScanState('duplicate');
      toast.error('This bag has already been scanned');
    } else {
      setLastScan({ bagType, points });
      setScanState('success');
      toast.success(`+${points} points earned!`);
    }

    stopCamera();
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScan(manualCode.trim());
    }
  };

  const resetScan = () => {
    setScanState('ready');
    setLastScan(null);
    setManualCode('');
  };

  // Simulate scan for demo (since we can't use real QR scanning in browser)
  const simulateScan = () => {
    const codes = [
      'ECO-R-' + Math.random().toString(36).substr(2, 9),
      'ECO-G-' + Math.random().toString(36).substr(2, 9),
    ];
    const randomCode = codes[Math.floor(Math.random() * codes.length)];
    handleScan(randomCode);
  };

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-card border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <X className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold">Scan QR Code</h1>
        <div className="w-10" />
      </header>

      <div className="p-4">
        {scanState === 'ready' && (
          <div className="flex flex-col items-center gap-6 py-8 animate-slide-up">
            <div className="w-32 h-32 bg-eco-green-light rounded-3xl flex items-center justify-center">
              <Camera className="w-16 h-16 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Ready to Scan
              </h2>
              <p className="text-muted-foreground">
                Point your camera at the QR code on your trash bag
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

            {/* Demo button */}
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
              {/* Scan frame overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-4 border-primary rounded-3xl relative">
                  <div className="absolute inset-0 bg-primary/5" />
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />
                  {/* Scanning line */}
                  <div className="absolute left-4 right-4 h-0.5 bg-primary animate-scan-line" />
                </div>
              </div>
            </div>
            <p className="text-center text-muted-foreground mt-4">
              Align QR code within the frame
            </p>
            <div className="flex gap-3 mt-6 justify-center">
              <Button variant="outline" onClick={stopCamera}>
                Cancel
              </Button>
              <Button onClick={simulateScan}>
                Simulate Scan
              </Button>
            </div>
          </div>
        )}

        {scanState === 'success' && lastScan && (
          <div className="flex flex-col items-center gap-6 py-8 animate-scale-in">
            <div className="w-32 h-32 bg-eco-green-light rounded-full flex items-center justify-center animate-celebrate">
              <CheckCircle className="w-16 h-16 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                +{lastScan.points} Points!
              </h2>
              <p className="text-muted-foreground">
                {lastScan.bagType === 'recyclable' ? '♻️ Recyclable' : '🗑️ General Waste'} bag activated
              </p>
            </div>
            <div className={`px-6 py-3 rounded-2xl ${
              lastScan.bagType === 'recyclable' ? 'bg-recyclable-bg text-recyclable' : 'bg-general-waste-bg text-general-waste'
            }`}>
              <span className="font-semibold">
                {lastScan.bagType === 'recyclable' ? 'Recyclable' : 'General Waste'}
              </span>
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

        {(scanState === 'error' || scanState === 'duplicate') && (
          <div className="flex flex-col items-center gap-6 py-8 animate-scale-in">
            <div className="w-32 h-32 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-16 h-16 text-destructive" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">
                {scanState === 'duplicate' ? 'Already Scanned' : 'Invalid Code'}
              </h2>
              <p className="text-muted-foreground">
                {scanState === 'duplicate'
                  ? 'This bag has already been activated'
                  : 'This QR code is not recognized'}
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
