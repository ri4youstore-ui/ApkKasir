"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth";
import { Transaction, TransactionItem } from "@/types/database";
import TopHeader from "@/components/dashboard/top-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { generateReceiptPDF, printReceipt } from "@/lib/utils/receipt";
import { Printer, Download, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ReceiptData {
  transaction: Transaction;
  items: TransactionItem[];
  storeName: string;
  cashierName: string;
}

export default function ReceiptPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReceipt() {
      if (!user) return;

      const supabase = createClient();

      try {
        // Get transaction
        const { data: transaction, error: transError } = await supabase
          .from("transactions")
          .select("*")
          .eq("id", params.id)
          .eq("store_id", user.store_id)
          .single();

        if (transError || !transaction) throw transError;

        // Get transaction items
        const { data: items } = await supabase
          .from("transaction_items")
          .select("*")
          .eq("transaction_id", params.id);

        // Get store info
        const { data: store } = await supabase
          .from("stores")
          .select("name")
          .eq("id", user.store_id)
          .single();

        // Get cashier name
        const { data: cashier } = await supabase
          .from("users")
          .select("name")
          .eq("id", transaction.cashier_id)
          .single();

        setReceipt({
          transaction,
          items: items || [],
          storeName: store?.name || "ApkKasir",
          cashierName: cashier?.name || "Kasir",
        });
      } catch (error) {
        console.error("Error loading receipt:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadReceipt();
  }, [user, params.id]);

  async function handlePrint() {
    if (receiptRef.current) {
      await printReceipt(receiptRef.current);
    }
  }

  async function handleDownloadPDF() {
    if (receiptRef.current) {
      await generateReceiptPDF(receiptRef.current, `struk-${receipt?.transaction.id}.pdf`);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopHeader />
        <div className="container-responsive py-6 text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat struk...</p>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen bg-background">
        <TopHeader />
        <div className="container-responsive py-6 text-center">
          <p className="text-muted-foreground">Struk tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopHeader />

      <div className="container-responsive py-6 max-w-2xl">
        <Link href="/pos">
          <Button variant="outline" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke POS
          </Button>
        </Link>

        {/* Receipt */}
        <Card ref={receiptRef} className="p-8 bg-white text-black font-mono text-sm">
          <div className="text-center space-y-2 border-b pb-4">
            <div className="text-2xl font-bold">{receipt.storeName}</div>
            <div className="text-xs text-gray-600">Struk Penjualan</div>
            <div className="text-xs text-gray-600 mt-4">
              ID: {receipt.transaction.id.substring(0, 12)}
            </div>
            <div className="text-xs text-gray-600">
              {formatDateTime(receipt.transaction.created_at)}
            </div>
            <div className="text-xs text-gray-600">
              Kasir: {receipt.cashierName}
            </div>
          </div>

          {/* Items */}
          <div className="border-b py-4 space-y-2">
            <div className="grid grid-cols-4 gap-2 text-xs font-bold mb-2 pb-2 border-b">
              <div>Item</div>
              <div className="text-right">Qty</div>
              <div className="text-right">Harga</div>
              <div className="text-right">Total</div>
            </div>

            {receipt.items.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="col-span-1">Produk</div>
                  <div className="text-right">{item.quantity}</div>
                  <div className="text-right">{formatCurrency(item.unit_price)}</div>
                  <div className="text-right">{formatCurrency(item.subtotal)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="border-b py-4 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(receipt.transaction.total_amount)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{formatCurrency(receipt.transaction.total_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Bayar:</span>
              <span>{formatCurrency(receipt.transaction.total_paid)}</span>
            </div>
            {receipt.transaction.change_amount > 0 && (
              <div className="flex justify-between font-bold">
                <span>Kembalian:</span>
                <span>{formatCurrency(receipt.transaction.change_amount)}</span>
              </div>
            )}
          </div>

          {/* Payment Method & Status */}
          <div className="pt-4 space-y-1 text-xs text-center">
            <div className="capitalize">
              Metode: {receipt.transaction.payment_method.replace("_", " ")}
            </div>
            <div className={`capitalize ${
              receipt.transaction.payment_status === "completed"
                ? "text-green-600"
                : "text-yellow-600"
            }`}>
              Status: {receipt.transaction.payment_status}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-4 pt-4 border-t text-xs text-gray-600">
            <div>Terima kasih telah berbelanja!</div>
            <div>Kunjungi lagi ya!</div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 no-print">
          <Button onClick={handlePrint} className="flex-1 gap-2">
            <Printer className="w-4 h-4" />
            Cetak
          </Button>
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="flex-1 gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>

        {/* New Transaction Button */}
        <div className="mt-6">
          <Link href="/pos" className="w-full block">
            <Button className="w-full">Transaksi Baru</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
