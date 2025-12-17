import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Tractor, DollarSign, Sprout, Settings, LogOut, PersonStanding } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/profile', name: 'Profile', icon: PersonStanding },
  { to: '/', name: 'Dashboard', icon: LayoutDashboard },
  { to: '/income', name: 'Income', icon: DollarSign },
  { to: '/expenses', name: 'Expenses', icon: Tractor },
  { to: '/planner', name: 'Planner', icon: Sprout },
  { to: '/settings', name: 'Settings', icon: Settings },
];

const Sidebar = () => {
  const { signOut } = useAuth();

  const baseLinkClasses = "flex items-center p-2 rounded-lg";
  const inactiveLinkClasses = "hover:bg-gray-100";
  const activeLinkClasses = "bg-blue-100 text-blue-600";

  return (
    <div className="w-64 bg-white p-4 flex flex-col h-full border-r">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">AgriBudget</h2>
      <nav className="flex-1">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div>
        <button
          onClick={signOut}
          className={`${baseLinkClasses} ${inactiveLinkClasses} w-full`}
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
