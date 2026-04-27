"use client";

import useSWR from "swr";
import { IndianRupee, AlertTriangle, Clock, Package, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetcher } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { DashboardData, Medicine } from "@/lib/types";
import { format, differenceInDays, parseISO } from "date-fns";

function StatCard({
  title,
  value,
  icon: Icon,
  variant = "default",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  variant?: "default" | "warning" | "danger";
}) {
  const variantStyles = {
    default: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
    danger: "bg-destructive/10 text-destructive",
  };

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-3xl font-bold mt-1 text-foreground">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${variantStyles[variant]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LowStockItem({ medicine }: { medicine: Medicine }) {
  const stockPercent = (medicine.stock / medicine.reorderLevel) * 100;
  const isCritical = medicine.stock === 0;

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isCritical ? "bg-destructive/10" : "bg-warning/10"}`}>
          <Package className={`h-5 w-5 ${isCritical ? "text-destructive" : "text-warning"}`} />
        </div>
        <div>
          <p className="font-medium text-foreground">{medicine.name}</p>
          <p className="text-sm text-muted-foreground">
            Reorder at: {medicine.reorderLevel} units
          </p>
        </div>
      </div>
      <div className="text-right">
        <Badge
          variant="outline"
          className={
            isCritical
              ? "border-destructive text-destructive bg-destructive/5"
              : "border-warning text-warning bg-warning/5"
          }
        >
          {medicine.stock} left
        </Badge>
      </div>
    </div>
  );
}

function ExpiringItem({ medicine }: { medicine: Medicine }) {
  const daysRemaining = differenceInDays(parseISO(medicine.expiryDate), new Date());
  const isExpired = daysRemaining < 0;
  const isCritical = daysRemaining <= 7;

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isCritical ? "bg-destructive/10" : "bg-warning/10"}`}>
          <Calendar className={`h-5 w-5 ${isCritical ? "text-destructive" : "text-warning"}`} />
        </div>
        <div>
          <p className="font-medium text-foreground">{medicine.name}</p>
          <p className="text-sm text-muted-foreground">
            Expires: {format(parseISO(medicine.expiryDate), "MMM d, yyyy")}
          </p>
        </div>
      </div>
      <Badge
        variant="outline"
        className={
          isExpired
            ? "border-destructive text-destructive bg-destructive/5"
            : isCritical
            ? "border-destructive text-destructive bg-destructive/5"
            : "border-warning text-warning bg-warning/5"
        }
      >
        {isExpired ? "Expired" : `${daysRemaining} days`}
      </Badge>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
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

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-16 w-full rounded-xl" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="p-4 rounded-full bg-primary/10 mb-4">
        <Package className="h-8 w-8 text-primary" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR<DashboardData>("/reports/dashboard", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your pharmacy today</p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        </div>
        <Card className="border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">Failed to load dashboard</p>
            <p className="text-muted-foreground mt-1">Please try refreshing the page</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const dashboardData = data || {
    todayRevenue: 0,
    lowStockCount: 0,
    expiryWarningCount: 0,
    lowStockMedicines: [],
    expiringMedicines: [],
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your pharmacy today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Today&apos;s Revenue"
          value={formatCurrency(dashboardData.todayRevenue)}
          icon={IndianRupee}
          variant="default"
        />
        <StatCard
          title="Low Stock Alerts"
          value={dashboardData.lowStockCount}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="Expiry Warnings"
          value={dashboardData.expiryWarningCount}
          icon={Clock}
          variant="danger"
        />
      </div>

      {/* Detail Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Panel */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Low Stock Medicines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {dashboardData.lowStockMedicines.length === 0 ? (
                <EmptyState message="All medicines are well stocked!" />
              ) : (
                <div className="space-y-3">
                  {dashboardData.lowStockMedicines.map((medicine) => (
                    <LowStockItem key={medicine._id} medicine={medicine} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Expiring Soon Panel */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-destructive" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {dashboardData.expiringMedicines.length === 0 ? (
                <EmptyState message="No medicines expiring soon!" />
              ) : (
                <div className="space-y-3">
                  {dashboardData.expiringMedicines.map((medicine) => (
                    <ExpiringItem key={medicine._id} medicine={medicine} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
