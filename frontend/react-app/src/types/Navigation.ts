import type { LucideIcon } from "lucide-react";

export interface ProfileMenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Visually separates this item from the one before it */
  dividerBefore?: boolean;
}