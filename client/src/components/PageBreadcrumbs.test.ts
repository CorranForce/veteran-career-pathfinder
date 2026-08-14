import { describe, expect, it } from "vitest";
import { buildBreadcrumbTrail } from "./PageBreadcrumbs";

describe("buildBreadcrumbTrail", () => {
  it("creates a home-to-current-page trail", () => {
    expect(buildBreadcrumbTrail("Privacy Policy")).toEqual([
      { label: "Home", href: "/" },
      { label: "Privacy Policy" },
    ]);
  });

  it("includes an optional parent page for detail routes", () => {
    expect(buildBreadcrumbTrail("Article title", { label: "Blog", href: "/blog" })).toEqual([
      { label: "Home", href: "/" },
      { label: "Blog", href: "/blog" },
      { label: "Article title" },
    ]);
  });
});
