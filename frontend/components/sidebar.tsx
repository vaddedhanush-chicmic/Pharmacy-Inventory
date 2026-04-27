"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Pill,
  ShoppingCart,
  ClipboardList,
  Users,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, adminOnly: true },
  { href: "/medicines", label: "Medicines", icon: Pill },
  { href: "/pos", label: "Point of Sale", icon: ShoppingCart },
  { href: "/sales", label: "Sales History", icon: ClipboardList },
  { href: "/staff", label: "Staff", icon: Users, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Invalid JSON
      }
    }
  }, []);

  const isAdmin = user?.role === "Admin";

  const filteredNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-6 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Pill className="h-5 w-5 text-primary" />
        </div>
        {!isCollapsed && (
          <span className="text-lg font-bold text-foreground">PharmaCare</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-accent text-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-sidebar-border p-4 space-y-3">
        {!isCollapsed && user && (
          <div className="px-3 py-2 rounded-xl bg-sidebar-accent/50">
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-card shadow-md border border-border"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-foreground/20 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col shadow-xl transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-sidebar-accent"
          aria-label="Close menu"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
        <NavContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <NavContent />
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute bottom-24 -right-3 p-1.5 rounded-full bg-card border border-border shadow-md hover:bg-sidebar-accent"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isCollapsed && "rotate-180"
            )}
          />
        </button>
      </aside>
    </>
  );
}
