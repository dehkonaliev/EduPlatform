import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Menu, Moon, Sun } from "lucide-react";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { ProfileMenu } from "./ProfileMenu";
import { MobileMenu } from "./MobileMenu";
import { useTheme } from "../../../providers/ThemeProvider";
import { useScrolled } from "../../../hooks/UseScrolled";
import { cn } from "../../../lib/utils";

// Swap this for real auth state once the auth feature is wired up.
interface CurrentUser {
  name: string;
  avatarUrl?: string;
}

interface NavbarProps {
  user?: CurrentUser | null;
  isInstructor?: boolean;
  onLogout?: () => void;
  /** Rendered next to the theme toggle when a user is logged in. */
  notificationBell?: ReactNode;
}

export function Navbar({ user, isInstructor = false, onLogout, notificationBell }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const scrolled = useScrolled();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-paper-50/85 backdrop-blur-md transition-shadow duration-200 dark:bg-ink-950/85",
        scrolled
          ? "border-paper-200 shadow-sm dark:border-ink-800"
          : "border-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        {isInstructor ? (
          <div className="hidden shrink-0 items-center gap-5 md:flex">
            <Link
              to="/instructor"
              className="text-sm font-semibold text-ink-800 transition-colors hover:text-ember-500 dark:text-paper-100 dark:hover:text-ember-400"
            >
              Dashboard
            </Link>
            <Link
              to="/instructor/courses"
              className="text-sm font-semibold text-ink-800 transition-colors hover:text-ember-500 dark:text-paper-100 dark:hover:text-ember-400"
            >
              My Courses
            </Link>
            <Link
              to="/instructor/course-create"
              className="text-sm font-semibold text-ink-800 transition-colors hover:text-ember-500 dark:text-paper-100 dark:hover:text-ember-400"
            >
              Create Course
            </Link>
          </div>
        ) : (
          <Link
            to="/my-learning"
            className="hidden shrink-0 text-sm font-semibold text-ink-800 transition-colors hover:text-ember-500 dark:text-paper-100 dark:hover:text-ember-400 md:block"
          >
            My Learning
          </Link>
        )}

        <div className="hidden flex-1 justify-center md:flex">
          <SearchBar instructorMode={isInstructor} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {user && notificationBell}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-paper-100 dark:text-ink-200 dark:hover:bg-ink-800"
          >
            <Sun
              size={18}
              className={cn(
                "absolute transition-all duration-300",
                theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
              )}
            />
            <Moon
              size={18}
              className={cn(
                "absolute transition-all duration-300",
                theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
              )}
            />
          </button>

          {user ? (
            <ProfileMenu
              name={user.name}
              avatarUrl={user.avatarUrl}
              isInstructor={isInstructor}
              onLogout={onLogout}
            />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="rounded-full px-3.5 py-1.5 text-sm font-medium text-ink-800 hover:bg-paper-100 dark:text-paper-100 dark:hover:bg-ink-800"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-ink-900 px-3.5 py-1.5 text-sm font-medium text-paper-50 transition-colors hover:bg-ink-800 dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300"
              >
                Sign up
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Open menu"
            className="rounded-full p-2 text-ink-600 hover:bg-paper-100 dark:text-ink-200 dark:hover:bg-ink-800 md:hidden"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} isInstructor={isInstructor} />
    </header>
  );
}