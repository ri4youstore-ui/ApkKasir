"use client";

import { useAuthStore } from "@/store/auth";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function TopHeader() {
  const { user } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    try {
      await signOut();
      router.push("/auth/login");
      toast.success("Logout berhasil");
    } catch (error) {
      toast.error("Logout gagal");
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="container-responsive flex h-16 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-600">ApkKasir</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <p className="text-sm text-muted-foreground">
              {user?.role === "owner" ? "👑 Pemilik" : "👤 Kasir"}
            </p>
          </div>
          <Button
            onClick={handleLogout}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
