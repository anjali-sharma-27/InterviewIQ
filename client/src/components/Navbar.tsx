import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu, User, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/components/Notifications/NotificationContext";
import { cn } from "@/utils/lib/utils";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";
import { useActiveSection } from "@/utils/hooks/useActiveSection";
import { useSectionNav } from "@/utils/hooks/useSectionNav";

export type NavbarVariant = "public" | "app" | "minimal";

interface NavbarProps {
  variant?: NavbarVariant;
}

type NavItem = {
  label: string;
  path: string;
  sectionId?: string;
};

const publicLinks: NavItem[] = [
  { label: "Features", path: "/", sectionId: "features" },
  { label: "How it works", path: "/", sectionId: "how-it-works" },
];

const appLinks: NavItem[] = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Templates", path: "/dashboard", sectionId: "templates" },
  { label: "History", path: "/dashboard", sectionId: "history" },
];

const emeraldBtnClass =
  "btn-emerald-action bg-emerald-500 text-white hover:bg-emerald-600";

function NavLink({
  to,
  label,
  active,
  onClick,
}: {
  to: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-emerald-500/15 text-emerald-300"
          : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
      )}
      onClick={onClick}
    >
      {label}
    </Link>
  );
}

function SectionNavLink({
  item,
  active,
  onNavigate,
  fullWidth,
}: {
  item: NavItem;
  active?: boolean;
  onNavigate?: () => void;
  fullWidth?: boolean;
}) {
  const goToSection = useSectionNav();

  return (
    <button
      type="button"
      onClick={() => {
        goToSection(item.path, item.sectionId);
        onNavigate?.();
      }}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        fullWidth && "w-full text-left",
        active
          ? "bg-emerald-500/15 text-emerald-300"
          : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
      )}
    >
      {item.label}
    </button>
  );
}

function isNavItemActive(
  item: NavItem,
  pathname: string,
  activeSectionId: string | null
): boolean {
  if (pathname !== item.path) return false;
  if (item.sectionId) {
    return activeSectionId === item.sectionId;
  }
  return !activeSectionId;
}

export default function Navbar({ variant = "app" }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      addNotification({
        id: Date.now().toString(),
        type: "success",
        message: "Logged out successfully",
      });
    } catch {
      addNotification({
        id: Date.now().toString(),
        type: "error",
        message: "Logout failed",
      });
    }
  };

  if (variant === "minimal") {
    return (
      <header className="fixed inset-x-0 top-0 z-30 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/dashboard" className="text-lg">
            <BrandLogo />
          </Link>
          <Button
            size="sm"
            className={emeraldBtnClass}
            onClick={() => navigate("/dashboard")}
          >
            Exit to dashboard
          </Button>
        </div>
      </header>
    );
  }

  const showAppNav = variant === "app" && isAuthenticated;
  const showPublicNav = variant === "public";
  const navLinks = showAppNav ? appLinks : showPublicNav ? publicLinks : [];
  const sectionIds = navLinks
    .map((item) => item.sectionId)
    .filter((id): id is string => Boolean(id));
  const activeSectionId = useActiveSection(sectionIds);

  return (
    <header className="fixed inset-x-0 top-0 z-30 px-4 pt-4 md:px-6">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur-md">
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          className="text-lg"
          onClick={() => setMobileOpen(false)}
        >
          <BrandLogo />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((item) => (
            <SectionNavLink
              key={item.label}
              item={item}
              active={isNavItemActive(item, location.pathname, activeSectionId)}
            />
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {showAppNav ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
              >
                <User className="h-5 w-5 text-emerald-400" />
                <span className="max-w-[120px] truncate">
                  {user?.name?.split(" ")[0] ?? "Profile"}
                </span>
              </Link>
              <Button
                size="sm"
                className={emeraldBtnClass}
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
                onClick={() => navigate("/login")}
              >
                Log in
              </Button>
              <Button
                size="sm"
                className={emeraldBtnClass}
                onClick={() =>
                  navigate(isAuthenticated ? "/dashboard" : "/signup")
                }
              >
                {isAuthenticated ? "Dashboard" : "Get started"}
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-zinc-800 bg-zinc-900 p-4 md:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((item) => (
              <SectionNavLink
                key={item.label}
                item={item}
                fullWidth
                active={isNavItemActive(item, location.pathname, activeSectionId)}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
            {showAppNav ? (
              <>
                <NavLink
                  to="/profile"
                  label="Profile"
                  onClick={() => setMobileOpen(false)}
                />
                <Button
                  size="sm"
                  className={cn("mt-2 w-full", emeraldBtnClass)}
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="mt-2 flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full border-zinc-700"
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/login");
                  }}
                >
                  Log in
                </Button>
                <Button
                  className={cn("w-full", emeraldBtnClass)}
                  onClick={() => {
                    setMobileOpen(false);
                    navigate("/signup");
                  }}
                >
                  Get started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
