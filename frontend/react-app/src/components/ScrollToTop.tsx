import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * React Router keeps the previous page's scroll offset when navigating, so
 * moving from a long page to a short one lands mid-page and visibly "jumps".
 * Resets the window scroll to the top on every route change.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
