import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import SettingsPage from "./pages/SettingsPage";
import ReportPage from "./pages/ReportPage";
import AnalysesPage from "./pages/AnalysesPage";
import ComparePage from "./pages/ComparePage";
import DocumentationPage from "./pages/DocumentationPage";
import ApiReferencePage from "./pages/ApiReferencePage";
import ChangelogPage from "./pages/ChangelogPage";
import AboutPage from "./pages/AboutPage";

import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import NotFound from "./pages/NotFound";
import { Chatbot } from "./components/chatbot/Chatbot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/report/:id" element={<ReportPage />} />
            <Route path="/analyses" element={<AnalysesPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/documentation" element={<DocumentationPage />} />
            <Route path="/api-reference" element={<ApiReferencePage />} />
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route path="/about" element={<AboutPage />} />
            
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Chatbot />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
