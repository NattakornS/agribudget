'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { DollarSign, LayoutDashboard, LogOut, PersonStanding, Sprout, Tractor } from 'lucide-react';

export function AppSidebar() {
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();

  const navItems = [
    { to: '/profile', name: t('profile'), icon: PersonStanding },
    { to: '/dashboard', name: t('dashboardNav'), icon: LayoutDashboard },
    { to: '/income', name: t('income'), icon: DollarSign },
    { to: '/expenses', name: t('expenses'), icon: Tractor },
    { to: '/planner', name: t('planner'), icon: Sprout },
  ];

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
          <SidebarGroupLabel>{t('navigation')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <Link 
                      href={item.to}
                      className={`flex items-center gap-3 w-full rounded-md transition-colors ${
                        pathname === item.to 
                          ? 'bg-primary text-primary-foreground shadow-sm font-medium' 
                          : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
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
            <span>{t('logout')}</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
