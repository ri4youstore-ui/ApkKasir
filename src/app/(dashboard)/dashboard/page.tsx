"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/format";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Package, DollarSign, Zap } from "lucide-react";
import TopHeader from "@/components/dashboard/top-header";

interface DashboardStats {
  totalToday: number;
  totalTransactions: number;
  topProduct: any;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalToday: 0,
    totalTransactions: 0,
    topProduct: null,
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;

      const supabase = createClient();
      const today = new Date().toISOString().split("T")[0];

      try {
        // Get today's transactions total
        const { data: todayTransactions } = await supabase
          .from("transactions")
          .select("total_amount")
          .eq("store_id", user.store_id)
          .gte("created_at", `${today}T00:00:00`)
          .lte("created_at", `${today}T23:59:59`);

        const totalToday = (todayTransactions as any[])?.reduce(
          (sum, t) => sum + t.total_amount,
          0
        ) || 0;

        // Get all transactions count
        const { count } = await supabase
          .from("transactions")
          .select("*", { count: "exact" })
          .eq("store_id", user.store_id);

        // Get top product
        const { data: topProducts } = await supabase.rpc(
          "get_top_products",
          { store_id_param: user.store_id, limit_param: 1 }
        );

        setStats({
          totalToday,
          totalTransactions: count || 0,
          topProduct: topProducts?.[0] || null,
        });

        // Get last 7 days data
        const { data: sevenDayTransactions } = await supabase
          .from("transactions")
          .select("created_at, total_amount")
          .eq("store_id", user.store_id)
          .gte(
            "created_at",
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          );
          type Transaction = {
            created_at: string;
            total_amount: number;
          }

        // Group by date
        const grouped: Record<string, number> = {};
        sevenDayTransactions?.forEach((t: Transaction) => {
          const date = new Date(t.created_at).toLocaleDateString("id-ID", {
            month: "short",
            day: "numeric",
          });
          grouped[date] = (grouped[date] || 0) + t.total_amount;
        });

        const chartDataArray = Object.entries(grouped).map(([date, total]) => ({
          date,
          total,
        }));

        setChartData(chartDataArray);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <TopHeader />

      <div className="container-responsive py-6 md:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Omset Hari Ini</CardTitle>
              <DollarSign className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalToday)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                +12% dari kemarin
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transaksi</CardTitle>
              <Zap className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total sepanjang waktu
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produk Terlaris</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold line-clamp-1">
                {stats.topProduct?.name || "–"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.topProduct?.total_sold || 0} terjual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stok Produk</CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">–</div>
              <p className="text-xs text-muted-foreground mt-1">
                Monitor stok rendah
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Penjualan 7 Hari Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#d97706"
                    strokeWidth={2}
                    dot={{ fill: "#d97706", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Tidak ada data penjualan
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
