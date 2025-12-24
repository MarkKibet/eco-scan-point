import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Recycle, Phone, User, MapPin, ArrowRight, ChevronLeft, Home, Truck, X, Shield, Mail, Lock, Eye, EyeOff, Package } from 'lucide-react';
import { toast } from 'sonner';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';

type AuthStep = 'welcome' | 'phone' | 'otp' | 'details' | 'collector-auth' | 'receiver-auth';
type AuthMode = 'signin' | 'signup';
type UserType = 'collector' | 'receiver';

export default function AuthPage() {
  const navigate = useNavigate();
  const { signInWithPhone, signInCollector, signUpCollector, signInReceiver, signUpReceiver, user, isLoading } = useAuth();
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

  const handleReceiverSelect = () => {
    setStep('receiver-auth');
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
        toast.success('Welcome back to TakaTrace!');
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
      toast.success('Welcome to TakaTrace!');
      navigate('/');
    }
  };

  const validateCollectorEmail = (email: string) => {
    return email.toLowerCase().endsWith('@wastewise.com');
  };

  const validateReceiverEmail = (email: string) => {
    return email.toLowerCase().endsWith('@takatrace.com');
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
        toast.success('Welcome back to TakaTrace!');
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
        toast.success('Account created! Welcome to TakaTrace!');
        navigate('/');
      }
    }
  };

  const handleReceiverAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!validateReceiverEmail(email)) {
      toast.error('Receivers must use a @takatrace.com email');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);

    if (authMode === 'signin') {
      const { error } = await signInReceiver(email, password);
      setSubmitting(false);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Welcome back to TakaTrace!');
        navigate('/');
      }
    } else {
      if (!name.trim()) {
        toast.error('Please enter your name');
        setSubmitting(false);
        return;
      }

      const { error } = await signUpReceiver(email, password, {
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
        toast.success('Account created! Welcome to TakaTrace!');
        navigate('/');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="w-full max-w-md space-y-6">
        {/* Admin Login Modal */}
        {showAdminLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-sm">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-semibold">Admin Access</h3>
                  </div>
                  <button
                    onClick={() => setShowAdminLogin(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  This will log you in as the system administrator.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAdminLogin(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAdminLogin}
                    disabled={adminLoading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {adminLoading ? 'Logging in...' : 'Login as Admin'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Logo - Clickable for Admin Access */}
        <div 
          onClick={handleLogoClick}
          className="flex justify-center cursor-pointer"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Recycle className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            TakaTrace
          </h1>
          <p className="text-muted-foreground">
            {step === 'welcome' && 'Smart waste management for everyone'}
            {step === 'phone' && 'Enter your phone number to continue'}
            {step === 'otp' && 'Verify your phone number'}
            {step === 'details' && 'Complete your profile'}
            {step === 'collector-auth' && (authMode === 'signin' ? 'Sign in to your account' : 'Create your account')}
            {step === 'receiver-auth' && (authMode === 'signin' ? 'Sign in to your account' : 'Create your account')}
          </p>
        </div>

        {/* Form Card */}
        {step === 'welcome' && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-4">I am a...</h2>
              </div>

              <button
                onClick={handleHouseholdSelect}
                className="w-full p-6 rounded-xl border-2 border-input hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <Home className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold">Household</h3>
                    <p className="text-sm text-muted-foreground">Activate bags & earn points</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                </div>
              </button>

              <button
                onClick={handleCollectorSelect}
                className="w-full p-6 rounded-xl border-2 border-input hover:border-teal-500 hover:bg-teal-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                    <Truck className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold">Garbage Collector</h3>
                    <p className="text-sm text-muted-foreground">Collect & review bags</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-teal-600 transition-colors" />
                </div>
              </button>

              <button
                onClick={handleReceiverSelect}
                className="w-full p-6 rounded-xl border-2 border-input hover:border-amber-500 hover:bg-amber-50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                    <Package className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold">Garbage Receiver</h3>
                    <p className="text-sm text-muted-foreground">Verify collector reviews</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-amber-600 transition-colors" />
                </div>
              </button>
            </CardContent>
          </Card>
        )}

        {step === 'phone' && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <button
                onClick={() => setStep('welcome')}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Home className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="font-medium">Household</span>
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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

                <Button
                  type="submit"
                  disabled={submitting || phone.length < 10}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {submitting ? 'Checking...' : 'Continue'}
                  {!submitting && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'otp' && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <button
                onClick={() => setStep('phone')}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Enter the 6-digit code sent to {phone}
                  </label>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => setOtp(value)}
                    >
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
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Demo mode: Enter any 6 digits
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={otp.length !== 6}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Verify
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'details' && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <button
                onClick={() => setStep('otp')}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Home className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="font-medium">Household</span>
              </div>

              <form onSubmit={handleDetailsSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Location (optional)</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City or neighborhood"
                      className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting || !name.trim()}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {submitting ? 'Creating Account...' : 'Get Started'}
                  {!submitting && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'collector-auth' && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <button
                onClick={() => setStep('welcome')}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-teal-600" />
                </div>
                <span className="font-medium">Garbage Collector</span>
              </div>

              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <button
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

              <form onSubmit={handleCollectorAuth} className="space-y-4">
                {authMode === 'signup' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">Work Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@wastewise.com"
                      className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must end with @wastewise.com
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {authMode === 'signup' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location (optional)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {submitting ? 'Please wait...' : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
                  {!submitting && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'receiver-auth' && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              <button
                onClick={() => setStep('welcome')}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>

              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Package className="w-5 h-5 text-amber-600" />
                </div>
                <span className="font-medium">Garbage Receiver</span>
              </div>

              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                <button
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

              <form onSubmit={handleReceiverAuth} className="space-y-4">
                {authMode === 'signup' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">Work Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@takatrace.com"
                      className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Must end with @takatrace.com
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {authMode === 'signup' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location (optional)</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City or facility location"
                        className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {submitting ? 'Please wait...' : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
                  {!submitting && <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-center text-muted-foreground">
          By continuing, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
