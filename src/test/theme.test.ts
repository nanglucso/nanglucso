import { describe, expect, it } from "vitest";
import { isTheme, resolveTheme, THEME_KEY } from "@/lib/theme";

describe("theme setting", () => {
  it("keeps an explicit light/dark choice over the system setting", () => {
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("light", true)).toBe("light");
  });
  it("follows the system only when the choice is system", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
  it("accepts only the three stored values", () => {
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("light")).toBe(true);
    expect(isTheme("system")).toBe(true);
    expect(isTheme("blue")).toBe(false);
    expect(isTheme(null)).toBe(false);
  });
  it("uses a dedicated storage key", () => {
    expect(THEME_KEY).toBe("nls-ai-theme-v1");
  });
});
