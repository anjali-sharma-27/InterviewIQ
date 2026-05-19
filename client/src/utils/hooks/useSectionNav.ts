import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { scrollToSection } from "@/utils/scrollToSection";

export type SectionNavState = { scrollTo?: string };

export function useSectionNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const goToSection = useCallback(
    (path: string, sectionId?: string) => {
      if (location.pathname === path) {
        if (sectionId) {
          scrollToSection(sectionId);
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      navigate(path, {
        state: sectionId ? { scrollTo: sectionId } satisfies SectionNavState : undefined,
      });
    },
    [location.pathname, navigate]
  );

  return goToSection;
}
