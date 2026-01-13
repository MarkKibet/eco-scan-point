import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LandingLayout from '@/components/landing/LandingLayout';
import { 
  ArrowRight, 
  Leaf, 
  Recycle, 
  Gift, 
  QrCode, 
  BarChart3, 
  Users, 
  Shield,
  Play,
  CheckCircle,
  Star,
  TrendingUp,
  Globe
} from 'lucide-react';

const features = [
  {
    icon: QrCode,
    title: 'Smart QR Tracking',
    description: 'Each waste bag has a unique QR code for complete traceability from household to processing.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    icon: Recycle,
    title: 'Proper Segregation',
    description: 'Color-coded bags for recyclables, biodegradables, and residuals make sorting simple.',
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    icon: Gift,
    title: 'Earn Rewards',
    description: 'Get points for proper waste segregation and redeem them for exciting rewards.',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  {
    icon: BarChart3,
    title: 'Impact Analytics',
    description: 'Track your environmental impact with detailed statistics and insights.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
];

const stats = [
  { value: '50K+', label: 'Active Households' },
  { value: '2M+', label: 'Bags Tracked' },
  { value: '500T', label: 'Waste Diverted' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const testimonials = [
  {
    quote: "TakaTrace has transformed how our community handles waste. The rewards system keeps everyone motivated!",
    author: "Sarah M.",
    role: "Community Leader",
    rating: 5,
  },
  {
    quote: "As a municipality, the tracking and analytics have been invaluable for planning and reporting.",
    author: "James K.",
    role: "Environmental Officer",
    rating: 5,
  },
  {
    quote: "My kids love scanning the QR codes and checking our points. It's made recycling fun for the whole family.",
    author: "Grace W.",
    role: "Household User",
    rating: 5,
  },
];

const bagTypes = [
  { color: 'bg-blue-600', label: 'Blue - Recyclables', points: '15 pts', items: 'Plastics, paper, metals, glass' },
  { color: 'bg-green-600', label: 'Green - Biodegradables', points: '5 pts', items: 'Food scraps, yard waste' },
  { color: 'bg-gray-900', label: 'Black - Residuals', points: '1 pt', items: 'Non-recyclable items' },
];

export default function WelcomePage() {
  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1920&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <Leaf className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Sustainable Waste Management</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-in">
              Transform Your Waste Into
              <span className="text-primary block">Meaningful Rewards</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in">
              TakaTrace revolutionizes waste management by tracking every bag from your home to proper disposal. 
              Earn points for proper segregation and help build a cleaner, greener future.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto text-base font-semibold shadow-eco-lg px-8">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base font-semibold px-8">
                  <Play className="w-5 h-5 mr-2" />
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-muted-foreground animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Free to join</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span>50,000+ Users</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute right-10 top-1/3 hidden lg:block animate-float">
          <div className="w-20 h-20 rounded-2xl bg-blue-600/20 backdrop-blur-sm border border-blue-500/30 flex items-center justify-center">
            <Recycle className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="absolute right-32 bottom-1/3 hidden lg:block animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-16 h-16 rounded-xl bg-green-600/20 backdrop-blur-sm border border-green-500/30 flex items-center justify-center">
            <Leaf className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary/5 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bag Types Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple Color-Coded System
            </h2>
            <p className="text-lg text-muted-foreground">
              Three bag types make waste segregation easy for everyone
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {bagTypes.map((bag, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-card-hover transition-all duration-300">
                <div className={`absolute top-0 left-0 right-0 h-2 ${bag.color}`} />
                <CardContent className="p-6 pt-8">
                  <div className={`w-16 h-16 ${bag.color} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                    <Recycle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground text-center mb-2">{bag.label}</h3>
                  <p className="text-sm text-muted-foreground text-center mb-3">{bag.items}</p>
                  <p className="text-center font-bold text-primary">{bag.points}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for
              <span className="text-primary block">Smart Waste Management</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features designed for households and organizations alike
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-card-hover transition-all duration-300 border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1920&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-foreground/80" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-background mb-4">
              Learn How Recycling Works
            </h2>
            <p className="text-lg text-background/70 mb-10">
              Watch this quick guide on proper waste segregation and make a real difference
            </p>
            
            {/* Embedded YouTube Video */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/6jQ7y_qQYUA?rel=0"
                title="Recycling Guide"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            
            <p className="mt-6 text-background/60 text-sm">
              Learn the basics of proper waste sorting in under 5 minutes
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Preview */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How TakaTrace Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Four simple steps to start earning rewards for recycling
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { step: '1', title: 'Sign Up', description: 'Create your free account in seconds', icon: Users },
              { step: '2', title: 'Get Bags', description: 'Receive color-coded bags with QR codes', icon: QrCode },
              { step: '3', title: 'Sort & Scan', description: 'Sort your waste and scan when ready', icon: Recycle },
              { step: '4', title: 'Earn Points', description: 'Get rewarded for proper disposal', icon: Gift },
            ].map((item, index) => (
              <div key={index} className="relative text-center group">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <item.icon className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                  {item.step}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 -right-3 w-6">
                    <ArrowRight className="w-6 h-6 text-primary/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/how-it-works">
              <Button variant="outline" size="lg">
                Learn More About the Process
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Loved by Thousands
            </h2>
            <p className="text-lg text-muted-foreground">
              See what our users are saying about TakaTrace
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-card-hover transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Organizations */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1920&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-eco-leaf/90" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Partner With TakaTrace
              </h2>
              <p className="text-white/80 text-lg mb-8">
                Municipalities and organizations can leverage TakaTrace to modernize waste management, 
                improve collection efficiency, and meet sustainability goals.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Real-time tracking and analytics dashboard',
                  'Customizable reward programs',
                  'Integration with existing systems',
                  'Detailed environmental impact reports',
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-white">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/contact">
                <Button size="lg" variant="secondary" className="font-semibold">
                  <Globe className="w-5 h-5 mr-2" />
                  Contact Us for Partnership
                </Button>
              </Link>
            </div>
            
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                  <TrendingUp className="w-32 h-32 text-white/80" />
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-16 h-16 text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of households already earning rewards while helping the environment. 
              It's free to get started!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto text-base font-semibold shadow-eco-lg px-10">
                  Start Recycling Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base font-semibold px-10">
                  Talk to Our Team
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
