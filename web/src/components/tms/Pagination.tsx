import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({ total = "124", current = "1" }: { total?: string; current?: string }) {
  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
      <span>A mostrar 1-10 de <b className="text-slate-900">{total}</b> registos</span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
        <Button size="icon" className="h-9 w-9">{current}</Button>
        <Button variant="outline" size="icon" className="h-9 w-9">2</Button>
        <Button variant="outline" size="icon" className="h-9 w-9">3</Button>
        <span className="px-1">...</span>
        <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
