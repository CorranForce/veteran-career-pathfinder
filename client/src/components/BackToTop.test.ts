import { describe, expect, it } from "vitest";
import { BACK_TO_TOP_SCROLL_THRESHOLD, shouldShowBackToTop } from "./BackToTop";

describe("shouldShowBackToTop", () => {
  it("keeps the control hidden before the scroll threshold", () => {
    expect(shouldShowBackToTop(BACK_TO_TOP_SCROLL_THRESHOLD - 1)).toBe(false);
  });

  it("shows the control at and beyond the scroll threshold", () => {
    expect(shouldShowBackToTop(BACK_TO_TOP_SCROLL_THRESHOLD)).toBe(true);
    expect(shouldShowBackToTop(BACK_TO_TOP_SCROLL_THRESHOLD + 800)).toBe(true);
  });
});
