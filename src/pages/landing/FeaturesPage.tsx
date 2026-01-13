import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LandingLayout from '@/components/landing/LandingLayout';
import { 
  ArrowRight,
  QrCode,
  BarChart3,
  Gift,
  Shield,
  Smartphone,
  Users,
  Bell,
  Camera,
  Map,
  FileText,
  Zap,
  CheckCircle
} from 'lucide-react';

const mainFeatures = [
  {
    icon: QrCode,
    title: 'Smart QR Tracking',
    description: 'Every bag is uniquely identified with a QR code, enabling complete traceability from your home to final processing.',
    benefits: [
      'Instant bag activation via scan',
      'Complete chain of custody',
      'Fraud prevention',
      'Easy mobile scanning',
    ],
    image: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: Camera,
    title: 'AI Waste Recognition',
    description: 'Not sure where something goes? Our AI-powered scanner helps identify items and suggests the correct bag.',
    benefits: [
      'Instant item identification',
      'Sorting recommendations',
      'Learn as you go',
      'Reduce contamination',
    ],
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: Gift,
    title: 'Rewards System',
    description: 'Earn points for every properly sorted bag. Redeem them for discounts, vouchers, and exclusive perks.',
    benefits: [
      'Points for every approved bag',
      'Wide range of rewards',
      'Partner discounts',
      'Monthly bonus challenges',
    ],
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=600&q=80',
  },
  {
    icon: BarChart3,
    title: 'Impact Dashboard',
    description: 'Track your environmental impact with detailed analytics showing your contribution to sustainability.',
    benefits: [
      'Personal impact metrics',
      'Community comparisons',
      'Historical tracking',
      'Shareable achievements',
    ],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
  },
];

const additionalFeatures = [
  {
    icon: Smartphone,
    title: 'Mobile-First Design',
    description: 'Optimized for smartphones with an intuitive interface that works seamlessly on any device.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Get reminders for collection days and updates on your bag status and points.',
  },
  {
    icon: Map,
    title: 'Collection Tracking',
    description: 'Know exactly when collectors are in your area with real-time location updates.',
  },
  {
    icon: Users,
    title: 'Family Accounts',
    description: 'Link family members to your account and track collective household impact.',
  },
  {
    icon: FileText,
    title: 'Detailed History',
    description: 'Access complete records of all your bags, points earned, and rewards redeemed.',
  },
  {
    icon: Shield,
    title: 'Data Security',
    description: 'Your information is encrypted and protected with enterprise-grade security.',
  },
];

const organizationFeatures = [
  {
    title: 'Admin Dashboard',
    description: 'Comprehensive management interface for municipalities and organizations.',
  },
  {
    title: 'Bulk QR Generation',
    description: 'Generate thousands of QR codes for distribution with easy print options.',
  },
  {
    title: 'Collector App',
    description: 'Dedicated mobile app for waste collectors to scan and verify bags.',
  },
  {
    title: 'Analytics & Reports',
    description: 'Detailed reports on collection rates, diversion metrics, and trends.',
  },
  {
    title: 'API Integration',
    description: 'Connect TakaTrace with your existing waste management systems.',
  },
  {
    title: 'Custom Branding',
    description: 'White-label options to match your organization branding.',
  },
];

export default function FeaturesPage() {
  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1920&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Powerful Features
            </h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to make waste management simple, rewarding, and impactful.
            </p>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Core Features
            </h2>
            <p className="text-lg text-muted-foreground">
              The essential tools that make TakaTrace the leading waste management platform
            </p>
          </div>
          
          <div className="space-y-20 max-w-6xl mx-auto">
            {mainFeatures.map((feature, index) => (
              <div 
                key={index} 
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-muted-foreground mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-3 text-muted-foreground">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                  <div 
                    className="aspect-[4/3] rounded-2xl bg-cover bg-center shadow-2xl"
                    style={{ backgroundImage: `url('${feature.image}')` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              And So Much More
            </h2>
            <p className="text-lg text-muted-foreground">
              Additional features that enhance your experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {additionalFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-card-hover transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Organizations */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">For Organizations</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Enterprise-Grade Features
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Municipalities and organizations get access to powerful administrative tools 
                designed to manage waste collection at scale.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {organizationFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Link to="/contact">
                  <Button size="lg" className="font-semibold shadow-eco-lg">
                    Schedule a Demo
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div 
                className="aspect-square rounded-3xl bg-cover bg-center shadow-2xl"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80')`,
                }}
              />
              <div className="absolute -bottom-6 -right-6 p-6 bg-card rounded-2xl shadow-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Real-time Analytics</p>
                    <p className="text-sm text-muted-foreground">Track everything</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Experience All Features Today
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Sign up for free and discover how TakaTrace can transform your waste management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="font-semibold px-10">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button size="lg" variant="outline" className="font-semibold px-10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
