import {
  LayoutDashboard,
  Users,
  FileText,
  ShoppingCart,
  Contact,
  Building2,
  UserCog,
  LayoutTemplate,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navigationItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "CRM", href: "/crm", icon: Users },
  { label: "Quotes", href: "/quotes", icon: FileText },
  { label: "Purchase Orders", href: "/purchase-orders", icon: ShoppingCart },
  { label: "Customers", href: "/customers", icon: Contact },
  { label: "Architects", href: "/architects", icon: Building2 },
];

export const administrationItems: NavItem[] = [
  { label: "User Management", href: "/users", icon: UserCog },
  { label: "Templates", href: "/templates", icon: LayoutTemplate },
  { label: "Credits", href: "/credits", icon: Wallet },
];

// Shown in the mobile bottom tab bar — a focused subset of the most-used
// destinations (full nav still reachable via the sidebar drawer).
export const mobileTabItems: NavItem[] = [
  navigationItems[0], // Dashboard
  navigationItems[1], // CRM
  navigationItems[2], // Quotes
  administrationItems[0], // User Management
];
