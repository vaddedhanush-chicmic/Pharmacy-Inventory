"use client";

import { useState } from "react";
import useSWR from "swr";
import { format, parseISO } from "date-fns";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Receipt,
  User,
  CreditCard,
  Package,
  AlertTriangle,
  Filter,
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
import type { Sale } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

function SaleCard({ sale }: { sale: Sale }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const paymentMethodIcon = {
    Cash: "text-primary",
    Card: "text-info-foreground",
    UPI: "text-warning",
  };

  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left"
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">#{sale.invoiceNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(sale.createdAt), "MMM d, yyyy • h:mm a")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {sale.customerName && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="truncate max-w-[100px]">{sale.customerName}</span>
                </div>
              )}
              <Badge variant="outline" className="hidden sm:flex gap-1">
                <CreditCard
                  className={cn("h-3 w-3", paymentMethodIcon[sale.paymentMethod])}
                />
                {sale.paymentMethod}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Package className="h-3 w-3" />
                {sale.items.length} items
              </Badge>
              <div className="text-right">
                <p className="font-bold text-lg text-primary">
                  {formatCurrency(sale.grandTotal)}
                </p>
              </div>
              <div
                className={cn(
                  "p-1 rounded-lg transition-transform",
                  isExpanded && "rotate-180"
                )}
              >
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </CardContent>
      </button>

      {isExpanded && (
        <div className="border-t border-border animate-fade-in">
          <CardContent className="p-5 bg-secondary/20">
            {sale.customerName && (
              <div className="mb-4 sm:hidden">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customer: <span className="font-medium text-foreground">{sale.customerName}</span>
                </p>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Items</p>
              {sale.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-card"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(item.unitPrice)} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.subTotal)}</p>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(sale.grandTotal)}
              </span>
            </div>
          </CardContent>
        </div>
      )}
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-7 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function SalesHistoryPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);
  const queryString = queryParams.toString();

  const { data: sales, error, isLoading } = useSWR<Sale[]>(
    `/sales${queryString ? `?${queryString}` : ""}`,
    fetcher
  );

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const totalRevenue = sales?.reduce((sum, sale) => sum + sale.grandTotal, 0) || 0;
  const totalTransactions = sales?.length || 0;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Sales History</h1>
        <p className="text-muted-foreground mt-1">View all past transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Transactions</p>
            <p className="text-2xl font-bold text-foreground">{totalTransactions}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md mb-6">
        <CardContent className="p-4">
          <Button
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full justify-between rounded-xl"
          >
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter by Date
            </span>
            {showFilters ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    From
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    To
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
              {(startDate || endDate) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="mt-4 rounded-lg"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales List */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">Failed to load sales</p>
            <p className="text-muted-foreground mt-1">Please try refreshing the page</p>
          </CardContent>
        </Card>
      ) : sales && sales.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
              <Receipt className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">No sales found</p>
            <p className="text-muted-foreground mt-1">
              {startDate || endDate
                ? "Try adjusting your date filters"
                : "Sales will appear here once transactions are made"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sales?.map((sale) => (
            <SaleCard key={sale._id} sale={sale} />
          ))}
        </div>
      )}
    </div>
  );
}
