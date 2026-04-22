"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth";
import { Transaction } from "@/types/database";
import TopHeader from "@/components/dashboard/top-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { Search, Eye, FileDown } from "lucide-react";
import Link from "next/link";

export default function TransactionsPage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    async function fetchTransactions() {
      if (!user) return;

      const supabase = createClient();

      try {
        let query = supabase
          .from("transactions")
          .select("*")
          .eq("store_id", user.store_id);

        // Filter by user role
        if (user.role === "cashier") {
          query = query.eq("cashier_id", user.id);
        }

        // Filter by date if provided
        if (dateFilter) {
          query = query
            .gte("created_at", `${dateFilter}T00:00:00`)
            .lte("created_at", `${dateFilter}T23:59:59`);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, [user, dateFilter]);

  const filteredTransactions = transactions.filter((t) =>
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <TopHeader />

      <div className="container-responsive py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Riwayat Transaksi</h1>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari ID transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Transactions Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Memuat transaksi...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Tidak ada transaksi ditemukan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">ID Transaksi</p>
                      <p className="font-mono text-sm">
                        {transaction.id.substring(0, 12)}...
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Waktu</p>
                      <p className="text-sm font-medium">
                        {formatDateTime(transaction.created_at)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Jumlah</p>
                      <p className="text-lg font-bold text-amber-600">
                        {formatCurrency(transaction.total_amount)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
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

                    <div className="flex gap-2 justify-end">
                      <Link href={`/transactions/${transaction.id}`}>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">Lihat</span>
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline" className="gap-2">
                        <FileDown className="w-4 h-4" />
                        <span className="hidden sm:inline">PDF</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
