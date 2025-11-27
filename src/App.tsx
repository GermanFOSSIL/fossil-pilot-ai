import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SystemDashboard from "./pages/SystemDashboard";
import SubsystemDetail from "./pages/SubsystemDetail";
import Copilot from "./pages/Copilot";
import Insights from "./pages/Insights";
import DataImport from "./pages/admin/DataImport";
import DataManagement from "./pages/admin/DataManagement";
import ImportHistory from "./pages/admin/ImportHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Layout><Index /></Layout>} />
          <Route path="/systems/:systemId" element={<Layout><SystemDashboard /></Layout>} />
          <Route path="/systems/:systemId/subsystems/:subsystemId" element={<Layout><SubsystemDetail /></Layout>} />
          <Route path="/copilot" element={<Layout><Copilot /></Layout>} />
          <Route path="/insights" element={<Layout><Insights /></Layout>} />
          <Route path="/admin/data-import" element={<Layout><DataImport /></Layout>} />
          <Route path="/admin/data-management" element={<Layout><DataManagement /></Layout>} />
          <Route path="/admin/import-history" element={<Layout><ImportHistory /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
