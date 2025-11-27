import { 
  Home, 
  Sparkles, 
  LightbulbIcon, 
  Settings,
  FolderKanban,
  ListTree,
  Tag,
  ClipboardList,
  AlertCircle,
  Shield
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Copiloto IA", url: "/copilot", icon: Sparkles },
  { title: "Insights", url: "/insights", icon: LightbulbIcon },
];

const adminItems = [
  { title: "Proyectos", url: "/admin/projects", icon: FolderKanban },
  { title: "Sistemas", url: "/admin/systems", icon: ListTree },
  { title: "Subsistemas", url: "/admin/subsystems", icon: ListTree },
  { title: "Tags", url: "/admin/tags", icon: Tag },
  { title: "ITRs", url: "/admin/itrs", icon: ClipboardList },
  { title: "Punch Items", url: "/admin/punch", icon: AlertCircle },
  { title: "Preservación", url: "/admin/preservation", icon: Shield },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarContent>
        <div className="p-4 border-b border-border">
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-primary">FOSSIL</h2>
              <p className="text-xs text-muted-foreground">Completions AI Pilot</p>
            </div>
          )}
          {collapsed && (
            <div className="text-center">
              <span className="text-xl font-bold text-primary">F</span>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/"}
                      className="hover:bg-muted/50" 
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            <Settings className="h-4 w-4 mr-2" />
            {!collapsed && "Administración"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className="hover:bg-muted/50" 
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
