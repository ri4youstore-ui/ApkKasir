"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth";
import { Transaction, TransactionItem, Product } from "@/types/database";
import TopHeader from "@/components/dashboard/top-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

interface DetailItem extends TransactionItem {
  product_name?: string;
}

export default function TransactionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuthStore();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [items, setItems] = useState<DetailItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      if (!user) return;

      const supabase = createClient();

      try {
        // Get transaction
        const { data: trans, error: transError } = await supabase
          .from("transactions")
          .select("*")
          .eq("id", params.id)
          .eq("store_id", user.store_id)
          .single();

        if (transError || !trans) throw transError;
        setTransaction(trans);

        // Get items with product names
        const { data: itemsData } = await supabase
          .from("transaction_items")
          .select("*")
          .eq("transaction_id", params.id);

        if (itemsData) {
          for (const item of itemsData) {
            const { data: product } = await supabase
              .from("products")
              .select("name")
              .eq("id", item.product_id)
              .single();

            if (product) {
              item.product_name = product.name;
            }
          }
          setItems(itemsData);
        }
      } catch (error) {
        console.error("Error fetching transaction:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDetail();
  }, [user, params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopHeader />
        <div className="container-responsive py-6 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat detail transaksi...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-background">
        <TopHeader />
        <div className="container-responsive py-6">
          <Link href="/transactions">
            <Button variant="outline" size="sm" className="mb-6 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
          </Link>
          <p className="text-muted-foreground">Transaksi tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopHeader />

      <div className="container-responsive py-6 max-w-2xl">
        <Link href="/transactions">
          <Button variant="outline" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
        </Link>

        <div className="space-y-6">
          {/* Transaction Header */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-2xl">
                    Transaksi #{transaction.id.substring(0, 8).toUpperCase()}
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    {formatDateTime(transaction.created_at)}
                  </p>
                </div>
                <Badge
                  variant={
                    transaction.payment_status === "completed"
                      ? "success"
                      : transaction.payment_status === "pending"
                      ? "warning"
                      : "destructive"
                  }
                >
                  {transaction.payment_status === "completed"
                    ? "✓ Lunas"
                    : transaction.payment_status === "pending"
                    ? "⏳ Menunggu"
                    : "✗ Gagal"}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Item Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center pb-4 border-b last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.unit_price)} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Belanja:</span>
                <span className="font-semibold">
                  {formatCurrency(transaction.total_amount)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Metode Bayar:</span>
                <span className="font-semibold capitalize">
                  {transaction.payment_method.replace("_", " ")}
                </span>
              </div>

              <div className="flex justify-between font-semibold text-lg pt-3 border-t">
                <span>Total Dibayar:</span>
                <span className="text-amber-600">
                  {formatCurrency(transaction.total_paid)}
                </span>
              </div>

              {transaction.change_amount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Kembalian:</span>
                  <span>{formatCurrency(transaction.change_amount)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Button */}
          <Link href={`/pos/receipt/${transaction.id}`}>
            <Button className="w-full gap-2">
              <Download className="w-4 h-4" />
              Download Struk
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
