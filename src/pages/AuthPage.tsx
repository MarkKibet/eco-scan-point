import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Phone, User, MapPin, ArrowRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

type Step = 'phone' | 'details';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useApp();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setStep('details');
    } else {
      toast.error('Please enter a valid phone number');
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && location.trim()) {
      login(phone, name.trim(), location.trim());
      toast.success('Welcome to EcoSort!');
      navigate('/');
    } else {
      toast.error('Please fill in all details');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-4 py-8 animate-fade-in">
      {/* Logo */}
      <div className="flex items-center justify-center mb-8">
        <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-eco-lg animate-float">
          <Leaf className="w-10 h-10 text-primary-foreground" />
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">EcoSort</h1>
        <p className="text-muted-foreground">
          Earn rewards for proper waste sorting
        </p>
      </div>

      {/* Form Card */}
      <Card className="flex-1 max-w-md mx-auto w-full">
        <CardContent className="p-6">
          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter your phone number"
                    className="w-full h-14 pl-12 pr-4 rounded-xl border border-input bg-background text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    maxLength={15}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  We'll use this to identify your account
                </p>
              </div>

              <Button type="submit" size="xl" className="w-full">
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleDetailsSubmit} className="space-y-6">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full h-14 pl-12 pr-4 rounded-xl border border-input bg-background text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City or neighborhood"
                    className="w-full h-14 pl-12 pr-4 rounded-xl border border-input bg-background text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <Button type="submit" size="xl" className="w-full">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground mt-8">
        By continuing, you agree to our Terms of Service
      </p>
    </div>
  );
}
