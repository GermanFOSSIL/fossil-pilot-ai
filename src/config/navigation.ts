import { 
  Home, 
  Sparkles, 
  LightbulbIcon, 
  Upload,
  Database,
  History as HistoryIcon,
  Layers,
  LucideIcon
} from "lucide-react";

export interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export const navigationConfig: NavigationSection[] = [
  {
    title: "Principal",
    items: [
      { 
        title: "Dashboard", 
        url: "/", 
        icon: Home,
        end: true 
      },
      { 
        title: "Copiloto IA", 
        url: "/copilot", 
        icon: Sparkles 
      },
      { 
        title: "Insights", 
        url: "/insights", 
        icon: LightbulbIcon 
      },
    ],
  },
  {
    title: "Operación",
    items: [
      { 
        title: "Sistemas", 
        url: "/systems", 
        icon: Layers 
      },
    ],
  },
  {
    title: "Administración",
    items: [
      { 
        title: "Importación de Datos", 
        url: "/admin/data-import", 
        icon: Upload 
      },
      { 
        title: "Gestión de Datos", 
        url: "/admin/data-management", 
        icon: Database 
      },
      { 
        title: "Historial", 
        url: "/admin/import-history", 
        icon: HistoryIcon 
      },
    ],
  },
];

// Helper para obtener el título de la página actual
export const getPageTitle = (pathname: string): string => {
  for (const section of navigationConfig) {
    const item = section.items.find(item => {
      if (item.end) {
        return pathname === item.url;
      }
      return pathname.startsWith(item.url);
    });
    if (item) return item.title;
  }
  
  // Casos especiales para rutas dinámicas
  if (pathname.startsWith("/system/")) return "Dashboard del Sistema";
  if (pathname.startsWith("/subsystem/")) return "Detalle del Subsistema";
  
  return "FOSSIL";
};
