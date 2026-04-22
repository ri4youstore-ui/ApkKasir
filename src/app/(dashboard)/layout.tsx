"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth";
import BottomNavigation from "@/components/navigation/bottom-navigation";
import { Loader2 } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, setUser, setLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();

    async function checkAuth() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
          router.push("/auth/login");
          return;
        }

        // Get user profile from database
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (error || !data) {
          // User profile not found, redirect to setup
          router.push("/auth/setup");
          return;
        }

        setUser(data);
      } catch (error) {
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router, setUser, setLoading]);

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-slate-300">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 md:pb-0">
      <main className="flex-1 overflow-y-auto">{children}</main>
      <BottomNavigation />
    </div>
  );
}
