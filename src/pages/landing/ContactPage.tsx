import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import LandingLayout from '@/components/landing/LandingLayout';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  Building,
  Users,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Us',
    description: 'For general inquiries and support',
    value: 'hello@takatrace.com',
    action: 'mailto:hello@takatrace.com',
  },
  {
    icon: Phone,
    title: 'Call Us',
    description: 'Monday to Friday, 8am to 6pm',
    value: '+254 700 000 000',
    action: 'tel:+254700000000',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    description: 'Our headquarters location',
    value: 'Nairobi, Kenya',
    action: null,
  },
  {
    icon: Clock,
    title: 'Business Hours',
    description: 'When we are available',
    value: 'Mon-Fri: 8am-6pm EAT',
    action: null,
  },
];

const inquiryTypes = [
  { value: 'general', label: 'General Inquiry', icon: MessageSquare },
  { value: 'partnership', label: 'Partnership', icon: Building },
  { value: 'support', label: 'Technical Support', icon: Users },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'general',
    organization: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Message sent successfully! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      inquiryType: 'general',
      organization: '',
      message: '',
    });
    setIsSubmitting(false);
  };

  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1920&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/70" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground">
              Have questions about TakaTrace? Want to partner with us? 
              We would love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {contactMethods.map((method, index) => (
              <Card key={index} className="hover:shadow-card-hover transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <method.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{method.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                  {method.action ? (
                    <a 
                      href={method.action}
                      className="text-primary font-medium hover:underline"
                    >
                      {method.value}
                    </a>
                  ) : (
                    <p className="text-foreground font-medium">{method.value}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Form */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Inquiry Type */}
                <div>
                  <Label className="mb-3 block">What is this regarding?</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {inquiryTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, inquiryType: type.value }))}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          formData.inquiryType === type.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <type.icon className={`w-5 h-5 mx-auto mb-1 ${
                          formData.inquiryType === type.value ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                        <p className={`text-xs font-medium ${
                          formData.inquiryType === type.value ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                          {type.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Phone & Organization */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+254 700 000 000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="organization">Organization</Label>
                    <Input
                      id="organization"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      placeholder="Your company or organization"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    rows={5}
                    required
                    className="mt-1"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full font-semibold" disabled={isSubmitting}>
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Map / Info */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Our Location
              </h2>
              <div 
                className="aspect-[4/3] rounded-2xl bg-cover bg-center shadow-lg mb-6"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1611348586804-61bf6c080437?auto=format&fit=crop&w=800&q=80')`,
                }}
              />
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">TakaTrace Headquarters</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-muted-foreground">
                      <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p>TakaTrace Building</p>
                        <p>Westlands, Nairobi</p>
                        <p>Kenya</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                      <p>Monday - Friday: 8:00 AM - 6:00 PM EAT</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership CTA */}
      <section className="py-20 md:py-28 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <Building className="w-16 h-16 text-primary-foreground/80 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Interested in Partnership?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            If you are a municipality, organization, or business looking to implement 
            TakaTrace, we would love to discuss how we can work together.
          </p>
          <Button size="lg" variant="secondary" className="font-semibold px-10">
            <Mail className="w-5 h-5 mr-2" />
            partnerships@takatrace.com
          </Button>
        </div>
      </section>
    </LandingLayout>
  );
}
