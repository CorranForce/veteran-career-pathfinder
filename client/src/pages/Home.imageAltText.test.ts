import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const homePageSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

describe("home-page image alternative text", () => {
  it("keeps contextual, descriptive alternatives for all four editorial images", () => {
    expect(homePageSource).toContain(
      'alt="Veteran professional looking toward a civilian career opportunity from an office window"'
    );
    expect(homePageSource).toContain(
      'alt="Illustration of military experience translated into civilian workplace skills"'
    );
    expect(homePageSource).toContain(
      'alt="Career planning workspace for a veteran\'s civilian job search"'
    );
    expect(homePageSource).toContain(
      'alt="Veterans celebrating a successful civilian career transition"'
    );
  });
});
