import { NavLink, Outlet, Link } from "react-router-dom";
import {
  Archive,
  CheckCircle2,
  Clock,
  LayoutGrid,
  PencilLine,
  Plus,
  XCircle,
} from "lucide-react";
import { AppNavbar } from "../../AppNavbar";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { to: "/instructor/courses", label: "All courses", icon: LayoutGrid, end: true },
  { to: "/instructor/courses/draft", label: "Draft", icon: PencilLine },
  { to: "/instructor/courses/review", label: "In review", icon: Clock },
  { to: "/instructor/courses/rejected", label: "Rejected", icon: XCircle },
  { to: "/instructor/courses/published", label: "Published", icon: CheckCircle2 },
  { to: "/instructor/courses/archived", label: "Archived", icon: Archive },
];

/** Settings-style sidebar around the instructor's course catalog — one tab
 * per publishing status. */
export default function InstructorCoursesLayout() {
  return (
    <>
      <AppNavbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl italic text-ink-950 dark:text-paper-50">
            My Courses
          </h1>
          <Link
            to="/instructor/course-create"
            className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-paper-50 transition-colors hover:bg-ink-800 dark:bg-ember-400 dark:text-ink-950 dark:hover:bg-ember-300"
          >
            <Plus size={15} />
            Create Course
          </Link>
        </div>

        <div className="mt-8 flex flex-col gap-8 md:flex-row">
          {/* Nav — horizontal scroll on mobile, sidebar on desktop */}
          <nav className="flex shrink-0 gap-1 overflow-x-auto pb-2 md:w-52 md:flex-col md:overflow-visible md:pb-0">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
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

          {/* Active tab */}
          <div className="min-w-0 flex-1">
            <Outlet />
          </div>
        </div>
      </main>
    </>
  );
}
