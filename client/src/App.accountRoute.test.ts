import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

describe("account route compatibility", () => {
  it("redirects the legacy /account path to Account Settings", () => {
    expect(appSource).toContain('<Route path={"/account"}>');
    expect(appSource).toContain('<Redirect to="/account-settings" />');
  });

  it("keeps Account Settings available at its canonical route", () => {
    expect(appSource).toContain('<Route path={"/account-settings"} component={AccountSettings} />');
  });
});
