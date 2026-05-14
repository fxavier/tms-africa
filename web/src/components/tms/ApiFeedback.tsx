"use client";

import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingState({ label = "A carregar dados do backend..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-600">
      <Loader2 className="h-5 w-5 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({ message, unauthorized = false }: { message: string; unauthorized?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
      <span className="flex items-center gap-3 font-semibold">
        <AlertTriangle className="h-5 w-5" />
        {message}
      </span>
      {unauthorized && (
        <Button asChild variant="outline" className="border-red-200 bg-white text-red-700 hover:bg-red-100">
          <Link href="/login">Entrar</Link>
        </Button>
      )}
    </div>
  );
}
