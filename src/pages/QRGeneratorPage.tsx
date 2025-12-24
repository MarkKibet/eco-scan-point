import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Printer, Plus, Trash2, Download, ShieldAlert, Leaf, Package, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import JSZip from 'jszip';
interface QRCode {
  id: string;
  code: string;
  bagType: 'recyclable' | 'biodegradable' | 'residual';
  points: number;
}

const generateUniqueCode = (bagType: 'recyclable' | 'biodegradable' | 'residual') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  const prefix = bagType === 'recyclable' ? 'WWR' : bagType === 'biodegradable' ? 'WWO' : 'WWS';
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
};

const getAppUrl = () => {
  return window.location.origin;
};

const generateQRUrl = (code: string) => {
  return `${getAppUrl()}/scan?code=${encodeURIComponent(code)}`;
};

export default function QRGeneratorPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [quantity, setQuantity] = useState(6);
  const [customQuantity, setCustomQuantity] = useState('');
  const [selectedBagType, setSelectedBagType] = useState<'recyclable' | 'biodegradable' | 'residual'>('recyclable');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const isAdmin = role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-destructive/10 rounded-2xl flex items-center justify-center mb-4">
          <ShieldAlert className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Access Restricted</h1>
        <p className="text-muted-foreground text-center mb-6">
          Only administrators can generate QR codes
        </p>
        <Button onClick={() => navigate('/')}>Go Back Home</Button>
      </div>
    );
  }

  const generateCodes = async () => {
    const actualQuantity = customQuantity ? parseInt(customQuantity, 10) : quantity;
    
    if (isNaN(actualQuantity) || actualQuantity < 1) {
      toast.error('Please enter a valid quantity');
      return;
    }
    
    if (actualQuantity > 1000) {
      toast.error('Maximum 1000 codes at once');
      return;
    }

    setIsGenerating(true);
    const points = selectedBagType === 'recyclable' ? 15 : selectedBagType === 'biodegradable' ? 5 : 1;
    const newCodes: QRCode[] = [];
    
    // Generate in batches to avoid blocking UI
    const batchSize = 100;
    for (let i = 0; i < actualQuantity; i++) {
      newCodes.push({
        id: crypto.randomUUID(),
        code: generateUniqueCode(selectedBagType),
        bagType: selectedBagType,
        points
      });
      
      // Yield to UI every batch
      if (i > 0 && i % batchSize === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    setQrCodes(prev => [...prev, ...newCodes]);
    setCustomQuantity('');
    const colorLabel = selectedBagType === 'recyclable' ? 'Blue' : selectedBagType === 'biodegradable' ? 'Green' : 'Red';
    toast.success(`Generated ${actualQuantity} ${colorLabel} bag codes`);
    setIsGenerating(false);
  };

  const removeCode = (id: string) => {
    setQrCodes(prev => prev.filter(qr => qr.id !== id));
  };

  const clearAll = () => {
    setQrCodes([]);
  };

  const handlePrint = () => {
    window.print();
  };

  const generateQRImage = useCallback((qr: QRCode): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const svg = document.getElementById(`qr-${qr.id}`) as unknown as SVGSVGElement;
      
      if (!svg) {
        reject(new Error('Could not find QR element'));
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        canvas.width = 300;
        canvas.height = 420;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          const bagColor = qr.bagType === 'recyclable' ? '#2563EB' : qr.bagType === 'biodegradable' ? '#16A34A' : '#DC2626';
          const bagLabel = qr.bagType === 'recyclable' ? 'RECYCLABLES' : qr.bagType === 'biodegradable' ? 'BIODEGRADABLE' : 'RESIDUAL';
          const bagPoints = qr.bagType === 'recyclable' ? '15 Points' : qr.bagType === 'biodegradable' ? '5 Points' : '1 Point';
          
          ctx.fillStyle = bagColor;
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('WasteWise', canvas.width / 2, 30);
          
          ctx.font = 'bold 14px Arial';
          ctx.fillText(bagLabel, canvas.width / 2, 52);
          
          ctx.drawImage(img, 50, 70, 200, 200);
          
          ctx.fillStyle = '#666';
          ctx.font = '11px monospace';
          ctx.fillText(qr.code, canvas.width / 2, 295);
          
          ctx.fillStyle = bagColor;
          ctx.font = 'bold 14px Arial';
          ctx.fillText(bagPoints, canvas.width / 2, 320);
          
          ctx.fillStyle = '#888';
          ctx.font = '10px Arial';
          ctx.fillText('Scan to activate bag', canvas.width / 2, 345);
          
          canvas.toBlob((blob) => {
            URL.revokeObjectURL(svgUrl);
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/png');
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = svgUrl;
    });
  }, []);

  const downloadAllAsZip = async () => {
    if (qrCodes.length === 0) return;
    
    setIsDownloadingAll(true);
    toast.info(`Preparing ${qrCodes.length} QR codes for download...`);
    
    try {
      const zip = new JSZip();
      const folders: Record<string, JSZip> = {
        recyclable: zip.folder('recyclable')!,
        biodegradable: zip.folder('biodegradable')!,
        residual: zip.folder('residual')!,
      };
      
      let processed = 0;
      const batchSize = 10;
      
      for (let i = 0; i < qrCodes.length; i += batchSize) {
        const batch = qrCodes.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (qr) => {
          try {
            const blob = await generateQRImage(qr);
            const filename = `${qr.code}.png`;
            folders[qr.bagType].file(filename, blob);
            processed++;
          } catch (error) {
            console.error(`Failed to generate QR for ${qr.code}:`, error);
          }
        }));
        
        // Update progress
        if (processed % 50 === 0) {
          toast.info(`Processing: ${processed}/${qrCodes.length} codes...`);
        }
      }
      
      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `wastewise-qrcodes-${new Date().toISOString().split('T')[0]}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
      
      toast.success(`Downloaded ${processed} QR codes as ZIP!`);
    } catch (error) {
      console.error('Error creating ZIP:', error);
      toast.error('Failed to create ZIP file');
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const downloadSingleQR = (qr: QRCode) => {
    const canvas = document.createElement('canvas');
    const svg = document.getElementById(`qr-${qr.id}`) as unknown as SVGSVGElement;
    
    if (!svg) {
      toast.error('Could not generate download');
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const img = new Image();
    img.onload = () => {
      canvas.width = 300;
      canvas.height = 420;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const bagColor = qr.bagType === 'recyclable' ? '#2563EB' : qr.bagType === 'biodegradable' ? '#16A34A' : '#DC2626';
        const bagLabel = qr.bagType === 'recyclable' ? '♻️ RECYCLABLES' : qr.bagType === 'biodegradable' ? '🌿 BIODEGRADABLE' : '🗑️ RESIDUAL';
        const bagPoints = qr.bagType === 'recyclable' ? '15 Points' : qr.bagType === 'biodegradable' ? '5 Points' : '1 Point';
        
        ctx.fillStyle = bagColor;
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('WasteWise', canvas.width / 2, 30);
        
        ctx.font = 'bold 14px Arial';
        ctx.fillText(bagLabel, canvas.width / 2, 52);
        
        ctx.drawImage(img, 50, 70, 200, 200);
        
        ctx.fillStyle = '#666';
        ctx.font = '11px monospace';
        ctx.fillText(qr.code, canvas.width / 2, 295);
        
        ctx.fillStyle = bagColor;
        ctx.font = 'bold 14px Arial';
        ctx.fillText(bagPoints, canvas.width / 2, 320);
        
        ctx.fillStyle = '#888';
        ctx.font = '10px Arial';
        ctx.fillText('Scan to activate bag', canvas.width / 2, 345);
        
        const link = document.createElement('a');
        link.download = `wastewise-${qr.bagType}-${qr.code}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        toast.success('QR Code downloaded!');
      }
      
      URL.revokeObjectURL(svgUrl);
    };
    img.src = svgUrl;
  };

  const recyclableCodes = qrCodes.filter(qr => qr.bagType === 'recyclable');
  const biodegradableCodes = qrCodes.filter(qr => qr.bagType === 'biodegradable');
  const residualCodes = qrCodes.filter(qr => qr.bagType === 'residual');

  return (
    <div className="min-h-screen bg-background">
      <header className="p-4 bg-card border-b border-border print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => navigate('/')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">QR Code Generator</h1>
            <p className="text-sm text-muted-foreground">Create printable bag stickers</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4 print:hidden">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Select Bag Type:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedBagType('recyclable')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedBagType === 'recyclable'
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                      : 'border-border hover:border-blue-400'
                  }`}
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full mx-auto mb-1 flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-blue-600">Recyclable</p>
                  <p className="text-[10px] text-muted-foreground">Blue • 15pts</p>
                </button>
                <button
                  onClick={() => setSelectedBagType('biodegradable')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedBagType === 'biodegradable'
                      ? 'border-green-600 bg-green-50 dark:bg-green-950'
                      : 'border-border hover:border-green-400'
                  }`}
                >
                  <div className="w-8 h-8 bg-green-600 rounded-full mx-auto mb-1 flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-green-600">Biodegradable</p>
                  <p className="text-[10px] text-muted-foreground">Green • 5pts</p>
                </button>
                <button
                  onClick={() => setSelectedBagType('residual')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedBagType === 'residual'
                      ? 'border-red-600 bg-red-50 dark:bg-red-950'
                      : 'border-border hover:border-red-400'
                  }`}
                >
                  <div className="w-8 h-8 bg-red-600 rounded-full mx-auto mb-1 flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-red-600">Residual</p>
                  <p className="text-[10px] text-muted-foreground">Red • 1pt</p>
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground block">Quantity:</label>
              <div className="flex flex-wrap gap-2">
                {[6, 12, 25, 50, 100, 250, 500].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setQuantity(num);
                      setCustomQuantity('');
                    }}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                      quantity === num && !customQuantity
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">or custom:</span>
                <Input
                  type="number"
                  placeholder="Enter amount (max 1000)"
                  value={customQuantity}
                  onChange={(e) => {
                    setCustomQuantity(e.target.value);
                  }}
                  className="w-40"
                  min={1}
                  max={1000}
                />
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={generateCodes} disabled={isGenerating}>
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {isGenerating ? 'Generating...' : `Generate ${customQuantity || quantity} Codes`}
              </Button>
              
              {qrCodes.length > 0 && (
                <>
                  <Button variant="outline" onClick={downloadAllAsZip} disabled={isDownloadingAll}>
                    {isDownloadingAll ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Package className="w-4 h-4 mr-2" />
                    )}
                    {isDownloadingAll ? 'Creating ZIP...' : 'Download All (ZIP)'}
                  </Button>
                  <Button variant="outline" onClick={handlePrint}>
                    <Printer className="w-4 h-4 mr-2" />
                    Print Stickers
                  </Button>
                  <Button variant="outline" onClick={clearAll} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {qrCodes.length > 0 && (
          <div className="flex gap-4 text-sm flex-wrap">
            <span className="text-blue-600 font-medium">🔵 Recyclables: {recyclableCodes.length}</span>
            <span className="text-green-600 font-medium">🟢 Biodegradable: {biodegradableCodes.length}</span>
            <span className="text-red-600 font-medium">🔴 Residual: {residualCodes.length}</span>
          </div>
        )}

        {qrCodes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No QR Codes Yet</h3>
            <p className="text-muted-foreground text-sm">Select bag type and generate codes to create printable stickers</p>
          </div>
        )}
      </div>

      {qrCodes.length > 0 && (
        <div className="p-4 print:p-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 print:gap-2 print:grid-cols-3">
            {qrCodes.map((qr) => {
              const getBorderColor = () => {
                if (qr.bagType === 'recyclable') return 'border-blue-500/50';
                if (qr.bagType === 'biodegradable') return 'border-green-500/50';
                return 'border-red-500/50';
              };
              const getTextColor = () => {
                if (qr.bagType === 'recyclable') return 'text-blue-600';
                if (qr.bagType === 'biodegradable') return 'text-green-600';
                return 'text-red-600';
              };
              const getQRColor = () => {
                if (qr.bagType === 'recyclable') return '#2563EB';
                if (qr.bagType === 'biodegradable') return '#16A34A';
                return '#DC2626';
              };
              const getLabel = () => {
                if (qr.bagType === 'recyclable') return '♻️ RECYCLABLES';
                if (qr.bagType === 'biodegradable') return '🌿 BIODEGRADABLE';
                return '🗑️ RESIDUAL';
              };
              
              return (
                <div 
                  key={qr.id} 
                  className={`relative group bg-card border-2 rounded-xl p-4 print:rounded-lg print:p-3 print:border-dashed ${getBorderColor()}`}
                >
                <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                  <button
                    onClick={() => downloadSingleQR(qr)}
                    className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center"
                    title="Download"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeCode(qr.id)}
                    className="w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex flex-col items-center">
                  <div className="text-center mb-2 print:mb-1">
                    <span className={`text-lg font-bold print:text-sm ${getTextColor()}`}>
                      WasteWise
                    </span>
                    <p className={`text-xs font-medium ${getTextColor()}`}>
                      {getLabel()}
                    </p>
                  </div>
                  
                  <div className="bg-white p-2 rounded-lg">
                    <QRCodeSVG
                      id={`qr-${qr.id}`}
                      value={generateQRUrl(qr.code)}
                      size={120}
                      level="M"
                      fgColor={getQRColor()}
                      className="print:w-24 print:h-24"
                    />
                  </div>
                  
                  <p className="mt-2 text-xs font-mono text-muted-foreground text-center break-all print:text-[8px]">
                    {qr.code}
                  </p>
                  
                  <p className={`mt-1 text-xs font-bold ${getTextColor()}`}>
                    {qr.points} {qr.points === 1 ? 'Point' : 'Points'}
                  </p>
                  
                  <p className="mt-0.5 text-[10px] text-muted-foreground text-center print:text-[7px]">
                    Scan to activate bag
                  </p>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}