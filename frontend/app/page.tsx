"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pill, Loader2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(user);
      if (parsedUser.role === "Admin") {
        router.push("/dashboard");
      } else {
        router.push("/pos");
      }
    } catch {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative">
          <div className="h-16 w-16 flex items-center justify-center rounded-full bg-primary/10">
            <Pill className="h-8 w-8 text-primary" />
          </div>
          <Loader2 className="absolute -bottom-1 -right-1 h-6 w-6 text-primary animate-spin" />
        </div>
        <p className="text-muted-foreground">Loading PharmaCare...</p>
      </div>
    </div>
  );
}
