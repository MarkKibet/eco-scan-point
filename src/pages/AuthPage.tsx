import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Recycle, Phone, User, MapPin, ArrowRight, ChevronLeft, Home, Truck, X, Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';

type AuthStep = 'welcome' | 'phone' | 'otp' | 'details' | 'collector-auth';
type AuthMode = 'signin' | 'signup';

export default function AuthPage() {
  const navigate = useNavigate();
  const { signInWithPhone, signInCollector, signUpCollector, user, isLoading } = useAuth();
  
  const [step, setStep] = useState<AuthStep>('welcome');
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const handleLogoClick = () => {
    setShowAdminLogin(true);
  };

  const handleAdminLogin = async () => {
    setAdminLoading(true);
    
    const adminPhone = '0717151928';
    const adminPassword = 'Eco@123';
    const adminEmail = `${adminPhone}@wastewise.local`;

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });

    if (signInError) {
      if (signInError.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: adminEmail,
          password: adminPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              name: 'System Admin',
              phone: adminPhone,
              role: 'admin'
            }
          }
        });

        if (signUpError) {
          toast.error('Admin login failed');
          setAdminLoading(false);
          return;
        }

        toast.success('Admin account created & logged in!');
      } else {
        toast.error('Admin login failed');
        setAdminLoading(false);
        return;
      }
    } else {
      toast.success('Logged in as Admin!');
    }

    setAdminLoading(false);
    setShowAdminLogin(false);
    navigate('/');
  };

  const handleHouseholdSelect = () => {
    setStep('phone');
  };

  const handleCollectorSelect = () => {
    setStep('collector-auth');
    setAuthMode('signin');
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setSubmitting(true);
      
      // Check if user exists by trying to sign in
      const fakeEmail = `${phone}@wastewise.local`;
      const fakePassword = `wastewise_${phone}_secure`;
      
      const { error } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password: fakePassword
      });

      setSubmitting(false);

      if (!error) {
        // Existing user - logged in successfully
        toast.success('Welcome back to WasteWise!');
        navigate('/');
      } else if (error.message.includes('Invalid login credentials')) {
        // New user - proceed to OTP
        setIsNewUser(true);
        setStep('otp');
        toast.success('OTP sent! (Use any 6 digits for demo)');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } else {
      toast.error('Please enter a valid phone number');
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      setStep('details');
    } else {
      toast.error('Please enter the 6-digit code');
    }
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setSubmitting(true);
    const { error } = await signInWithPhone(phone, {
      name: name.trim(),
      location: location.trim() || undefined,
      role: 'household'
    });
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welcome to WasteWise!');
      navigate('/');
    }
  };

  const validateCollectorEmail = (email: string) => {
    return email.toLowerCase().endsWith('@wastewise.com');
  };

  const handleCollectorAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!validateCollectorEmail(email)) {
      toast.error('Collectors must use a @wastewise.com email');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);

    if (authMode === 'signin') {
      const { error } = await signInCollector(email, password);
      setSubmitting(false);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Welcome back to WasteWise!');
        navigate('/');
      }
    } else {
      if (!name.trim()) {
        toast.error('Please enter your name');
        setSubmitting(false);
        return;
      }

      const { error } = await signUpCollector(email, password, {
        name: name.trim(),
        location: location.trim() || undefined
      });
      setSubmitting(false);

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('This email is already registered');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Account created! Welcome to WasteWise!');
        navigate('/');
      }
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
      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm animate-scale-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Admin Access</h2>
                </div>
                <button onClick={() => setShowAdminLogin(false)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                This will log you in as the system administrator.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAdminLogin(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAdminLogin} disabled={adminLoading} className="flex-1">
                  {adminLoading ? 'Logging in...' : 'Login as Admin'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Logo - Clickable for Admin Access */}
      <div className="flex items-center justify-center mb-6">
        <button
          onClick={handleLogoClick}
          className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg animate-float hover:opacity-80 transition-opacity"
        >
          <Recycle className="w-8 h-8 text-primary-foreground" />
        </button>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">WasteWise</h1>
        <p className="text-muted-foreground text-sm">
          {step === 'welcome' && 'Smart waste management for everyone'}
          {step === 'phone' && 'Enter your phone number to continue'}
          {step === 'otp' && 'Verify your phone number'}
          {step === 'details' && 'Complete your profile'}
          {step === 'collector-auth' && (authMode === 'signin' ? 'Sign in to your account' : 'Create your account')}
        </p>
      </div>

      {/* Form Card */}
      <Card className="flex-1 max-w-md mx-auto w-full">
        <CardContent className="p-5">
          {step === 'welcome' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-center">I am a...</h2>
              
              <button
                onClick={handleHouseholdSelect}
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
                onClick={handleCollectorSelect}
                className="w-full p-4 rounded-xl border-2 border-input hover:border-primary transition-colors flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Garbage Collector</p>
                  <p className="text-sm text-muted-foreground">WasteWise employee</p>
                </div>
              </button>
            </div>
          )}

          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep('welcome')}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg mb-2">
                <Home className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Household</span>
              </div>

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

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? 'Checking...' : 'Continue'}
                {!submitting && <ArrowRight className="w-4 h-4 ml-2" />}
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

          {step === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep('otp')}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg mb-2">
                <Home className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Household</span>
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

          {step === 'collector-auth' && (
            <form onSubmit={handleCollectorAuth} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep('welcome')}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg mb-2">
                <Truck className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Garbage Collector</span>
              </div>

              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    authMode === 'signin' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    authMode === 'signup' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {authMode === 'signup' && (
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
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Work Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@wastewise.com"
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Must end with @wastewise.com</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full h-11 pl-10 pr-10 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Location (optional)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City or area you cover"
                      className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? 'Please wait...' : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
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