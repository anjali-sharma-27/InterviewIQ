import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { scrollToSection } from "@/utils/scrollToSection";
import type { SectionNavState } from "@/utils/hooks/useSectionNav";

/** Scrolls to a section passed via navigation state (no hash in the URL). */
export function useScrollToSectionOnLoad() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const scrollTo = (location.state as SectionNavState | null)?.scrollTo;
    if (!scrollTo) return;

    const timer = window.setTimeout(() => {
      scrollToSection(scrollTo);
      navigate(location.pathname + location.search, {
        replace: true,
        state: null,
      });
    }, 80);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search, location.state, navigate]);
}
