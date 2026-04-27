"use client";

import { useState } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  UserPlus,
  Users,
  Shield,
  ShieldCheck,
  Trash2,
  Mail,
  Calendar,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { fetcher, createUser, deleteUser } from "@/lib/api";
import type { User } from "@/lib/types";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["Admin", "Staff"]),
});

type UserFormData = z.infer<typeof userSchema>;

function StaffCard({
  user,
  onDelete,
  currentUserId,
}: {
  user: User;
  onDelete: (user: User) => void;
  currentUserId: string;
}) {
  const isCurrentUser = user._id === currentUserId;

  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              {user.role === "Admin" ? (
                <ShieldCheck className="h-6 w-6 text-primary" />
              ) : (
                <Shield className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{user.name}</p>
                {isCurrentUser && (
                  <Badge variant="outline" className="text-xs">You</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <Badge
                variant="outline"
                className={
                  user.role === "Admin"
                    ? "border-primary text-primary bg-primary/5"
                    : "border-muted-foreground text-muted-foreground"
                }
              >
                {user.role}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1 flex items-center justify-end gap-1">
                <Calendar className="h-3 w-3" />
                {format(parseISO(user.createdAt), "MMM d, yyyy")}
              </p>
            </div>

            {!isCurrentUser && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(user)}
                className="h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function StaffPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  // Get current user ID
  useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setCurrentUserId(parsed._id);
      } catch {
        // Invalid JSON
      }
    }
  });

  const { data: users, error, isLoading, mutate } = useSWR<User[]>("/users", fetcher);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "Staff",
    },
  });

  const selectedRole = watch("role");

  const openAddDialog = () => {
    reset({
      name: "",
      email: "",
      password: "",
      role: "Staff",
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      await createUser(data);
      toast.success("Staff member added", {
        description: `${data.name} has been added as ${data.role}.`,
      });
      mutate();
      setIsDialogOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Something went wrong"
        : "Something went wrong";
      toast.error("Failed to add staff", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    try {
      await deleteUser(selectedUser._id);
      toast.success("Staff member removed", {
        description: `${selectedUser.name} has been removed.`,
      });
      mutate();
      setIsDeleteDialogOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Something went wrong"
        : "Something went wrong";
      toast.error("Failed to remove staff", {
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const adminCount = users?.filter((u) => u.role === "Admin").length || 0;
  const staffCount = users?.filter((u) => u.role === "Staff").length || 0;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
        <p className="text-muted-foreground mt-1">Manage your pharmacy team</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admins</p>
              <p className="text-2xl font-bold text-foreground">{adminCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-muted">
              <Shield className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Staff</p>
              <p className="text-2xl font-bold text-foreground">{staffCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Button */}
      <div className="flex justify-end mb-6">
        <Button onClick={openAddDialog} className="rounded-xl gap-2">
          <UserPlus className="h-5 w-5" />
          Add Staff
        </Button>
      </div>

      {/* Staff List */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">Failed to load staff</p>
            <p className="text-muted-foreground mt-1">Please try refreshing the page</p>
          </CardContent>
        </Card>
      ) : users && users.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-8 text-center">
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground">No staff members</p>
            <p className="text-muted-foreground mt-1">Add your first team member to get started</p>
            <Button onClick={openAddDialog} className="mt-4 rounded-xl gap-2">
              <UserPlus className="h-5 w-5" />
              Add Staff
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {users?.map((user) => (
            <StaffCard
              key={user._id}
              user={user}
              onDelete={openDeleteDialog}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}

      {/* Add Staff Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
            <DialogDescription>
              Create a new account for your team member.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                className="rounded-xl"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@pharmacy.com"
                className="rounded-xl"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  className="rounded-xl pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(value: "Admin" | "Staff") => setValue("role", value)}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Staff">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Staff
                    </div>
                  </SelectItem>
                  <SelectItem value="Admin">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Staff"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{selectedUser?.name}</strong>? They will no
              longer be able to access the system.
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
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
