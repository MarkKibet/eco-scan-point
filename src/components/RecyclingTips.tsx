import { Lightbulb, Recycle, Leaf, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';

const tips = [
  {
    id: '1',
    icon: Recycle,
    title: 'Rinse containers',
    content: 'Clean food containers before recycling to prevent contamination.',
  },
  {
    id: '2',
    icon: Leaf,
    title: 'Flatten cardboard',
    content: 'Break down boxes to save space in recycling bins.',
  },
  {
    id: '3',
    icon: Trash2,
    title: 'Check labels',
    content: 'Look for recycling symbols to know what can be recycled.',
  },
  {
    id: '4',
    icon: Lightbulb,
    title: 'Separate waste',
    content: 'Keep recyclables separate from general waste for more points.',
  },
];

export function RecyclingTips() {
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const tip = tips[currentTip];
  const Icon = tip.icon;

  return (
    <Card className="bg-eco-green-light border-eco-green/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground text-sm">{tip.title}</h4>
            <p className="text-muted-foreground text-sm mt-0.5">{tip.content}</p>
          </div>
        </div>
        <div className="flex gap-1 mt-3 justify-center">
          {tips.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentTip(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentTip ? 'bg-primary w-4' : 'bg-primary/30'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
