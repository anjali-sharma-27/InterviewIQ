export function scrollToSection(
  sectionId: string,
  behavior: ScrollBehavior = "smooth"
) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior, block: "start" });
  }
}
