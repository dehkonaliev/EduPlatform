import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { SearchBar } from "./SearchBar";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  isInstructor?: boolean;
}

export function MobileMenu({ open, onClose, isInstructor = false }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="overflow-hidden border-t border-paper-200 bg-paper-50 dark:border-ink-800 dark:bg-ink-950 md:hidden"
        >
          <div className="flex flex-col gap-4 px-4 py-4">
            <div className="flex items-center justify-between">
              <SearchBar instructorMode={isInstructor} className="max-w-none" />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="ml-2 rounded-full p-2 text-ink-600 hover:bg-paper-100 dark:text-ink-300 dark:hover:bg-ink-800"
              >
                <X size={18} />
              </button>
            </div>
            {isInstructor ? (
              <>
                <Link
                  to="/instructor/courses"
                  onClick={onClose}
                  className="text-sm font-medium text-ink-800 dark:text-paper-50"
                >
                  My Courses
                </Link>
                <Link
                  to="/instructor/course-create"
                  onClick={onClose}
                  className="text-sm font-medium text-ink-800 dark:text-paper-50"
                >
                  Create Course
                </Link>
              </>
            ) : (
              <Link
                to="/my-learning"
                onClick={onClose}
                className="text-sm font-medium text-ink-800 dark:text-paper-50"
              >
                My Learning
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}