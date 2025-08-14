import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Tractor, DollarSign, Sprout, Settings } from 'lucide-react';

const navItems = [
  { to: '/', name: 'Dashboard', icon: LayoutDashboard },
  { to: '/income', name: 'Income', icon: DollarSign },
  { to: '/expenses', name: 'Expenses', icon: Tractor },
  { to: '/planner', name: 'Planner', icon: Sprout },
  { to: '/settings', name: 'Settings', icon: Settings },
];

const BottomNav = () => {
    const baseLinkClasses = "flex flex-col items-center justify-center p-2";
    const inactiveLinkClasses = "text-gray-500";
    const activeLinkClasses = "text-blue-600";

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-10">
            <div className="flex justify-around">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.to}
                        className={({ isActive }) =>
                            `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
                        }
                    >
                        <item.icon className="w-6 h-6" />
                        <span className="text-xs">{item.name}</span>
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default BottomNav;
