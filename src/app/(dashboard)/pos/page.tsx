"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { Product } from "@/types/database";
import { Input } from "@/components/ui/input";
import { Search, } from "lucide-react";
import TopHeader from "@/components/dashboard/top-header";
import POSCart from "@/components/pos/cart";
import ProductGrid from "@/components/pos/product-grid";
import { toast } from "sonner";

export default function POSPage() {
  const { user } = useAuthStore();
  const { items: _items, getTotalPrice: _getTotalPrice } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      if (!user) return;

      const supabase = createClient();

      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("store_id", user.store_id)
          .eq("is_active", true)
          .order("name");

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast.error("Gagal memuat produk");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [user]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <TopHeader />

      <div className="container-responsive py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari produk atau kode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Memuat produk...</p>
              </div>
            ) : (
              <ProductGrid products={filteredProducts} />
            )}
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <POSCart />
          </div>
        </div>
      </div>
    </div>
  );
}
