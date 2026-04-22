"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import TopHeader from "@/components/dashboard/top-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LogOut, Lock, User, Store } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      if (!user) return;

      const supabase = createClient();

      try {
        // Get user from auth
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          setEmail(authUser.email || "");
          setName(authUser.user_metadata?.full_name || "");
        }

        // Get store data
        const { data: store } = await supabase
          .from("stores")
          .select("*")
          .eq("id", user.store_id)
          .single();

        if (store) {
          setStoreName(store.name);
          setStoreAddress(store.address || "");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    }

    loadUserData();
  }, [user]);

  async function handleUpdateProfile() {
    if (!user) return;

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Update user profile
      await supabase.auth.updateUser({
        data: {
          full_name: name,
        },
      });

      // Update store data (if owner)
      if (user.role === "owner") {
        await supabase
          .from("stores")
          .update({
            name: storeName,
            address: storeAddress,
          })
          .eq("id", user.store_id);
      }

      toast.success("Profil berhasil diperbarui");
    } catch (error: any) {
      toast.error(error.message || "Gagal memperbarui profil");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleChangePassword() {
    if (!newPassword || !confirmPassword) {
      toast.error("Password tidak boleh kosong");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Password tidak sesuai");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      await supabase.auth.updateUser({
        password: newPassword,
      });

      toast.success("Password berhasil diubah");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Gagal mengubah password");
    } finally {
      setIsLoading(false);
    }
  }

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
    <div className="min-h-screen bg-background">
      <TopHeader />

      <div className="container-responsive py-6 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Profil Saya</h1>

        {/* User Role Badge */}
        <div className="mb-6">
          <Badge variant={user?.role === "owner" ? "default" : "secondary"}>
            {user?.role === "owner" ? "👑 Pemilik Toko" : "👤 Kasir"}
          </Badge>
        </div>

        {/* Basic Profile */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informasi Profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div>
              <Label htmlFor="email">Email (tidak dapat diubah)</Label>
              <Input
                id="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>

            {user?.role === "owner" && (
              <>
                <div>
                  <Label htmlFor="storeName">Nama Toko</Label>
                  <Input
                    id="storeName"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Masukkan nama toko"
                  />
                </div>

                <div>
                  <Label htmlFor="storeAddress">Alamat Toko</Label>
                  <Input
                    id="storeAddress"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    placeholder="Masukkan alamat toko"
                  />
                </div>
              </>
            )}

            <Button onClick={handleUpdateProfile} disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Keamanan
            </CardTitle>
            <CardDescription>
              Ubah password akun Anda secara berkala untuk keamanan maksimal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="newPassword">Password Baru</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Konfirmasi password baru"
              />
            </div>

            <Button
              onClick={handleChangePassword}
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Ubah Password"}
            </Button>
          </CardContent>
        </Card>

        {/* Logout */}
        <div>
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
