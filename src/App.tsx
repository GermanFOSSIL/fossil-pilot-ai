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
import ProjectsAdmin from "./pages/admin/Projects";
import SystemsAdmin from "./pages/admin/Systems";
import SubsystemsAdmin from "./pages/admin/Subsystems";
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
          <Route path="/admin/projects" element={<Layout><ProjectsAdmin /></Layout>} />
          <Route path="/admin/systems" element={<Layout><SystemsAdmin /></Layout>} />
          <Route path="/admin/subsystems" element={<Layout><SubsystemsAdmin /></Layout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
