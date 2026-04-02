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
  SidebarMenu
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCropFilter } from '@/contexts/CropFilterContext';
import { DollarSign, LayoutDashboard, LogOut, PersonStanding, Sprout, Tractor } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

export function AppSidebar() {
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const { pendingInvitationCount } = useCropFilter();

  const navItems = [
    { to: '/profile', name: t('profile'), icon: PersonStanding, badge: pendingInvitationCount },
    { to: '/', name: t('dashboardNav'), icon: LayoutDashboard, badge: 0 },
    { to: '/income', name: t('income'), icon: DollarSign, badge: 0 },
    { to: '/expenses', name: t('expenses'), icon: Tractor, badge: 0 },
    { to: '/planner', name: t('planner'), icon: Sprout, badge: 0 },
  ];

  return (
    <Sidebar className="bg-sidebar-accent">
      <SidebarHeader className="border-b px-6 py-4 h-[60px] bg-sidebar-accent">
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
                    <NavLink
                      key={item.name}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 w-full p-2 ${
                          isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-accent/50'
                        }`
                      }
                    >
                      <div className="relative">
                        <item.icon className="h-4 w-4" />
                        {item.badge > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span>{item.name}</span>
                    </NavLink>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Separator />
        <div className="p-4 space-y-2">
          <ThemeToggle />
          <LanguageSwitcher />
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
