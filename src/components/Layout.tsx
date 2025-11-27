import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { getPageTitle } from "@/config/navigation";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border flex items-center px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shrink-0">
            <SidebarTrigger className="-ml-1 mr-4" />
            <h1 className="text-lg font-semibold text-foreground truncate">{pageTitle}</h1>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="container max-w-7xl mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
