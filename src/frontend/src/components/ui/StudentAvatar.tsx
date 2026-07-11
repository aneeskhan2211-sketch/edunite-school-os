import { cn } from "@/lib/utils";

interface StudentAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

const colorMap = [
  "bg-rose-500 text-white",
  "bg-orange-500 text-white",
  "bg-amber-500 text-white",
  "bg-emerald-500 text-white",
  "bg-sky-500 text-white",
  "bg-indigo-500 text-white",
  "bg-violet-500 text-white",
  "bg-fuchsia-500 text-white",
];

function getInitials(name: string): string {
  const safeName = name ?? "";
  const parts = safeName.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? "").toUpperCase();
  return (
    (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")
  ).toUpperCase();
}

function getColor(name: string): string {
  const safeName = name ?? "";
  const code = safeName.charCodeAt(0) || 0;
  return colorMap[code % colorMap.length];
}

export function StudentAvatar({
  name,
  size = "md",
  className,
}: StudentAvatarProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold",
        sizeMap[size],
        getColor(name),
        className,
      )}
      data-ocid="student.avatar"
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
