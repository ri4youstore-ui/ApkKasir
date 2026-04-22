"use client";

import Image from "next/image";
import { Product } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/store/cart";
import { formatCurrency } from "@/lib/utils/format";
import { Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  function handleAddToCart() {
    if (product.stock <= 0) {
      toast.error("Produk habis");
      return;
    }
    addItem(product, 1);
    toast.success(`${product.name} ditambahkan ke keranjang`);
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-slate-300 text-4xl">📦</div>
            </div>
          )}

          {/* Stock Badge */}
          <div className="absolute top-2 right-2">
            {product.stock <= 0 ? (
              <Badge variant="destructive">Habis</Badge>
            ) : product.stock < 5 ? (
              <Badge variant="warning">Terbatas</Badge>
            ) : (
              <Badge variant="success">Tersedia</Badge>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-sm line-clamp-2 mb-1">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground mb-3">{product.sku}</p>

          {/* Price */}
          <div className="mb-3">
            <p className="text-lg font-bold text-amber-600">
              {formatCurrency(product.price)}
            </p>
            {product.cost && (
              <p className="text-xs text-muted-foreground">
                Margin: {Math.round(((product.price - product.cost) / product.price) * 100)}%
              </p>
            )}
          </div>

          {/* Add Button */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="w-full gap-2"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            Tambah
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
