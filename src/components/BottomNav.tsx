import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Tractor,
  DollarSign,
  Sprout,
  PersonStanding,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const BottomNav = () => {
  const { t } = useLanguage();
  const navItems = [
    { to: "/profile", name: t("profile"), icon: PersonStanding },
    { to: "/", name: t("dashboardNav"), icon: LayoutDashboard },
    { to: "/income", name: t("income"), icon: DollarSign },
    { to: "/expenses", name: t("expenses"), icon: Tractor },
    { to: "/planner", name: t("planner"), icon: Sprout },
  ];
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
