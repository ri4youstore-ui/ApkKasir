"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, History, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Beranda",
    icon: Home,
  },
  {
    href: "/pos",
    label: "Kasir",
    icon: ShoppingCart,
  },
  {
    href: "/transactions",
    label: "Riwayat",
    icon: History,
  },
  {
    href: "/profile",
    label: "Akun",
    icon: User,
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-background border-t border-border">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-3 px-4 flex-1 transition-colors",
                isActive
                  ? "text-amber-600 border-t-2 border-amber-600"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
