"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, CartItem } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";

export default function POSCart() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } =
    useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "qris" | "dana" | "ovo" | "gopay" | "shopeepay" | "bank_transfer"
  >("cash");
  const [amountPaid, setAmountPaid] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const total = getTotalPrice();
  const change = Math.max(0, amountPaid - total);

  async function handleCheckout() {
    if (items.length === 0) {
      toast.error("Keranjang kosong");
      return;
    }

    if (paymentMethod === "cash" && amountPaid < total) {
      toast.error("Nominal pembayaran kurang");
      return;
    }

    if (!user) return;

    setIsProcessing(true);

    try {
      const supabase = createClient();

      // Create transaction
      const { data: transaction, error: transError } = await supabase
        .from("transactions")
        .insert([
          {
            store_id: user.store_id,
            cashier_id: user.id,
            total_amount: total,
            total_paid: amountPaid,
            change_amount: change,
            payment_method: paymentMethod,
            payment_status:
              paymentMethod === "cash" ? "completed" : "pending",
          },
        ])
        .select()
        .single();

      if (transError || !transaction) throw transError;

      // Create transaction items
      const transactionItems = items.map((item: CartItem) => ({
        transaction_id: transaction.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("transaction_items")
        .insert(transactionItems);

      if (itemsError) throw itemsError;

      // Update product stock
      for (const item of items) {
        await supabase.rpc("decrease_stock", {
          product_id: item.id,
          quantity: item.quantity,
        });
      }

      toast.success("Transaksi berhasil!");
      clearCart();
      setAmountPaid(0);

      // Redirect to receipt page
      router.push(`/pos/receipt/${transaction.id}`);
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Transaksi gagal");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="sticky top-20 space-y-4">
      {/* Cart Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <CardTitle className="text-lg">Keranjang</CardTitle>
            <Badge variant="secondary" className="ml-auto">
              {items.length}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Cart Items */}
      <Card className="max-h-64 overflow-y-auto">
        <CardContent className="p-4 space-y-2">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Keranjang kosong</p>
            </div>
          ) : (
            items.map((item: CartItem) => (
              <div key={item.id} className="flex flex-col gap-2 p-2 bg-muted rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-sm">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="flex-1 h-7"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <div className="flex-1 flex items-center justify-center text-sm font-medium">
                    {item.quantity}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="flex-1 h-7"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeItem(item.id)}
                    className="flex-1 h-7 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader className="pb-3">
          <Label className="text-base font-semibold">Metode Pembayaran</Label>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {["cash", "qris", "dana", "gopay", "ovo", "bank_transfer"].map(
              (method) => (
                <Button
                  key={method}
                  variant={
                    paymentMethod === method ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setPaymentMethod(
                      method as typeof paymentMethod
                    )
                  }
                >
                  {method === "cash" ? "💵" : "📱"}
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </Button>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Amount and Total */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label className="text-sm">Total</Label>
            <p className="text-3xl font-bold text-amber-600">
              {formatCurrency(total)}
            </p>
          </div>

          {paymentMethod === "cash" && (
            <>
              <div>
                <Label htmlFor="amount" className="text-sm">
                  Nominal Terbayar
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={amountPaid || ""}
                  onChange={(e) =>
                    setAmountPaid(parseInt(e.target.value) || 0)
                  }
                  className="text-lg"
                />
              </div>

              {amountPaid > 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Kembalian</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(change)}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={clearCart}
          disabled={items.length === 0 || isProcessing}
          className="flex-1"
        >
          Batal
        </Button>
        <Button
          onClick={handleCheckout}
          disabled={items.length === 0 || isProcessing}
          className="flex-1 gap-2"
        >
          <CreditCard className="w-4 h-4" />
          {isProcessing ? "Diproses..." : "Bayar"}
        </Button>
      </div>
    </div>
  );
}
