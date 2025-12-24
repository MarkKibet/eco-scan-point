import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Sparkles, Leaf, Recycle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TrashItem {
  name: string;
  category: 'recyclable' | 'organic' | 'non-recyclable';
  reason: string;
  bagColor: 'blue' | 'green' | 'black';
}

interface AnalysisResult {
  items: TrashItem[];
  summary: string;
  raw?: boolean;
}

export function TrashScanner() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
        analyzeImage(imageData);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        analyzeImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-trash', {
        body: { image: imageData }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      toast({
        title: "Analysis Complete",
        description: `Found ${data.items?.length || 0} items to sort.`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unable to analyze image.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
    stopCamera();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'recyclable':
        return <Recycle className="w-5 h-5 text-blue-500" />;
      case 'organic':
        return <Leaf className="w-5 h-5 text-green-500" />;
      default:
        return <Trash2 className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBagStyle = (bagColor: string) => {
    switch (bagColor) {
      case 'blue':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'green':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Trash Sorter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!capturedImage && !isCameraOpen && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={startCamera}
            >
              <Camera className="w-8 h-8" />
              <span>Take Photo</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8" />
              <span>Upload Image</span>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {isCameraOpen && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
              <Button variant="secondary" onClick={stopCamera}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={capturePhoto}>
                <Camera className="w-4 h-4 mr-2" />
                Capture
              </Button>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured trash"
                className="w-full rounded-lg"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">Analyzing...</p>
                  </div>
                </div>
              )}
            </div>

            {result && (
              <div className="space-y-3">
                {result.items && result.items.length > 0 ? (
                  <>
                    {result.items.map((item, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${getBagStyle(item.bagColor)}`}
                      >
                        <div className="flex items-start gap-3">
                          {getCategoryIcon(item.category)}
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm opacity-80">{item.reason}</p>
                            <p className="text-xs mt-1 font-medium">
                              → {item.bagColor.toUpperCase()} BAG
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : null}

                {result.summary && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{result.summary}</p>
                  </div>
                )}
              </div>
            )}

            <Button variant="outline" onClick={reset} className="w-full">
              Scan Another Item
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
