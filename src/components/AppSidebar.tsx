import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Tractor, DollarSign, Sprout, Settings, LogOut, PersonStanding } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { to: '/profile', name: 'Profile', icon: PersonStanding },
  { to: '/', name: 'Dashboard', icon: LayoutDashboard },
  { to: '/income', name: 'Income', icon: DollarSign },
  { to: '/expenses', name: 'Expenses', icon: Tractor },
  { to: '/planner', name: 'Planner', icon: Sprout },
  { to: '/settings', name: 'Settings', icon: Settings },
];

export function AppSidebar() {
  const { signOut } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4 h-[60px]">
        <div className="flex items-center gap-2">
          <Sprout className="h-6 w-6 text-green-600" />
          <h2 className="text-xl font-bold text-foreground">AgriBudget</h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.to}
                      className={({ isActive }) => 
                        `flex items-center gap-3 w-full ${
                          isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50'
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <Separator />
        <div className="p-4">
          <Button
            variant="ghost"
            onClick={signOut}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}