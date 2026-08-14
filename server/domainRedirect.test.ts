import { describe, expect, it } from "vitest";
import {
  getLegacyDomainRedirectUrl,
  PRIMARY_MANUS_ORIGIN,
} from "./domainRedirect";

describe("getLegacyDomainRedirectUrl", () => {
  it("returns a permanent redirect target for legacy-domain page requests", () => {
    expect(
      getLegacyDomainRedirectUrl({
        host: "vetcarepath-tzppwpga.manus.space",
        method: "GET",
        originalUrl: "/pricing?source=legacy",
      })
    ).toBe(`${PRIMARY_MANUS_ORIGIN}/pricing?source=legacy`);
  });

  it("accepts a host header containing a port", () => {
    expect(
      getLegacyDomainRedirectUrl({
        host: "vetcarepath-tzppwpga.manus.space:443",
        method: "HEAD",
        originalUrl: "/",
      })
    ).toBe(`${PRIMARY_MANUS_ORIGIN}/`);
  });

  it("does not redirect requests from the new primary domain", () => {
    expect(
      getLegacyDomainRedirectUrl({
        host: "transition-pathfinder.manus.space",
        method: "GET",
        originalUrl: "/pricing",
      })
    ).toBeNull();
  });

  it("does not redirect API requests, protecting payment and email webhooks", () => {
    expect(
      getLegacyDomainRedirectUrl({
        host: "vetcarepath-tzppwpga.manus.space",
        method: "POST",
        originalUrl: "/api/stripe/webhook",
      })
    ).toBeNull();
  });

  it("does not redirect non-navigation requests", () => {
    expect(
      getLegacyDomainRedirectUrl({
        host: "vetcarepath-tzppwpga.manus.space",
        method: "POST",
        originalUrl: "/contact",
      })
    ).toBeNull();
  });
});
