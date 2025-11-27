import { NavLink } from "@/components/NavLink";
import { navigationConfig } from "@/config/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarContent className="overflow-y-auto">
        <div className="p-4 border-b border-border flex-shrink-0">
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-primary truncate">FOSSIL</h2>
              <p className="text-xs text-muted-foreground truncate">Completions AI Pilot</p>
            </div>
          )}
          {collapsed && (
            <div className="text-center">
              <span className="text-xl font-bold text-primary">F</span>
            </div>
          )}
        </div>

        {navigationConfig.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end={item.end}
                        className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-accent/50" 
                        activeClassName="bg-accent text-accent-foreground font-semibold"
                        aria-current="page"
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
