import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Printer, Plus, Trash2, Download, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface QRCode {
  id: string;
  code: string;
}

const generateUniqueCode = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ECO-${timestamp}-${random}`.toUpperCase();
};

export default function QRGeneratorPage() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [quantity, setQuantity] = useState(6);

  const isAdmin = role === 'admin';

  // Restrict access to admin only
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

  const generateCodes = () => {
    const newCodes: QRCode[] = [];
    for (let i = 0; i < quantity; i++) {
      newCodes.push({
        id: crypto.randomUUID(),
        code: generateUniqueCode()
      });
    }
    setQrCodes(prev => [...prev, ...newCodes]);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Hidden when printing */}
      <header className="p-4 bg-card border-b border-border print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">QR Code Generator</h1>
            <p className="text-sm text-muted-foreground">Create printable bag stickers</p>
          </div>
        </div>
      </header>

      {/* Controls - Hidden when printing */}
      <div className="p-4 space-y-4 print:hidden">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm font-medium text-foreground">Quantity:</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="h-9 px-3 rounded-lg border border-input bg-background text-foreground"
              >
                <option value={3}>3 codes</option>
                <option value={6}>6 codes</option>
                <option value={9}>9 codes</option>
                <option value={12}>12 codes</option>
              </select>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button onClick={generateCodes}>
                <Plus className="w-4 h-4 mr-2" />
                Generate Codes
              </Button>
              
              {qrCodes.length > 0 && (
                <>
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

        {qrCodes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No QR Codes Yet</h3>
            <p className="text-muted-foreground text-sm">Generate codes to create printable stickers</p>
          </div>
        )}
      </div>

      {/* QR Code Grid */}
      {qrCodes.length > 0 && (
        <div className="p-4 print:p-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 print:gap-2 print:grid-cols-3">
            {qrCodes.map((qr) => (
              <div 
                key={qr.id} 
                className="relative group bg-card border border-border rounded-xl p-4 print:rounded-lg print:p-3 print:border-2 print:border-dashed print:border-muted-foreground"
              >
                {/* Delete button - Hidden when printing */}
                <button
                  onClick={() => removeCode(qr.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity print:hidden"
                >
                  <Trash2 className="w-3 h-3" />
                </button>

                <div className="flex flex-col items-center">
                  {/* Logo */}
                  <div className="text-center mb-2 print:mb-1">
                    <span className="text-lg font-bold text-primary print:text-sm">🌱 EcoSort</span>
                  </div>
                  
                  {/* QR Code */}
                  <div className="bg-white p-2 rounded-lg">
                    <QRCodeSVG
                      value={qr.code}
                      size={120}
                      level="M"
                      className="print:w-24 print:h-24"
                    />
                  </div>
                  
                  {/* Code text */}
                  <p className="mt-2 text-xs font-mono text-muted-foreground text-center break-all print:text-[8px]">
                    {qr.code}
                  </p>
                  
                  {/* Instructions */}
                  <p className="mt-1 text-[10px] text-muted-foreground text-center print:text-[7px]">
                    Scan to activate bag
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Print Styles */}
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