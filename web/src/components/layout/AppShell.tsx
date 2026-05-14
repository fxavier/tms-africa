"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { clearSession, isAuthenticated } from "@/lib/auth";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      clearSession();
      setAuthorized(false);
      router.replace("/login");
      return;
    }
    setAuthorized(true);
  }, [router]);

  if (authorized !== true) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Topbar />
      <main className="px-5 py-8 lg:ml-[260px] lg:px-10">{children}</main>
    </div>
  );
}
