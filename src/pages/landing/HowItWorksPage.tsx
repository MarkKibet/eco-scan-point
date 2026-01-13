import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LandingLayout from '@/components/landing/LandingLayout';
import { 
  ArrowRight,
  UserPlus,
  Package,
  QrCode,
  Truck,
  CheckCircle,
  Gift,
  Recycle,
  Leaf,
  Trash2
} from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Create Your Account',
    description: 'Sign up for free in seconds. Just provide your email and basic information to get started.',
    icon: UserPlus,
    details: [
      'Quick email verification',
      'Set up your household profile',
      'Choose your preferred language',
    ],
  },
  {
    number: '02',
    title: 'Receive Your Bags',
    description: 'Get your color-coded bags with unique QR codes. Each bag type is designed for specific waste.',
    icon: Package,
    details: [
      'Blue bags for recyclables (15 points)',
      'Green bags for biodegradables (5 points)',
      'Black bags for residual waste (1 point)',
    ],
  },
  {
    number: '03',
    title: 'Sort & Scan',
    description: 'Sort your waste into the appropriate bags. When ready, scan the QR code to activate.',
    icon: QrCode,
    details: [
      'Easy-to-use mobile scanner',
      'Instant bag activation',
      'AI-powered waste recognition help',
    ],
  },
  {
    number: '04',
    title: 'Collection',
    description: 'Place your bags for collection. Our collectors scan and verify proper segregation.',
    icon: Truck,
    details: [
      'Scheduled collection days',
      'Real-time tracking',
      'Collector verification system',
    ],
  },
  {
    number: '05',
    title: 'Verification & Approval',
    description: 'Collectors review your bags. Properly sorted waste earns you points!',
    icon: CheckCircle,
    details: [
      'Quality check by trained collectors',
      'Instant feedback if improvements needed',
      'Points credited automatically',
    ],
  },
  {
    number: '06',
    title: 'Earn & Redeem',
    description: 'Accumulate points and redeem them for exciting rewards from our partners.',
    icon: Gift,
    details: [
      'Wide range of reward options',
      'Partner discounts and vouchers',
      'Community recognition',
    ],
  },
];

const bagTypes = [
  {
    color: 'bg-blue-600',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-600',
    bgLight: 'bg-blue-50 dark:bg-blue-950',
    name: 'Blue Bag - Recyclables',
    points: '15 points per bag',
    icon: Recycle,
    items: [
      'Plastic bottles & containers',
      'Cardboard & paper',
      'Glass bottles & jars',
      'Metal cans & aluminum',
      'Clean plastic bags',
      'Newspapers & magazines',
    ],
  },
  {
    color: 'bg-green-600',
    borderColor: 'border-green-500',
    textColor: 'text-green-600',
    bgLight: 'bg-green-50 dark:bg-green-950',
    name: 'Green Bag - Biodegradables',
    points: '5 points per bag',
    icon: Leaf,
    items: [
      'Food scraps & leftovers',
      'Fruit & vegetable peels',
      'Coffee grounds & tea bags',
      'Yard waste & grass',
      'Eggshells',
      'Paper towels (unbleached)',
    ],
  },
  {
    color: 'bg-gray-900',
    borderColor: 'border-gray-500',
    textColor: 'text-gray-900 dark:text-gray-300',
    bgLight: 'bg-gray-100 dark:bg-gray-900',
    name: 'Black Bag - Residuals',
    points: '1 point per bag',
    icon: Trash2,
    items: [
      'Styrofoam containers',
      'Broken ceramics',
      'Diapers & sanitary products',
      'Mixed materials',
      'Non-recyclable plastics',
      'Greasy food packaging',
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=1920&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              How TakaTrace Works
            </h1>
            <p className="text-xl text-muted-foreground">
              Our simple 6-step process makes waste management rewarding and easy. 
              Learn how to start earning points for proper recycling today.
            </p>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Watch Our Quick Guide
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              See TakaTrace in action with this short tutorial video
            </p>
            
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/6jQ7y_qQYUA?rel=0"
                title="TakaTrace Tutorial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              6 Simple Steps
            </h2>
            <p className="text-lg text-muted-foreground">
              From signup to rewards, here's your complete journey
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative flex gap-6 mb-12 last:mb-0">
                {/* Timeline */}
                <div className="hidden md:flex flex-col items-center">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-xl shadow-eco">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-primary/20 my-4" />
                  )}
                </div>
                
                {/* Content */}
                <Card className="flex-1 hover:shadow-card-hover transition-shadow">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 md:hidden">
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="md:hidden text-sm font-bold text-primary">Step {step.number}</span>
                          <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                        </div>
                        <p className="text-muted-foreground mb-4">{step.description}</p>
                        <ul className="space-y-2">
                          {step.details.map((detail, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="hidden md:block w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <step.icon className="w-7 h-7 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bag Types Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Understanding the Bag Colors
            </h2>
            <p className="text-lg text-muted-foreground">
              Each color represents a specific type of waste. Here's what goes where.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {bagTypes.map((bag, index) => (
              <Card key={index} className={`${bag.bgLight} border-2 ${bag.borderColor} overflow-hidden`}>
                <div className={`${bag.color} p-6 text-center`}>
                  <bag.icon className="w-12 h-12 text-white mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-white">{bag.name}</h3>
                  <p className="text-white/80 text-sm">{bag.points}</p>
                </div>
                <CardContent className="p-6">
                  <h4 className={`font-semibold ${bag.textColor} mb-3`}>What to include:</h4>
                  <ul className="space-y-2">
                    {bag.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className={`w-4 h-4 ${bag.textColor} flex-shrink-0`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pro Tips for Maximum Points
            </h2>
            <p className="text-lg text-muted-foreground">
              Follow these tips to ensure your bags are approved and earn full points
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: 'Rinse Containers',
                description: 'Clean food residue from containers before placing in recyclables bag.',
              },
              {
                title: 'Keep It Dry',
                description: 'Avoid putting wet items in recyclables. Moisture can contaminate the batch.',
              },
              {
                title: 'No Mixed Materials',
                description: 'Items made of multiple materials (like chip bags) go in residual.',
              },
              {
                title: 'Flatten Cardboard',
                description: 'Break down boxes to save space and make collection easier.',
              },
              {
                title: 'Check Labels',
                description: 'Look for recycling symbols on products to determine proper disposal.',
              },
              {
                title: 'When in Doubt',
                description: "If unsure, use our AI scanner or place in residual bag to avoid contamination.",
              },
            ].map((tip, index) => (
              <Card key={index} className="hover:shadow-card-hover transition-shadow">
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of households already making a difference while earning rewards.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="font-semibold px-10">
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </LandingLayout>
  );
}
