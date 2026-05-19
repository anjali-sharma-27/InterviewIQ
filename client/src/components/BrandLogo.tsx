import { cn } from "@/utils/lib/utils";

interface BrandLogoProps {
  className?: string;
  accentClassName?: string;
}

export default function BrandLogo({
  className,
  accentClassName = "text-emerald-400",
}: BrandLogoProps) {
  return (
    <span className={cn("font-bold tracking-tight text-white", className)}>
      Interview <span className={accentClassName}>IQ</span>
    </span>
  );
}
