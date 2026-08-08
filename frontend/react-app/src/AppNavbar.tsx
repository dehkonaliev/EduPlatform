import { Navbar } from "./components/layout/Navbar/Navbar";
import { NotificationBell } from "./components/layout/Navbar/NotificationBell";
import { useAuth } from "./providers/AuthProvider";
import { resolveMediaUrl } from "./lib/media";

/**
 * Keeps Navbar itself presentational/dumb (easy to test, easy to reuse) by
 * doing the auth-state → props translation here instead of inside Navbar.
 */
export function AppNavbar() {
  const { user, logout } = useAuth();

  return (
    <Navbar
      user={
        user
          ? {
              name: `${user.first_name} ${user.last_name}`.trim() || user.email || "Account",
              avatarUrl: resolveMediaUrl(user.photo) ?? undefined,
            }
          : null
      }
      isInstructor={user?.user_role === "INSTRUCTOR"}
      onLogout={logout}
      notificationBell={<NotificationBell />}
    />
  );
}