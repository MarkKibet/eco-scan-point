import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Phone, User, MapPin, ArrowRight, ChevronLeft, Home, Truck, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

type AuthStep = 'phone' | 'otp' | 'role' | 'details';
type AppRole = 'household' | 'collector' | 'admin';

export default function AuthPage() {
  const navigate = useNavigate();
  const { signInWithPhone, user, isLoading } = useAuth();
  
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setStep('otp');
      toast.success('OTP sent! (Use any 6 digits for demo)');
    } else {
      toast.error('Please enter a valid phone number');
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      setStep('role');
    } else {
      toast.error('Please enter the 6-digit code');
    }
  };

  const handleRoleSelect = (role: AppRole) => {
    setSelectedRole(role);
    setStep('details');
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    setSubmitting(true);
    const { error } = await signInWithPhone(phone, {
      name: name.trim(),
      location: location.trim() || undefined,
      role: selectedRole
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welcome to EcoSort!');
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col px-4 py-8 animate-fade-in">
      {/* Logo */}
      <div className="flex items-center justify-center mb-6">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg animate-float">
          <Leaf className="w-8 h-8 text-primary-foreground" />
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">EcoSort</h1>
        <p className="text-muted-foreground text-sm">
          {step === 'phone' && 'Enter your phone number to continue'}
          {step === 'otp' && 'Verify your phone number'}
          {step === 'role' && 'Select your account type'}
          {step === 'details' && 'Complete your profile'}
        </p>
      </div>

      {/* Form Card */}
      <Card className="flex-1 max-w-md mx-auto w-full">
        <CardContent className="p-5">
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter your phone number"
                    className="w-full h-12 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    maxLength={15}
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full">
                Send OTP
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Enter the 6-digit code sent to<br />
                  <span className="font-medium text-foreground">{phone}</span>
                </p>
                
                <div className="flex justify-center">
                  <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  Demo mode: Enter any 6 digits
                </p>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={otp.length !== 6}>
                Verify
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>
          )}

          {step === 'role' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setStep('otp')}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <h2 className="text-lg font-semibold text-center">I am a...</h2>
              
              <button
                onClick={() => handleRoleSelect('household')}
                className="w-full p-4 rounded-xl border-2 border-input hover:border-primary transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Household</p>
                  <p className="text-sm text-muted-foreground">Activate bags & earn points</p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('collector')}
                className="w-full p-4 rounded-xl border-2 border-input hover:border-primary transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Garbage Collector</p>
                  <p className="text-sm text-muted-foreground">Review & approve bags</p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('admin')}
                className="w-full p-4 rounded-xl border-2 border-input hover:border-primary transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Administrator</p>
                  <p className="text-sm text-muted-foreground">Manage QR codes & system</p>
                </div>
              </button>
            </div>
          )}

          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep('role')}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg mb-2">
                {selectedRole === 'household' && <Home className="w-4 h-4 text-primary" />}
                {selectedRole === 'collector' && <Truck className="w-4 h-4 text-primary" />}
                {selectedRole === 'admin' && <Shield className="w-4 h-4 text-primary" />}
                <span className="text-sm font-medium capitalize">{selectedRole}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Your Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Location (optional)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City or neighborhood"
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? 'Creating Account...' : 'Get Started'}
                {!submitting && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground mt-6">
        By continuing, you agree to our Terms of Service
      </p>
    </div>
  );
}