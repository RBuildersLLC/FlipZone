import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// HustleZone™ Pages
import SplashScreen from './pages/SplashScreen';
import PINEntry from './pages/PINEntry';
import RoleSelect from './pages/RoleSelect';
import SellerHub from './pages/SellerHub';
import BuyerDashboard from './pages/BuyerDashboard';
import OperatorDashboard from './pages/OperatorDashboard';
import LockerBankView from './pages/LockerBankView';
import AccessCodeScreen from './pages/AccessCodeScreen';
import TransactionFlow from './pages/TransactionFlow.jsx';
import AuditHistory from './pages/AuditHistory';
import SubscriptionTiers from './pages/SubscriptionTiers';
import ReputationProfile from './pages/ReputationProfile';
import StaffManagement from './pages/StaffManagement';
import DemoLanding from './pages/DemoLanding';
import BrandSlideshow from './pages/BrandSlideshow';
import BackendSpec from './pages/BackendSpec';
import NotificationCenter from './pages/NotificationCenter';
import VerificationFlow from './pages/VerificationFlow.jsx';
import SellerTransactionView from './pages/SellerTransactionView.jsx';
import BuyerTransactionView from './pages/BuyerTransactionView.jsx';
import NotificationSoundSettings from './pages/NotificationSoundSettings.jsx';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center hz-green-surface">
        <div className="w-8 h-8 border-4 border-hz-green-deep/20 border-t-hz-green-deep rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <Routes>
      {/* Entry Flow */}
      <Route path="/" element={<SplashScreen />} />
      <Route path="/pin" element={<PINEntry />} />
      <Route path="/role-select" element={<RoleSelect />} />

      {/* Seller Routes */}
      <Route path="/seller" element={<SellerHub />} />
      <Route path="/seller/lockers" element={<LockerBankView />} />
      <Route path="/seller/codes" element={<AccessCodeScreen />} />
      <Route path="/seller/transactions" element={<TransactionFlow />} />
      <Route path="/seller/transaction" element={<SellerTransactionView />} />
      <Route path="/buyer/transaction" element={<BuyerTransactionView />} />
      <Route path="/seller/audit" element={<AuditHistory />} />
      <Route path="/seller/subscription" element={<SubscriptionTiers />} />
      <Route path="/seller/reputation" element={<ReputationProfile />} />
      <Route path="/seller/analytics" element={<SellerHub />} />
      <Route path="/seller/profile" element={<ReputationProfile />} />

      {/* Buyer Routes */}
      <Route path="/buyer" element={<BuyerDashboard />} />
      <Route path="/buyer/codes" element={<AccessCodeScreen />} />
      <Route path="/buyer/history" element={<AuditHistory />} />
      <Route path="/buyer/profile" element={<ReputationProfile />} />

      {/* Operator Routes */}
      <Route path="/operator" element={<OperatorDashboard />} />
      <Route path="/operator/audit" element={<AuditHistory />} />
      <Route path="/operator/staff" element={<StaffManagement />} />
      <Route path="/operator/oversight" element={<LockerBankView />} />
      <Route path="/operator/profile" element={<ReputationProfile />} />

      {/* Demo Assets */}
      <Route path="/demo" element={<DemoLanding />} />
      <Route path="/slideshow" element={<BrandSlideshow />} />
      <Route path="/spec" element={<BackendSpec />} />
      <Route path="/demo/notifications" element={<NotificationCenter />} />
      <Route path="/demo/verify" element={<VerificationFlow />} />
      <Route path="/settings/notification-sounds" element={<NotificationSoundSettings />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;