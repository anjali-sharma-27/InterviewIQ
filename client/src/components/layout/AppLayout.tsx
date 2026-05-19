import type { ReactNode } from "react";
import Navbar, { type NavbarVariant } from "@/components/Navbar";
import Footer from "@/components/layout/Footer";
import { cn } from "@/utils/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  variant?: NavbarVariant;
  showFooter?: boolean;
  className?: string;
  mainClassName?: string;
}

export default function AppLayout({
  children,
  variant = "app",
  showFooter = true,
  className,
  mainClassName,
}: AppLayoutProps) {
  const padded = variant !== "minimal";

  return (
    <div className={cn("min-h-screen bg-zinc-950 text-zinc-100", className)}>
      <Navbar variant={variant} />
      <main
        className={cn(
          padded && "pt-24 md:pt-28",
          mainClassName
        )}
      >
        {children}
      </main>
      {showFooter && variant !== "minimal" && <Footer />}
    </div>
  );
}
