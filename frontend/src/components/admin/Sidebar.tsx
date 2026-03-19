"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Ticket,
  Users,
  BarChart3,
  Activity,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const navItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "All Tickets",
    href: "/admin?tab=tickets",
    icon: Ticket,
  },
  {
    label: "Users",
    href: "/admin?tab=users",
    icon: Users,
  },
  {
    label: "Analytics",
    href: "/admin?tab=analytics",
    icon: BarChart3,
  },
  {
    label: "Live Activity",
    href: "/admin?tab=activity",
    icon: Activity,
  },
];

const sidebarVariants = {
  expanded: {
    width: "280px",
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  collapsed: {
    width: "80px",
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

const itemVariants = {
  expanded: {
    justifyContent: "flex-start",
    transition: { duration: 0.2 },
  },
  collapsed: {
    justifyContent: "center",
    transition: { duration: 0.2 },
  },
};

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu className="w-6 h-6" />
      </Button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={collapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        className={`
          fixed left-0 top-0 h-full bg-card/50 border-r border-border/50 
          backdrop-blur-sm z-40 overflow-hidden
          lg:block ${isMobileOpen ? "block" : "hidden lg:block"}
        `}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/50">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <motion.span
              className="font-bold text-lg font-heading text-foreground whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: collapsed ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            >
              TechCorp
            </motion.span>
          </motion.div>

          {/* Toggle Button (Desktop) */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex flex-shrink-0"
            onClick={onToggle}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <motion.div
                key={item.href}
                variants={itemVariants}
                initial={collapsed ? "collapsed" : "expanded"}
                animate={collapsed ? "collapsed" : "expanded"}
              >
                <Link
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg
                    transition-all duration-200 group
                    ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <motion.span
                    className="font-medium whitespace-nowrap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: collapsed ? 0 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50">
          <button
            className={`
              flex items-center gap-3 px-3 py-3 rounded-lg
              text-muted-foreground hover:bg-destructive/10 hover:text-destructive
              transition-all duration-200 w-full
            `}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <motion.span
              className="font-medium whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: collapsed ? 0 : 1 }}
              transition={{ duration: 0.2 }}
            >
              Logout
            </motion.span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
