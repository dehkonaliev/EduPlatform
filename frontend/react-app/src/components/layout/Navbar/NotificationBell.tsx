import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check, Loader2, X } from "lucide-react";
import { useOnClickOutside } from "../../../hooks/useOnClicksOutSide";
import { notificationsApi } from "../../../features/notifications/api/notificationsApi";
import { NOTIFICATION_TYPE_META } from "../../../features/notifications/constants";
import type { AppNotification } from "../../../features/notifications/types";
import { parseApiError } from "../../../lib/api/parseApiError";
import { cn } from "../../../lib/utils";

/** Navbar bell with an unread-count badge and a dropdown of the current user's
 * notifications. Each type gets its own icon + color (see constants), unread
 * items can be marked read or removed. */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(containerRef, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    notificationsApi
      .fetchNotifications()
      .then((data) => setNotifications(data))
      .catch((err) => setError(parseApiError(err).generalMessage))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next) load();
  }

  async function handleMarkRead(id: string) {
    if (busyId) return;
    setBusyId(id);
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(
        (prev) => prev?.map((n) => (n.id === id ? { ...n, is_read: true } : n)) ?? null,
      );
    } catch (err) {
      setError(parseApiError(err).generalMessage);
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(id: string) {
    if (busyId) return;
    setBusyId(id);
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications((prev) => prev?.filter((n) => n.id !== id) ?? null);
    } catch (err) {
      setError(parseApiError(err).generalMessage);
    } finally {
      setBusyId(null);
    }
  }

  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggleOpen}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-600 transition-colors hover:bg-paper-100 dark:text-ink-200 dark:hover:bg-ink-800"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-xl border border-paper-200 bg-white shadow-xl shadow-ink-950/10 dark:border-ink-800 dark:bg-ink-900 dark:shadow-black/40 sm:w-96"
          >
            <div className="flex items-center justify-between border-b border-paper-200 px-4 py-2.5 dark:border-ink-800">
              <p className="text-sm font-semibold text-ink-950 dark:text-paper-50">
                Notifications
              </p>
              {notifications && notifications.length > 0 && (
                <span className="text-xs font-medium text-ink-500 dark:text-ink-400">
                  {unreadCount > 0 ? `${unreadCount} unread` : "All read"}
                </span>
              )}
            </div>

            {isLoading && notifications === null ? (
              <div className="flex justify-center py-10 text-ink-500 dark:text-ink-300">
                <Loader2 size={22} className="animate-spin" />
              </div>
            ) : error && notifications === null ? (
              <div
                role="alert"
                className="px-4 py-6 text-center text-sm text-red-600 dark:text-red-400"
              >
                {error}
              </div>
            ) : notifications && notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell size={22} className="mx-auto text-ink-300 dark:text-ink-600" />
                <p className="mt-2 text-sm font-medium text-ink-700 dark:text-ink-200">
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="max-h-[70vh] overflow-y-auto">
                {notifications?.map((notification) => {
                  const meta = NOTIFICATION_TYPE_META[notification.notif_type];
                  const Icon = meta.icon;
                  const isBusy = busyId === notification.id;
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "flex gap-3 px-4 py-3 transition-colors hover:bg-paper-50 dark:hover:bg-ink-800/60",
                        !notification.is_read && "bg-ember-500/5",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                          meta.iconClassName,
                        )}
                      >
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "text-sm leading-snug text-ink-800 dark:text-paper-100",
                            !notification.is_read && "font-medium",
                          )}
                        >
                          {notification.message}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-500">
                          {meta.label}
                          {!notification.is_read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-ember-500" />
                          )}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-0.5">
                        {!notification.is_read && (
                          <button
                            type="button"
                            onClick={() => handleMarkRead(notification.id)}
                            disabled={isBusy}
                            aria-label="Mark as read"
                            title="Mark as read"
                            className="flex h-7 w-7 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400"
                          >
                            {isBusy ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Check size={13} />
                            )}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemove(notification.id)}
                          disabled={isBusy}
                          aria-label="Remove notification"
                          title="Remove"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
