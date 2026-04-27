"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import type { User } from "@/lib/types";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as User;
      setUser(parsedUser);

      // Check role-based access
      const adminOnlyPaths = ["/dashboard", "/staff"];
      if (parsedUser.role !== "Admin" && adminOnlyPaths.includes(pathname)) {
        router.push("/pos");
        return;
      }

      setIsLoading(false);
    } catch {
      router.push("/login");
    }
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
