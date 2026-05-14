import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string;
  className?: string;
}

export function Avatar({ name, src, className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return <img src={src} alt={name} className={cn("h-10 w-10 rounded-full object-cover", className)} />;
  }

  return (
    <div className={cn("grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-sm font-bold text-slate-700", className)}>
      {initials}
    </div>
  );
}
