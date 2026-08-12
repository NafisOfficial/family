"use client";

import { useAuth } from "@/context/AuthContext";
import {
  Bell,
  Home,
  LogOut,
  TreePine,
  Trees,
  User,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/tree", label: "Memory tree", icon: Trees },
  { href: "/connections", label: "Connections", icon: Users2 },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Desktop: fixed left column */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-48 lg:flex-col lg:justify-between lg:border-r lg:border-[hsl(var(--border))] lg:bg-[hsl(var(--background))] lg:px-3 lg:py-6 font-body">
        <div className="space-y-8">
          <Link href="/feed" className="flex items-center gap-2 px-3">
            <TreePine className="h-6 w-6 text-[hsl(var(--primary))]" />
            <span className="font-display font-semibold text-lg text-[hsl(var(--primary))]">
              Memory
            </span>
          </Link>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                      : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--primary))]/8"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {user ? (
          <div className="space-y-3">
            <Link
              href={`/profile/${user.username}`}
              className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-[hsl(var(--primary))]/8 transition"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-sm font-semibold text-[hsl(var(--primary-foreground))]">
                {user.displayName?.charAt(0).toUpperCase() ?? (
                  <User className="h-4 w-4" />
                )}
              </div>
              <span className="truncate text-sm font-semibold text-[hsl(var(--foreground))]">
                {user.displayName}
              </span>
            </Link>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[hsl(var(--destructive))] hover:bg-[hsl(var(--border))] transition"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        ) : null}
      </aside>

      {/* Mobile: fixed top bar */}
      <header className="lg:hidden fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur px-4 h-14 font-body">
        <Link href="/feed" className="flex items-center gap-2">
          <TreePine className="h-5 w-5 text-[hsl(var(--primary))]" />
          <span className="font-display font-semibold text-[hsl(var(--primary))]">
            Memory
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                  active
                    ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                    : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--primary))]/8"
                }`}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
        </nav>
      </header>
    </>
  );
}
