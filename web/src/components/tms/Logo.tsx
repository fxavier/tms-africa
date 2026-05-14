import { Truck } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-950 text-white shadow-soft">
        <Truck className="h-6 w-6" />
      </div>
      {!compact && <span className="text-3xl font-black tracking-tight text-slate-950">LogiTrack Pro</span>}
    </div>
  );
}
