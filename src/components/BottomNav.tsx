'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Tractor, DollarSign, Sprout, PersonStanding } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { to: '/income', name: 'Income', icon: DollarSign },
  { to: '/expenses', name: 'Expenses', icon: Tractor },
  { to: '/planner', name: 'Planner', icon: Sprout },
//   { to: '/settings', name: 'Settings', icon: Settings },
  { to: '/profile', name: 'Profile', icon: PersonStanding },
];

const BottomNav = () => {
    const pathname = usePathname();
    
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-10 md:hidden">
            <div className="flex justify-around px-2 py-1">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.to}
                        className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-lg transition-colors",
                            "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                            pathname === item.to && "text-primary-foreground bg-primary shadow-sm"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-xs mt-1">{item.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default BottomNav;
