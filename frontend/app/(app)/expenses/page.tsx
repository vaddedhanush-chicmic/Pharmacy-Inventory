"use client";

import { useState } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  Plus,
  Wallet,
  Calendar,
  AlertTriangle,
  Loader2,
  Filter,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  Users,
  Zap,
  Wrench,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetcher, createExpense } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { Expense, ExpenseCategory } from "@/lib/types";

const expenseCategories: { value: ExpenseCategory; label: string; icon: React.ElementType }[] = [
  { value: "Inventory Purchase", label: "Inventory Purchase", icon: ShoppingBag },
  { value: "Salary", label: "Salary", icon: Users },
  { value: "Electricity", label: "Electricity", icon: Zap },
  { value: "Maintenance", label: "Maintenance", icon: Wrench },
  { value: "Other", label: "Other", icon: MoreHorizontal },
];

const expenseSchema = z.object({
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
  category: z.enum(["Inventory Purchase", "Salary", "Electricity", "Maintenance", "Other"]),
  description: z.string().optional(),
  date: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

function getCategoryIcon(category: ExpenseCategory) {
  const cat = expenseCategories.find((c) => c.value === category);
  return cat?.icon || MoreHorizontal;
}

function getCategoryColor(category: ExpenseCategory) {
  switch (category) {
    case "Inventory Purchase":
      return "bg-primary/10 text-primary";
    case "Salary":
      return "bg-info/10 text-info-foreground";
    case "Electricity":
      return "bg-warning/10 text-warning";
    case "Maintenance":
      return "bg-secondary text-foreground";
    case "Other":
    default:
      return "bg-muted text-muted-foreground";
  }
}

function ExpenseCard({ expense }: { expense: Expense }) {
  const Icon = getCategoryIcon(expense.category);
  const colorClass = getCategoryColor(expense.category);

  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${colorClass}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {expense.category}
                </Badge>
              </div>
              {expense.description && (
                <p className="text-sm text-foreground mb-2">{expense.description}</p>
              )}
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(parseISO(expense.date), "MMM d, yyyy")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-destructive">
              -{formatCurrency(expense.amount)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-7 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ExpensesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [period, setPeriod] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const queryParams = new URLSearchParams();
  if (period) queryParams.append("period", period);
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);
  const queryString = queryParams.toString();

  const { data: expenses, error, isLoading, mutate } = useSWR<Expense[]>(
    `/expenses${queryString ? `?${queryString}` : ""}`,
    fetcher
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: "Other",
    },
  });

  const selectedCategory = watch("category");

  const openDialog = () => {
    reset({
      amount: 0,
      category: "Other",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    try {
      await createExpense(data);
      toast.success("Expense logged", {
        description: `${formatCurrency(data.amount)} expense recorded successfully.`,
      });
      mutate();
      setIsDialogOpen(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
            "Something went wrong"
          : "Something went wrong";
      toast.error("Failed to log expense", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFilters = () => {
    setPeriod("");
    setStartDate("");
    setEndDate("");
  };

  const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const totalCount = expenses?.length || 0;

  // Group expenses by category for summary
  const categoryTotals = expenses?.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground mt-1">Track and manage your expenses</p>
        </div>
        <Button onClick={openDialog} className="rounded-xl gap-2">
          <Plus className="h-5 w-5" />
          Log Expense
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold text-destructive">
              {formatCurrency(totalExpenses)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Entries</p>
            <p className="text-2xl font-bold text-foreground">{totalCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <Card className="border-0 shadow-md mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              By Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(categoryTotals).map(([category, total]) => {
                const Icon = getCategoryIcon(category as ExpenseCategory);
                return (
                  <div
                    key={category}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{category}:</span>
                    <span className="text-sm font-semibold text-destructive">
                      {formatCurrency(total)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
              Filter Expenses
            </span>
            {showFilters ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border animate-fade-in space-y-4">
              <div className="space-y-2">
                <Label>Quick Period</Label>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">This Week</SelectItem>
                    <SelectItem value="monthly">This Month</SelectItem>
                    <SelectItem value="yearly">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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

              {(period || startDate || endDate) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="rounded-lg"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expenses List */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">Failed to load expenses</p>
            <p className="text-muted-foreground mt-1">Please try refreshing the page</p>
          </CardContent>
        </Card>
      ) : expenses && expenses.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">No expenses found</p>
            <p className="text-muted-foreground mt-1">
              {period || startDate || endDate
                ? "Try adjusting your filters"
                : "Log your first expense to get started!"}
            </p>
            <Button onClick={openDialog} className="mt-4 rounded-xl gap-2">
              <Plus className="h-5 w-5" />
              Log Expense
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-4 pr-4">
            {expenses?.map((expense) => (
              <ExpenseCard key={expense._id} expense={expense} />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Add Expense Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Expense</DialogTitle>
            <DialogDescription>Record a new expense for your pharmacy.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (INR) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                className="rounded-xl text-lg"
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <div className="grid grid-cols-2 gap-2">
                {expenseCategories.map((cat) => (
                  <Button
                    key={cat.value}
                    type="button"
                    variant={selectedCategory === cat.value ? "default" : "outline"}
                    onClick={() => setValue("category", cat.value)}
                    className="h-auto py-3 rounded-xl flex-col gap-1"
                  >
                    <cat.icon className="h-5 w-5" />
                    <span className="text-xs">{cat.label}</span>
                  </Button>
                ))}
              </div>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="Brief description of expense"
                className="rounded-xl"
                {...register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                className="rounded-xl"
                {...register("date")}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Log Expense"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
