import { Link } from "react-router-dom";
import { APP_NAME, APP_TAGLINE } from "@/constants/brand";
import { useSectionNav } from "@/utils/hooks/useSectionNav";

type FooterLink =
  | { label: string; path: string; sectionId?: string }
  | { label: string; href: string; external: true };

const footerLinks: FooterLink[] = [
  { label: "Home", path: "/" },
  { label: "Features", path: "/", sectionId: "features" },
  { label: "How it works", path: "/", sectionId: "how-it-works" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "History", path: "/dashboard", sectionId: "history" },
  { label: "Log in", path: "/login" },
  { label: "Sign up", path: "/signup" },
  {
    label: "GitHub",
    href: "https://github.com/Cleveridiot07",
    external: true,
  },
];

export default function Footer() {
  const goToSection = useSectionNav();

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 py-10">
      <div className="container mx-auto flex flex-col items-center gap-6 px-4 text-center text-sm text-zinc-500">
        <p className="text-base font-medium text-zinc-300">{APP_NAME}</p>
        <p className="max-w-md text-zinc-500">{APP_TAGLINE}</p>
        <nav
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
          aria-label="Footer"
        >
          {footerLinks.map((link) =>
            "external" in link ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-zinc-400 transition-colors hover:text-emerald-400"
              >
                {link.label}
              </a>
            ) : link.sectionId || link.path === "/" ? (
              <button
                key={link.label}
                type="button"
                onClick={() => goToSection(link.path, link.sectionId)}
                className="font-medium text-zinc-400 transition-colors hover:text-emerald-400"
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.label}
                to={link.path}
                className="font-medium text-zinc-400 transition-colors hover:text-emerald-400"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>
        <p className="text-xs text-zinc-600">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
