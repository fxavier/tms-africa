import { Input } from "@/components/ui/input";

export function FormField({ label, required, placeholder, type = "text", value }: { label: string; required?: boolean; placeholder?: string; type?: string; value?: string }) {
  return (
    <label className="space-y-2 text-sm font-semibold text-slate-900">
      <span>{label} {required && <span className="text-red-500">*</span>}</span>
      <Input type={type} placeholder={placeholder} defaultValue={value} />
    </label>
  );
}
