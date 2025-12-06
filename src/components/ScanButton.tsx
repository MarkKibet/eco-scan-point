import { QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function ScanButton() {
  const navigate = useNavigate();

  return (
    <Button
      variant="scan"
      onClick={() => navigate('/scan')}
      className="w-full max-w-xs animate-float"
    >
      <QrCode className="w-8 h-8" />
      <span>Scan Bag QR</span>
    </Button>
  );
}
