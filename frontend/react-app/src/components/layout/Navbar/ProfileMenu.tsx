import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  User,
  Settings,
  Repeat,
  ShoppingBag,
  Wallet,
  Receipt,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useOnClickOutside } from "../../../hooks/useOnClicksOutSide";
import { cn } from "../../../lib/utils";
import type { ProfileMenuItem } from "../../../types/Navigation";

const MENU_ITEMS: ProfileMenuItem[] = [
  { label: "My Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Subscriptions", href: "/subscriptions", icon: Repeat, dividerBefore: true },
  { label: "My Purchases", href: "/purchases", icon: ShoppingBag },
  { label: "Payments", href: "/payments", icon: Wallet },
  { label: "Transactions", href: "/transactions", icon: Receipt },
];

interface ProfileMenuProps {
  name: string;
  avatarUrl?: string;
  onLogout?: () => void;
}

export function ProfileMenu({ name, avatarUrl, onLogout }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(containerRef, () => setOpen(false));

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full p-1 pr-2 transition-colors hover:bg-paper-100 dark:hover:bg-ink-800"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-800 text-xs font-semibold text-paper-50 dark:bg-ember-400 dark:text-ink-950">
            {initials}
          </span>
        )}
        <ChevronDown
          size={15}
          className={cn(
            "text-ink-500 transition-transform duration-200 dark:text-ink-300",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-2 w-60 origin-top-right overflow-hidden rounded-xl border border-paper-200 bg-white py-1.5 shadow-xl shadow-ink-950/10 dark:border-ink-800 dark:bg-ink-900 dark:shadow-black/40"
          >
            <div className="border-b border-paper-200 px-3.5 py-2.5 dark:border-ink-800">
              <p className="truncate text-sm font-semibold text-ink-950 dark:text-paper-50">
                {name}
              </p>
            </div>

            {MENU_ITEMS.map(({ label, href, icon: Icon, dividerBefore }) => (
              <div key={href}>
                {dividerBefore && (
                  <div className="my-1 border-t border-paper-200 dark:border-ink-800" />
                )}
                <Link
                  to={href}
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-ink-800 transition-colors hover:bg-paper-100 dark:text-ink-100 dark:hover:bg-ink-800"
                >
                  <Icon size={16} className="text-ink-500 dark:text-ink-300" />
                  {label}
                </Link>
              </div>
            ))}

            <div className="my-1 border-t border-paper-200 dark:border-ink-800" />
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onLogout?.();
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <LogOut size={16} />
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}