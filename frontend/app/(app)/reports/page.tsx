"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  BarChart3,
  Receipt,
  Wallet,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { fetcher } from "@/lib/api";
import { formatCurrency, cn } from "@/lib/utils";
import type { ReportSummary, TopSellingItem } from "@/lib/types";

type ViewPeriod = "daily" | "weekly" | "monthly" | "yearly" | "custom";

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  variant = "default",
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "success" | "danger" | "warning";
}) {
  const variantStyles = {
    default: "bg-primary/10 text-primary",
    success: "bg-green-500/10 text-green-600",
    danger: "bg-destructive/10 text-destructive",
    warning: "bg-warning/10 text-warning",
  };

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
            {trend && trendValue && (
              <div className="flex items-center gap-1 mt-2">
                {trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : trend === "down" ? (
                  <ArrowDownRight className="h-4 w-4 text-destructive" />
                ) : null}
                <span
                  className={cn(
                    "text-xs font-medium",
                    trend === "up" ? "text-green-600" : trend === "down" ? "text-destructive" : "text-muted-foreground"
                  )}
                >
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${variantStyles[variant]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TimeSeriesRow({
  date,
  revenue,
  expenses,
  net,
  invoices,
}: {
  date: string;
  revenue: number;
  expenses: number;
  net: number;
  invoices: number;
}) {
  const isProfit = net >= 0;

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="p-2 rounded-lg bg-card">
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-foreground">{date}</p>
          <p className="text-sm text-muted-foreground">{invoices} invoices</p>
        </div>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <div className="text-right">
          <p className="text-muted-foreground">Revenue</p>
          <p className="font-semibold text-primary">{formatCurrency(revenue)}</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">Expenses</p>
          <p className="font-semibold text-destructive">{formatCurrency(expenses)}</p>
        </div>
        <div className="text-right min-w-[100px]">
          <p className="text-muted-foreground">Net</p>
          <p className={cn("font-bold", isProfit ? "text-green-600" : "text-destructive")}>
            {isProfit ? "+" : ""}{formatCurrency(net)}
          </p>
        </div>
      </div>
    </div>
  );
}

function TopSellingCard({ item, rank }: { item: TopSellingItem; rank: number }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{item.name}</p>
      </div>
      <Badge variant="outline" className="gap-1">
        <Package className="h-3 w-3" />
        {item.totalQuantitySold} sold
      </Badge>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-0 shadow-md">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((j) => (
            <Skeleton key={j} className="h-16 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportsPage() {
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>("daily");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  // Calculate date range based on view period
  const dateRange = useMemo(() => {
    const today = new Date();
    
    switch (viewPeriod) {
      case "daily":
        // Last 7 days
        return {
          startDate: format(subDays(today, 6), "yyyy-MM-dd"),
          endDate: format(today, "yyyy-MM-dd"),
        };
      case "weekly":
        return {
          startDate: format(startOfWeek(today, { weekStartsOn: 0 }), "yyyy-MM-dd"),
          endDate: format(endOfWeek(today, { weekStartsOn: 0 }), "yyyy-MM-dd"),
        };
      case "monthly":
        return {
          startDate: format(startOfMonth(today), "yyyy-MM-dd"),
          endDate: format(endOfMonth(today), "yyyy-MM-dd"),
        };
      case "yearly":
        return {
          startDate: format(startOfYear(today), "yyyy-MM-dd"),
          endDate: format(endOfYear(today), "yyyy-MM-dd"),
        };
      case "custom":
        return {
          startDate: customStartDate,
          endDate: customEndDate,
        };
      default:
        return {
          startDate: format(subDays(today, 6), "yyyy-MM-dd"),
          endDate: format(today, "yyyy-MM-dd"),
        };
    }
  }, [viewPeriod, customStartDate, customEndDate]);

  const queryParams = new URLSearchParams();
  if (dateRange.startDate) queryParams.append("startDate", dateRange.startDate);
  if (dateRange.endDate) queryParams.append("endDate", dateRange.endDate);
  const queryString = queryParams.toString();

  const { data: reportData, error, isLoading } = useSWR<ReportSummary>(
    queryString ? `/reports/sales-summary?${queryString}` : null,
    fetcher
  );

  const { data: topSelling } = useSWR<TopSellingItem[]>("/reports/top-selling", fetcher);

  const periodButtons: { value: ViewPeriod; label: string }[] = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
    { value: "custom", label: "Custom" },
  ];

  const formatTimeSeriesDate = (dateStr: string) => {
    // Handle both YYYY-MM-DD and YYYY-MM formats
    if (dateStr.length === 7) {
      // YYYY-MM format (monthly grouping)
      const [year, month] = dateStr.split("-");
      return format(new Date(parseInt(year), parseInt(month) - 1, 1), "MMM yyyy");
    }
    return format(parseISO(dateStr), "MMM d, yyyy");
  };

  const getPeriodLabel = () => {
    switch (viewPeriod) {
      case "daily":
        return "Last 7 Days";
      case "weekly":
        return "This Week";
      case "monthly":
        return "This Month";
      case "yearly":
        return "This Year";
      case "custom":
        if (dateRange.startDate && dateRange.endDate) {
          return `${format(parseISO(dateRange.startDate), "MMM d")} - ${format(parseISO(dateRange.endDate), "MMM d, yyyy")}`;
        }
        return "Custom Range";
      default:
        return "";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">Financial overview and analytics</p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        </div>
        <Card className="border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">Failed to load reports</p>
            <p className="text-muted-foreground mt-1">Please try refreshing the page</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const grandTotals = reportData?.grandTotals || {
    totalRevenue: 0,
    totalExpenses: 0,
    netEarned: 0,
    totalInvoices: 0,
  };

  const timeSeries = reportData?.timeSeries || [];
  const isProfit = grandTotals.netEarned >= 0;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground mt-1">Financial overview and analytics</p>
      </div>

      {/* Period Selector */}
      <Card className="border-0 shadow-md mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            {periodButtons.map((btn) => (
              <Button
                key={btn.value}
                variant={viewPeriod === btn.value ? "default" : "outline"}
                size="sm"
                onClick={() => setViewPeriod(btn.value)}
                className="rounded-lg"
              >
                {btn.label}
              </Button>
            ))}
          </div>

          {viewPeriod === "custom" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="customStart" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  From
                </Label>
                <Input
                  id="customStart"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customEnd" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  To
                </Label>
                <Input
                  id="customEnd"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Calendar className="h-3 w-3" />
              {getPeriodLabel()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(grandTotals.totalRevenue)}
          icon={TrendingUp}
          variant="success"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(grandTotals.totalExpenses)}
          icon={Wallet}
          variant="danger"
        />
        <StatCard
          title="Net Profit"
          value={`${isProfit ? "+" : ""}${formatCurrency(grandTotals.netEarned)}`}
          icon={isProfit ? TrendingUp : TrendingDown}
          variant={isProfit ? "success" : "danger"}
        />
        <StatCard
          title="Total Invoices"
          value={grandTotals.totalInvoices.toString()}
          icon={Receipt}
          variant="default"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time Series Breakdown */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {viewPeriod === "yearly" ? "Monthly" : "Daily"} Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeSeries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <BarChart3 className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">No data for this period</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {timeSeries.map((item) => (
                      <TimeSeriesRow
                        key={item.date}
                        date={formatTimeSeriesDate(item.date)}
                        revenue={item.revenue}
                        expenses={item.expenses}
                        net={item.net}
                        invoices={item.invoices}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Selling */}
        <div>
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Top Selling
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!topSelling || topSelling.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">No sales data yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topSelling.map((item, index) => (
                    <TopSellingCard key={item._id} item={item} rank={index + 1} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Summary Card */}
          <Card className="border-0 shadow-md mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quick Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg. Invoice</span>
                <span className="font-semibold">
                  {grandTotals.totalInvoices > 0
                    ? formatCurrency(grandTotals.totalRevenue / grandTotals.totalInvoices)
                    : formatCurrency(0)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Profit Margin</span>
                <span
                  className={cn(
                    "font-semibold",
                    isProfit ? "text-green-600" : "text-destructive"
                  )}
                >
                  {grandTotals.totalRevenue > 0
                    ? `${((grandTotals.netEarned / grandTotals.totalRevenue) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Expense Ratio</span>
                <span className="font-semibold text-warning">
                  {grandTotals.totalRevenue > 0
                    ? `${((grandTotals.totalExpenses / grandTotals.totalRevenue) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
