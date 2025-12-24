import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { TrashScanner } from '@/components/TrashScanner';

export default function TrashScannerPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24 animate-fade-in">
      <header className="p-4 bg-card border-b border-border flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-bold text-foreground">AI Trash Sorter</h1>
      </header>

      <div className="p-4">
        <p className="text-muted-foreground text-sm mb-4">
          Take a photo or upload an image of your trash items, and our AI will tell you exactly how to sort them.
        </p>
        <TrashScanner />
      </div>
    </div>
  );
}
