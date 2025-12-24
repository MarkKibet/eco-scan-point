import { useState, useRef, useCallback, useEffect } from 'react';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  // Attach stream to video element when both are ready
  useEffect(() => {
    if (stream && videoRef.current && isCameraOpen) {
      const video = videoRef.current;
      video.srcObject = stream;
      
      const handleCanPlay = async () => {
        try {
          await video.play();
          setIsCameraReady(true);
        } catch (err) {
          console.error('Video play error:', err);
          toast({
            title: "Camera Error",
            description: "Unable to start video. Try uploading an image.",
            variant: "destructive",
          });
        }
      };

      video.addEventListener('canplay', handleCanPlay);
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
      };
    }
  }, [stream, isCameraOpen, toast]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      setIsCameraReady(false);
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Try uploading an image instead.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
    setIsCameraReady(false);
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !isCameraReady) {
      toast({
        title: "Camera not ready",
        description: "Please wait for the camera to initialize.",
        variant: "destructive",
      });
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    
    // Use smaller dimensions for faster upload
    const maxSize = 512;
    const scale = Math.min(maxSize / video.videoWidth, maxSize / video.videoHeight, 1);
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
    
    const ctx = canvas.getContext('2d');
    if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.6);
      
      if (imageData && imageData.length > 100) {
        setCapturedImage(imageData);
        stopCamera();
        analyzeImage(imageData);
      } else {
        toast({
          title: "Capture failed",
          description: "Unable to capture image. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Video not ready",
        description: "Please wait for video to load.",
        variant: "destructive",
      });
    }
  }, [isCameraReady, stopCamera, toast]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 512;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        } else {
          reject(new Error('Canvas context error'));
        }
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file",
          description: "Please upload an image file.",
          variant: "destructive",
        });
        return;
      }
      
      try {
        const imageData = await compressImage(file);
        setCapturedImage(imageData);
        analyzeImage(imageData);
      } catch {
        toast({
          title: "Read error",
          description: "Failed to process the image.",
          variant: "destructive",
        });
      }
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
              muted
              className="w-full rounded-lg bg-muted"
            />
            <canvas ref={canvasRef} className="hidden" />
            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            )}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
              <Button variant="secondary" onClick={stopCamera}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={capturePhoto} disabled={!isCameraReady}>
                <Camera className="w-4 h-4 mr-2" />
                {isCameraReady ? 'Capture' : 'Loading...'}
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
