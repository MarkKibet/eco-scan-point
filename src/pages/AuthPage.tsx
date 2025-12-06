import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Mail, Lock, User, MapPin, Phone, ArrowRight, ChevronLeft, Home, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

type AuthMode = 'login' | 'signup';
type SignupStep = 'role' | 'credentials' | 'details';
type AppRole = 'household' | 'collector';

const emailSchema = z.string().trim().email({ message: "Invalid email address" }).max(255);
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" });
const nameSchema = z.string().trim().min(1, { message: "Name is required" }).max(100);

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn, signUp, user, isLoading } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [signupStep, setSignupStep] = useState<SignupStep>('role');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !isLoading) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  const validateCredentials = () => {
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast.error(emailResult.error.errors[0].message);
      return false;
    }
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast.error(passwordResult.error.errors[0].message);
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCredentials()) return;
    
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Welcome back!');
      navigate('/');
    }
  };

  const handleRoleSelect = (role: AppRole) => {
    setSelectedRole(role);
    setSignupStep('credentials');
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCredentials()) return;
    setSignupStep('details');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nameResult = nameSchema.safeParse(name);
    if (!nameResult.success) {
      toast.error(nameResult.error.errors[0].message);
      return;
    }
    
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }

    setSubmitting(true);
    const { error } = await signUp(email, password, {
      name: name.trim(),
      phone: phone || undefined,
      location: location || undefined,
      role: selectedRole
    });
    setSubmitting(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('This email is already registered. Please log in instead.');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Account created! Welcome to EcoSort!');
      navigate('/');
    }
  };

  const resetSignup = () => {
    setSignupStep('role');
    setSelectedRole(null);
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setLocation('');
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
          {mode === 'login' ? 'Welcome back!' : 'Join the recycling movement'}
        </p>
      </div>

      {/* Form Card */}
      <Card className="flex-1 max-w-md mx-auto w-full">
        <CardContent className="p-5">
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign In'}
                {!submitting && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
              
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button type="button" onClick={() => { setMode('signup'); resetSignup(); }} className="text-primary font-medium hover:underline">
                  Sign up
                </button>
              </p>
            </form>
          ) : (
            <>
              {signupStep === 'role' && (
                <div className="space-y-4">
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

                  <p className="text-center text-sm text-muted-foreground pt-2">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setMode('login')} className="text-primary font-medium hover:underline">
                      Sign in
                    </button>
                  </p>
                </div>
              )}

              {signupStep === 'credentials' && (
                <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setSignupStep('role')}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>

                  <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg mb-2">
                    {selectedRole === 'household' ? <Home className="w-4 h-4 text-primary" /> : <Truck className="w-4 h-4 text-primary" />}
                    <span className="text-sm font-medium capitalize">{selectedRole}</span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              )}

              {signupStep === 'details' && (
                <form onSubmit={handleSignup} className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setSignupStep('credentials')}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>

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
                    <label className="block text-sm font-medium text-foreground mb-1.5">Phone (optional)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="Your phone number"
                        className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        maxLength={15}
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
                    {submitting ? 'Creating Account...' : 'Create Account'}
                    {!submitting && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </form>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground mt-6">
        By continuing, you agree to our Terms of Service
      </p>
    </div>
  );
}
