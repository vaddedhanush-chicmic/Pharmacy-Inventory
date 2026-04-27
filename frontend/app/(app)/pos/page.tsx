"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Receipt,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  X,
  Loader2,
  Package,
  Check,
  Printer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { fetcher, createSale } from "@/lib/api";
import type { Medicine, CartItem, Sale } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

function SearchDropdown({
  medicines,
  isOpen,
  onSelect,
  searchQuery,
}: {
  medicines: Medicine[];
  isOpen: boolean;
  onSelect: (medicine: Medicine) => void;
  searchQuery: string;
}) {
  if (!isOpen || medicines.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl shadow-lg border border-border z-50 overflow-hidden">
      <ScrollArea className="max-h-64">
        {medicines.map((medicine) => (
          <button
            key={medicine._id}
            onClick={() => onSelect(medicine)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/50 transition-colors text-left"
          >
            <div>
              <p className="font-medium text-foreground">{medicine.name}</p>
              <p className="text-sm text-muted-foreground">{medicine.manufacturer || "Generic"}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-primary">{formatCurrency(medicine.sellingPrice)}</p>
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  medicine.stock === 0
                    ? "border-destructive text-destructive"
                    : medicine.stock <= medicine.reorderLevel
                    ? "border-warning text-warning"
                    : "border-primary text-primary"
                )}
              >
                Stock: {medicine.stock}
              </Badge>
            </div>
          </button>
        ))}
      </ScrollArea>
    </div>
  );
}

function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{item.name}</p>
        <p className="text-sm text-muted-foreground">{formatCurrency(item.unitPrice)} each</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onUpdateQuantity(item.medicineId, item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="h-8 w-8 rounded-lg"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onUpdateQuantity(item.medicineId, item.quantity + 1)}
          disabled={item.quantity >= item.maxStock}
          className="h-8 w-8 rounded-lg"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="w-20 text-right">
        <p className="font-semibold text-foreground">
          {formatCurrency(item.unitPrice * item.quantity)}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(item.medicineId)}
        className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function ReceiptModal({
  isOpen,
  onClose,
  sale,
}: {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}) {
  if (!sale) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            Sale Complete
          </DialogTitle>
          <DialogDescription>
            Transaction completed successfully
          </DialogDescription>
        </DialogHeader>

        <div className="bg-secondary/30 rounded-xl p-4 space-y-4">
          {/* Header */}
          <div className="text-center border-b border-border pb-4">
            <h3 className="font-bold text-lg text-foreground">PharmaCare</h3>
            <p className="text-sm text-muted-foreground">Invoice #{sale.invoiceNumber}</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(sale.createdAt), "MMM d, yyyy h:mm a")}
            </p>
          </div>

          {/* Customer */}
          {sale.customerName && (
            <div className="text-sm">
              <span className="text-muted-foreground">Customer:</span>{" "}
              <span className="font-medium">{sale.customerName}</span>
            </div>
          )}

          {/* Items */}
          <div className="space-y-2">
            {sale.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-foreground">
                  {item.name} x{item.quantity}
                </span>
                <span className="font-medium">{formatCurrency(item.subTotal)}</span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(sale.grandTotal)}</span>
          </div>

          <div className="text-sm text-center text-muted-foreground">
            Payment Method: {sale.paymentMethod}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">
            Close
          </Button>
          <Button
            onClick={() => window.print()}
            className="flex-1 rounded-xl gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: medicines } = useSWR<Medicine[]>(
    debouncedSearch ? `/medicines?search=${debouncedSearch}` : null,
    fetcher
  );

  const addToCart = (medicine: Medicine) => {
    if (medicine.stock === 0) {
      toast.error("Out of stock", {
        description: `${medicine.name} is currently out of stock.`,
      });
      return;
    }

    setCart((prev) => {
      const existingItem = prev.find((item) => item.medicineId === medicine._id);
      if (existingItem) {
        if (existingItem.quantity >= medicine.stock) {
          toast.error("Stock limit reached", {
            description: `Only ${medicine.stock} units available.`,
          });
          return prev;
        }
        return prev.map((item) =>
          item.medicineId === medicine._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          medicineId: medicine._id,
          name: medicine.name,
          quantity: 1,
          unitPrice: medicine.sellingPrice,
          maxStock: medicine.stock,
        },
      ];
    });

    setSearchQuery("");
    setIsDropdownOpen(false);
    toast.success("Added to cart", {
      description: `${medicine.name} added to cart.`,
    });
  };

  const updateQuantity = (medicineId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.medicineId === medicineId
          ? { ...item, quantity: Math.min(quantity, item.maxStock) }
          : item
      )
    );
  };

  const removeFromCart = (medicineId: string) => {
    setCart((prev) => prev.filter((item) => item.medicineId !== medicineId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName("");
    setDiscount(0);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  const handleGenerateBill = async () => {
    if (cart.length === 0) {
      toast.error("Cart is empty", {
        description: "Add items to the cart before generating a bill.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const saleData = {
        customerName: customerName || undefined,
        items: cart.map((item) => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
        })),
        paymentMethod,
      };

      const response = await createSale(saleData);
      setCompletedSale(response);
      setIsReceiptOpen(true);
      clearCart();
      toast.success("Sale completed", {
        description: `Invoice #${response.invoiceNumber} generated.`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Something went wrong"
        : "Something went wrong";
      toast.error("Failed to complete sale", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods = [
    { value: "Cash", label: "Cash", icon: Banknote },
    { value: "Card", label: "Card", icon: CreditCard },
    { value: "UPI", label: "UPI", icon: Smartphone },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Point of Sale</h1>
        <p className="text-muted-foreground mt-1">Quick and easy billing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Search and Cart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div ref={searchRef} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search medicines to add..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="pl-10 h-12 text-lg rounded-xl bg-secondary/50 border-input"
                />
                <SearchDropdown
                  medicines={medicines || []}
                  isOpen={isDropdownOpen && searchQuery.length > 0}
                  onSelect={addToCart}
                  searchQuery={searchQuery}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cart */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Cart ({cart.length} items)
                </CardTitle>
                {cart.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-full bg-primary/10 mb-4">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Cart is empty</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Search for medicines above to add them
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <CartItemRow
                        key={item.medicineId}
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                      />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Bill Summary */}
        <div className="space-y-6">
          <Card className="border-0 shadow-md sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Bill Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Customer Name */}
              <div className="space-y-2">
                <Label htmlFor="customerName" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Customer Name (Optional)
                </Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((method) => (
                    <Button
                      key={method.value}
                      variant={paymentMethod === method.value ? "default" : "outline"}
                      onClick={() => setPaymentMethod(method.value)}
                      className={cn(
                        "h-12 rounded-xl flex-col gap-1",
                        paymentMethod === method.value && "bg-primary text-primary-foreground"
                      )}
                    >
                      <method.icon className="h-4 w-4" />
                      <span className="text-xs">{method.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">Discount</span>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-24 h-8 text-right rounded-lg"
                    min={0}
                    max={subtotal}
                  />
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Generate Bill Button */}
              <Button
                onClick={handleGenerateBill}
                disabled={cart.length === 0 || isSubmitting}
                className="w-full h-12 text-lg rounded-xl gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Receipt className="h-5 w-5" />
                    Generate Bill
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={completedSale}
      />
    </div>
  );
}
