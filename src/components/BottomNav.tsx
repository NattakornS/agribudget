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
import { useCropFilter } from "@/contexts/CropFilterContext";

const BottomNav = () => {
  const { t } = useLanguage();
  const { pendingInvitationCount } = useCropFilter();

  const navItems = [
    { to: "/profile", name: t("profile"), icon: PersonStanding, badge: pendingInvitationCount },
    { to: "/", name: t("dashboardNav"), icon: LayoutDashboard, badge: 0 },
    { to: "/income", name: t("income"), icon: DollarSign, badge: 0 },
    { to: "/expenses", name: t("expenses"), icon: Tractor, badge: 0 },
    { to: "/planner", name: t("planner"), icon: Sprout, badge: 0 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-sidebar-accent border-t border-border z-10 md:hidden">
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
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-xs mt-1">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
