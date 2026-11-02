import type { Category } from "./types";

const PALETTE = ["var(--pink)", "var(--cyan)", "var(--lemon)", "var(--mint)", "var(--lilac)"];

/** Her kategoriye sırasına göre sabit bir şeker rengi verir. */
export function catColor(c: Pick<Category, "position" | "id"> | null | undefined): string {
  if (!c) return "var(--pink)";
  const i = Math.abs(c.position || c.id) % PALETTE.length;
  return PALETTE[i];
}

/** CSS değişkenleri için tip güvenli style nesnesi: style={vars({ "--c": "red" })} */
export function vars(v: Record<string, string | number>): import("react").CSSProperties {
  return v as unknown as import("react").CSSProperties;
}
