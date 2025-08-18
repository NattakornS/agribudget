import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Tractor, DollarSign, Sprout, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', name: 'Dashboard', icon: LayoutDashboard },
  { to: '/income', name: 'Income', icon: DollarSign },
  { to: '/expenses', name: 'Expenses', icon: Tractor },
  { to: '/planner', name: 'Planner', icon: Sprout },
  { to: '/settings', name: 'Settings', icon: Settings },
];

const BottomNav = () => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-10 md:hidden">
            <div className="flex justify-around px-2 py-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                "flex flex-col items-center justify-center p-3 rounded-lg transition-colors",
                                "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                isActive && "text-primary bg-primary/10"
                            )
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-xs mt-1">{item.name}</span>
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default BottomNav;
