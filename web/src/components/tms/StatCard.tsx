import type { LucideIcon } from "lucide-react";
import type { StatusVariant } from "@/types/status";
import { cn } from "@/lib/utils";

const iconStyles: Record<StatusVariant, string> = {
  success: "bg-green-100 text-green-600",
  warning: "bg-orange-100 text-orange-600",
  danger: "bg-red-100 text-red-600",
  info: "bg-blue-100 text-blue-600",
  secondary: "bg-slate-100 text-slate-700",
  default: "bg-slate-900 text-white",
};

export function StatCard({ label, value, hint, icon: Icon, variant = "secondary" }: { label: string; value: string; hint?: string; icon: LucideIcon; variant?: StatusVariant }) {
  return (
    <div className={cn("kpi-card", variant === "danger" && "border-red-200")}> 
      <div className="flex items-start justify-between gap-4">
        <div className={cn("grid h-10 w-10 place-items-center rounded-xl", iconStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
        {hint && <span className={cn("text-xs font-bold", variant === "danger" ? "text-red-600" : variant === "success" ? "text-green-600" : "text-slate-500")}>{hint}</span>}
      </div>
      <div className="mt-5 text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-3xl font-black tracking-tight text-slate-950">{value}</div>
    </div>
  );
}
