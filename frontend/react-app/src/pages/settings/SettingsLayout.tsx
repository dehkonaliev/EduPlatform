import { NavLink, Outlet } from "react-router-dom";
import { GraduationCap, ShieldCheck, SlidersHorizontal, User } from "lucide-react";
import { AppNavbar } from "../../AppNavbar";
import { useAuth } from "../../providers/AuthProvider";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { to: "/settings/profile", label: "Profile", icon: User },
  { to: "/settings/student", label: "Student details", icon: GraduationCap, studentOnly: true },
  { to: "/settings/preferences", label: "Preferences", icon: SlidersHorizontal },
  { to: "/settings/account", label: "Security", icon: ShieldCheck },
];

export default function SettingsLayout() {
  const { user } = useAuth();
  const items = NAV_ITEMS.filter((item) => !item.studentOnly || user?.user_role === "STUDENT");

  return (
    <>
      <AppNavbar />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-2xl italic text-ink-950 dark:text-paper-50">Settings</h1>

        <div className="mt-8 flex flex-col gap-8 md:flex-row">
          {/* Nav — horizontal scroll on mobile, sidebar on desktop */}
          <nav className="flex shrink-0 gap-1 overflow-x-auto pb-2 md:w-52 md:flex-col md:overflow-visible md:pb-0">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-ember-400/10 text-ember-600 dark:text-ember-400"
                      : "text-ink-600 hover:bg-paper-100 dark:text-ink-300 dark:hover:bg-ink-900",
                  )
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Active section */}
          <div className="min-w-0 flex-1">
            <Outlet />
          </div>
        </div>
      </main>
    </>
  );
}