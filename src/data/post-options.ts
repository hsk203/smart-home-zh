import { t } from "../i18n";
export const categoryNames = [
  "cross-region",
  "smart-switches",
  "standing-desks",
  "ergonomic-chairs",
  "desk-setup",
  "getting-started",
] as const;
export type Category = (typeof categoryNames)[number];
export const categoryLabel = (category: string) =>
  categoryNames.includes(category as Category)
    ? t(`category.${category as Category}`)
    : category;
// Preserve links and frontmatter written before language-independent IDs.
export function normalizeCategory(value: string): string {
  const legacy: Record<string, Category> = {};
  return (
    legacy[value] ??
    categoryNames.find((category) => categoryLabel(category) === value) ??
    value
  );
}
export const coverNames = [
  "tool",
  "astro",
  "vue",
  "css",
  "notes",
  "life",
  "typescript",
  "git",
  "design",
] as const;
