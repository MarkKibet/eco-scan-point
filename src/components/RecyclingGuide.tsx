import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface RecyclingGuideProps {
  compact?: boolean;
}

export const RECYCLABLES_ITEMS = [
  'Plastic bottles & containers',
  'Cardboard & paper',
  'Glass bottles & jars',
  'Metal cans & tins',
  'Newspapers & magazines',
  'Milk & juice cartons',
  'Clean aluminum foil',
  'Plastic bags (clean & dry)'
];

export const ORGANICS_ITEMS = [
  'Food scraps & leftovers',
  'Fruit & vegetable peels',
  'Coffee grounds & tea bags',
  'Eggshells',
  'Yard waste & grass clippings',
  'Leaves & small branches',
  'Paper towels (unbleached)',
  'Spoiled food'
];

export const NON_RECYCLABLE_ITEMS = [
  'Styrofoam containers',
  'Plastic film & wrap',
  'Broken ceramics',
  'Diapers',
  'Medical waste',
  'Batteries & electronics',
  'Paint & chemicals',
  'Greasy pizza boxes'
];

export default function RecyclingGuide({ compact = false }: RecyclingGuideProps) {
  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-green-600" />
              <span className="text-green-600">Biodegradables (Green)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ul className="text-[10px] text-muted-foreground space-y-0.5">
              {ORGANICS_ITEMS.slice(0, 4).map((item, i) => (
                <li key={i} className="flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5 text-green-600 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-green-600 font-medium mt-1">5 points per bag</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-blue-600">Recyclables (Blue)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ul className="text-[10px] text-muted-foreground space-y-0.5">
              {RECYCLABLES_ITEMS.slice(0, 4).map((item, i) => (
                <li key={i} className="flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5 text-blue-600 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-blue-600 font-medium mt-1">15 points per bag</p>
          </CardContent>
        </Card>

        <Card className="border-gray-500/50 bg-gray-500/5 col-span-2">
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-gray-900 dark:text-gray-400" />
              <span className="text-gray-900 dark:text-gray-400">Residuals (Black)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ul className="text-[10px] text-muted-foreground space-y-0.5 grid grid-cols-2 gap-x-2">
              {NON_RECYCLABLE_ITEMS.slice(0, 4).map((item, i) => (
                <li key={i} className="flex items-center gap-1">
                  <Trash2 className="w-2.5 h-2.5 text-gray-900 dark:text-gray-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-gray-900 dark:text-gray-400 font-medium mt-1">1 point per bag</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-green-500/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-green-600">Biodegradables - Green Bag</span>
              <p className="text-xs font-normal text-green-600">5 points per approved bag</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {ORGANICS_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-500/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-blue-600">Recyclables - Blue Bag</span>
              <p className="text-xs font-normal text-blue-600">15 points per approved bag</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {RECYCLABLES_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-500/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-900 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-gray-900 dark:text-gray-300">Residuals - Black Bag</span>
              <p className="text-xs font-normal text-gray-600 dark:text-gray-400">1 point per approved bag</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {NON_RECYCLABLE_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Trash2 className="w-3.5 h-3.5 text-gray-900 dark:text-gray-400 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function BagTypeSelector({
  value,
  onChange
}: {
  value: 'recyclable' | 'organic' | 'residual';
  onChange: (value: 'recyclable' | 'organic' | 'residual') => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        onClick={() => onChange('organic')}
        className={`p-3 rounded-lg border-2 transition-all ${
          value === 'organic'
            ? 'border-green-500 bg-green-500/10'
            : 'border-border hover:border-green-500/50'
        }`}
      >
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
            <Leaf className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-foreground">Green</p>
            <p className="text-[10px] text-muted-foreground">Bio • 5 pts</p>
          </div>
        </div>
      </button>

      <button
        onClick={() => onChange('recyclable')}
        className={`p-3 rounded-lg border-2 transition-all ${
          value === 'recyclable'
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-border hover:border-blue-500/50'
        }`}
      >
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
            <Trash2 className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-foreground">Blue</p>
            <p className="text-[10px] text-muted-foreground">Recycle • 15 pts</p>
          </div>
        </div>
      </button>

      <button
        onClick={() => onChange('residual')}
        className={`p-3 rounded-lg border-2 transition-all ${
          value === 'residual'
            ? 'border-gray-700 bg-gray-900/10'
            : 'border-border hover:border-gray-700/50'
        }`}
      >
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-6 h-6 bg-gray-900 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Trash2 className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-foreground">Black</p>
            <p className="text-[10px] text-muted-foreground">Residual • 1 pt</p>
          </div>
        </div>
      </button>
    </div>
  );
}
