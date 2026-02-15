import { Toaster } from "@components/ui/toaster";
import { Toaster as Sommer } from "@components/ui/sommer";
import { TooltipProvider } from "@components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom"; // Changed from BrowserRouter
import { LanguageProvider } from "@contexts/LanguageContext";
import Index from "./pages/Index";
import SessionPage from "./pages/SessionPage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import PricingPage from "./pages/PricingPage";
import BeautyHistoryPage from "./pages/BeautyHistoryPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <HashRouter> {/* Changed from BrowserRouter */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/session" element={<SessionPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/beauty-history" element={<BeautyHistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
        <Toaster />
        <Sommer />
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;