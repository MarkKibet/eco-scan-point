import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LandingLayout from '@/components/landing/LandingLayout';
import { 
  ArrowRight, 
  Leaf, 
  Target, 
  Eye, 
  Heart,
  Users,
  Globe,
  Award
} from 'lucide-react';

const values = [
  {
    icon: Leaf,
    title: 'Sustainability First',
    description: 'Every decision we make prioritizes environmental impact and long-term sustainability.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'We believe in the power of collective action and building strong community bonds.',
  },
  {
    icon: Heart,
    title: 'Transparency',
    description: 'Open and honest communication with all stakeholders in our waste management ecosystem.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'Continuously improving our technology and services to deliver the best experience.',
  },
];

const team = [
  {
    name: 'Shadrack Biwott',
    role: 'CEO & Founder',
    bio: 'Civil & Structural Engineer, 5th Year at Moi University. Visionary leader passionate about sustainable waste solutions.',
    initials: 'SB',
  },
  {
    name: 'Judith Jelagat',
    role: 'COO & Co-Founder',
    bio: 'Civil & Structural Engineer, 5th Year at Moi University. Operations expert driving community engagement.',
    initials: 'JJ',
  },
  {
    name: 'Mark Kibet',
    role: 'CTO',
    bio: 'Environmental Lawyer & Software Engineer. Building technology for environmental justice.',
    initials: 'MK',
  },
];

export default function AboutPage() {
  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1920&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About TakaTrace
            </h1>
            <p className="text-xl text-muted-foreground">
              We're on a mission to transform waste management in Africa through 
              innovative technology and community engagement.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  TakaTrace was born from a simple observation: despite growing awareness about 
                  recycling, most communities in Kenya lacked the infrastructure and incentives 
                  to properly manage their waste.
                </p>
                <p className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  Founded in 2025 in Eldoret, Uasin Gishu County, by a team of passionate 
                  engineers and legal experts from Moi University, we set out to create a 
                  solution that would make waste segregation rewarding, trackable, and 
                  accessible to everyone.
                </p>
                <p className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  Today, we are proud to serve 100 households in Uasin Gishu County, with 
                  ambitious plans to expand across Kenya. Our vision is to become the leading 
                  waste traceability platform across East Africa and beyond.
                </p>
              </div>
            </div>
            <div className="relative">
              <div 
                className="aspect-square rounded-3xl bg-cover bg-center shadow-2xl"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80')`,
                }}
              />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary rounded-2xl flex items-center justify-center animate-float shadow-eco-lg">
                <div className="text-center text-primary-foreground">
                  <p className="text-3xl font-bold">2025</p>
                  <p className="text-sm">Founded</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-primary/20">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                <p className="text-muted-foreground">
                  To empower communities and organizations with innovative waste management 
                  solutions that reward sustainable practices and create a cleaner environment 
                  for future generations.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-muted-foreground">
                  A world where every piece of waste is tracked, properly processed, and where 
                  recycling is not just a habit but a rewarding part of daily life for everyone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-card-hover transition-shadow">
                <CardContent className="p-6">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-muted-foreground">
              Passionate people dedicated to transforming waste management
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <Card 
                key={index} 
                className="text-center hover:shadow-card-hover transition-all duration-500 overflow-hidden group hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="h-48 bg-gradient-to-br from-primary/20 via-eco-leaf/20 to-primary/10 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-eco-leaf rounded-full flex items-center justify-center shadow-eco group-hover:scale-110 transition-transform duration-500">
                    <span className="text-2xl font-bold text-white">{member.initials}</span>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-primary font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-primary/90" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <Globe className="w-16 h-16 text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Our Environmental Impact
            </h2>
            <p className="text-xl text-white/80 mb-12">
              Together with our community, we've diverted over 500 tons of waste from landfills, 
              saved countless trees, and reduced carbon emissions significantly.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '100+', label: 'Households Served' },
                { value: '500+', label: 'Bags Tracked' },
                { value: '2025', label: 'Year Founded' },
                { value: '1', label: 'County (Growing!)' },
              ].map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Join Our Mission
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Whether you're a household looking to make a difference or an organization 
            seeking sustainable solutions, we'd love to have you on board.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="font-semibold shadow-eco-lg px-8">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="font-semibold px-8">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
