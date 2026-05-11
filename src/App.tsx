import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import Careers from "./pages/Careers";
import NotFound from "./pages/NotFound";
import AdminApp from "./components/admin/AdminApp";
import AIAssistant from "./components/AIAssistant";
import SystemConfigLoader from "./components/SystemConfigLoader";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoaderComplete = () => {
    setIsLoading(false);
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <SystemConfigLoader onComplete={handleLoaderComplete} />
          <div className={`${isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity duration-500`}>
            <ErrorBoundary>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/blogs" element={<Blogs />} />
                  <Route path="/blog/:slug" element={<BlogDetail />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/admin" element={<AdminApp />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <AIAssistant />
              </BrowserRouter>
            </ErrorBoundary>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
