import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import AuthPage from "@/pages/AuthPage";
import HomePage from "@/pages/HomePage";
import ScanPage from "@/pages/ScanPage";
import HistoryPage from "@/pages/HistoryPage";
import RewardsPage from "@/pages/RewardsPage";
import ProfilePage from "@/pages/ProfilePage";
import CollectorReviewsPage from "@/pages/CollectorReviewsPage";
import QRGeneratorPage from "@/pages/QRGeneratorPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import TrashScannerPage from "@/pages/TrashScannerPage";
import FeedbackPage from "@/pages/FeedbackPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function ConditionalBottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const hideNavPaths = ['/auth', '/scan', '/qr-generator', '/admin', '/trash-scanner'];
  const showNav = user && !hideNavPaths.includes(location.pathname);
  
  if (!showNav) return null;
  return <BottomNav />;
}

function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/scan" element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/rewards" element={<ProtectedRoute><RewardsPage /></ProtectedRoute>} />
        <Route path="/reviews" element={<ProtectedRoute><CollectorReviewsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/qr-generator" element={<ProtectedRoute><QRGeneratorPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/trash-scanner" element={<ProtectedRoute><TrashScannerPage /></ProtectedRoute>} />
        <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ConditionalBottomNav />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;