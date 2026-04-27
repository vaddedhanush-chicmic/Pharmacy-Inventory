"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format, parseISO, differenceInDays } from "date-fns";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
  Calendar,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetcher, createMedicine, updateMedicine, deleteMedicine } from "@/lib/api";
import type { Medicine } from "@/lib/types";

const medicineSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  manufacturer: z.string().optional(),
  mrp: z.coerce.number().min(0, "MRP must be positive"),
  sellingPrice: z.coerce.number().min(0, "Selling price must be positive"),
  stock: z.coerce.number().min(0, "Stock must be positive"),
  reorderLevel: z.coerce.number().min(0, "Reorder level must be positive"),
  expiryDate: z.string().min(1, "Expiry date is required"),
});

type MedicineFormData = z.infer<typeof medicineSchema>;

function MedicineCard({
  medicine,
  onEdit,
  onDelete,
  isStaff,
}: {
  medicine: Medicine;
  onEdit: (medicine: Medicine) => void;
  onDelete: (medicine: Medicine) => void;
  isStaff: boolean;
}) {
  const daysToExpiry = differenceInDays(parseISO(medicine.expiryDate), new Date());
  const isExpiringSoon = daysToExpiry <= 30 && daysToExpiry > 0;
  const isExpired = daysToExpiry < 0;
  const isLowStock = medicine.stock <= medicine.reorderLevel;
  const isCriticalStock = medicine.stock === 0;

  const getStockBadge = () => {
    if (isCriticalStock) {
      return (
        <Badge variant="outline" className="border-destructive text-destructive bg-destructive/5">
          Out of Stock
        </Badge>
      );
    }
    if (isLowStock) {
      return (
        <Badge variant="outline" className="border-warning text-warning bg-warning/5">
          Low: {medicine.stock}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-primary text-primary bg-primary/5">
        In Stock: {medicine.stock}
      </Badge>
    );
  };

  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground truncate">{medicine.name}</h3>
              {(isExpiringSoon || isExpired) && (
                <Badge
                  variant="outline"
                  className={
                    isExpired
                      ? "border-destructive text-destructive bg-destructive/5"
                      : "border-warning text-warning bg-warning/5"
                  }
                >
                  {isExpired ? "Expired" : "Expires soon"}
                </Badge>
              )}
            </div>

            {medicine.manufacturer && (
              <p className="text-sm text-muted-foreground mb-3">{medicine.manufacturer}</p>
            )}

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">MRP:</span>{" "}
                <span className="font-medium">${medicine.mrp.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Selling:</span>{" "}
                <span className="font-medium text-primary">${medicine.sellingPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Expiry:</span>{" "}
                <span className={isExpired || isExpiringSoon ? "text-destructive font-medium" : ""}>
                  {format(parseISO(medicine.expiryDate), "MMM d, yyyy")}
                </span>
              </div>
              <div>{getStockBadge()}</div>
            </div>
          </div>

          {!isStaff && (
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(medicine)}
                className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(medicine)}
                className="h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function MedicinesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setIsStaff(parsed.role === "Staff");
      } catch {
        // Invalid JSON
      }
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: medicines, error, isLoading, mutate } = useSWR<Medicine[]>(
    `/medicines${debouncedSearch ? `?search=${debouncedSearch}` : ""}`,
    fetcher
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MedicineFormData>({
    resolver: zodResolver(medicineSchema),
  });

  const openAddSheet = () => {
    setSelectedMedicine(null);
    reset({
      name: "",
      description: "",
      manufacturer: "",
      mrp: 0,
      sellingPrice: 0,
      stock: 0,
      reorderLevel: 10,
      expiryDate: "",
    });
    setIsSheetOpen(true);
  };

  const openEditSheet = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    reset({
      name: medicine.name,
      description: medicine.description || "",
      manufacturer: medicine.manufacturer || "",
      mrp: medicine.mrp,
      sellingPrice: medicine.sellingPrice,
      stock: medicine.stock,
      reorderLevel: medicine.reorderLevel,
      expiryDate: medicine.expiryDate.split("T")[0],
    });
    setIsSheetOpen(true);
  };

  const openDeleteDialog = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (data: MedicineFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedMedicine) {
        await updateMedicine(selectedMedicine._id, data);
        toast.success("Medicine updated", {
          description: `${data.name} has been updated successfully.`,
        });
      } else {
        await createMedicine(data);
        toast.success("Medicine added", {
          description: `${data.name} has been added to inventory.`,
        });
      }
      mutate();
      setIsSheetOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Something went wrong"
        : "Something went wrong";
      toast.error("Failed to save medicine", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMedicine) return;

    setIsDeleting(true);
    try {
      await deleteMedicine(selectedMedicine._id);
      toast.success("Medicine deleted", {
        description: `${selectedMedicine.name} has been removed from inventory.`,
      });
      mutate();
      setIsDeleteDialogOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Something went wrong"
        : "Something went wrong";
      toast.error("Failed to delete medicine", {
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Medicines</h1>
        <p className="text-muted-foreground mt-1">Manage your pharmacy inventory</p>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search medicines by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-card border-input"
          />
        </div>
        {!isStaff && (
          <Button onClick={openAddSheet} className="h-11 rounded-xl gap-2">
            <Plus className="h-5 w-5" />
            Add Medicine
          </Button>
        )}
      </div>

      {/* Medicine List */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">Failed to load medicines</p>
            <p className="text-muted-foreground mt-1">Please try refreshing the page</p>
          </CardContent>
        </Card>
      ) : medicines && medicines.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">No medicines found</p>
            <p className="text-muted-foreground mt-1">
              {searchQuery
                ? "Try a different search term"
                : "Add your first medicine to get started!"}
            </p>
            {!isStaff && !searchQuery && (
              <Button onClick={openAddSheet} className="mt-4 rounded-xl gap-2">
                <Plus className="h-5 w-5" />
                Add Medicine
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {medicines?.map((medicine) => (
            <MedicineCard
              key={medicine._id}
              medicine={medicine}
              onEdit={openEditSheet}
              onDelete={openDeleteDialog}
              isStaff={isStaff}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{selectedMedicine ? "Edit Medicine" : "Add Medicine"}</SheetTitle>
            <SheetDescription>
              {selectedMedicine
                ? "Update the medicine details below."
                : "Fill in the details to add a new medicine."}
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-200px)] mt-6 pr-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Medicine name"
                  className="rounded-xl"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description"
                  className="rounded-xl"
                  {...register("description")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  placeholder="Manufacturer name"
                  className="rounded-xl"
                  {...register("manufacturer")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mrp">MRP *</Label>
                  <Input
                    id="mrp"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="rounded-xl"
                    {...register("mrp")}
                  />
                  {errors.mrp && (
                    <p className="text-sm text-destructive">{errors.mrp.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sellingPrice">Selling Price *</Label>
                  <Input
                    id="sellingPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="rounded-xl"
                    {...register("sellingPrice")}
                  />
                  {errors.sellingPrice && (
                    <p className="text-sm text-destructive">{errors.sellingPrice.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    className="rounded-xl"
                    {...register("stock")}
                  />
                  {errors.stock && (
                    <p className="text-sm text-destructive">{errors.stock.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reorderLevel">Reorder Level *</Label>
                  <Input
                    id="reorderLevel"
                    type="number"
                    placeholder="10"
                    className="rounded-xl"
                    {...register("reorderLevel")}
                  />
                  {errors.reorderLevel && (
                    <p className="text-sm text-destructive">{errors.reorderLevel.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  className="rounded-xl"
                  {...register("expiryDate")}
                />
                {errors.expiryDate && (
                  <p className="text-sm text-destructive">{errors.expiryDate.message}</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSheetOpen(false)}
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
                  ) : selectedMedicine ? (
                    "Update Medicine"
                  ) : (
                    "Add Medicine"
                  )}
                </Button>
              </div>
            </form>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Medicine</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedMedicine?.name}</strong>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-xl"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
