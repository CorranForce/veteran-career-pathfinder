import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db-referral", () => ({
  getReferralCodeBySlug: vi.fn(),
  incrementReferralSignup: vi.fn(),
}));

import {
  getReferralCodeBySlug,
  incrementReferralSignup,
} from "./db-referral";
import { recordReferralSignup } from "./referralAttribution";

const activeReferral = {
  id: 8,
  userId: 42,
  code: "VET-ABC123",
  isActive: true,
};

describe("recordReferralSignup", () => {
  beforeEach(() => vi.clearAllMocks());

  it("records a signup for a valid referral code", async () => {
    vi.mocked(getReferralCodeBySlug).mockResolvedValue(activeReferral as never);
    vi.mocked(incrementReferralSignup).mockResolvedValue(undefined);

    await expect(
      recordReferralSignup({ referralCode: "vet-abc123", newUserId: 99 })
    ).resolves.toEqual({ tracked: true, referralCodeId: 8 });

    expect(getReferralCodeBySlug).toHaveBeenCalledWith("VET-ABC123");
    expect(incrementReferralSignup).toHaveBeenCalledWith(8);
  });

  it("does not look up a missing referral code", async () => {
    await expect(recordReferralSignup({ newUserId: 99 })).resolves.toEqual({
      tracked: false,
      reason: "missing_code",
    });
    expect(getReferralCodeBySlug).not.toHaveBeenCalled();
  });

  it("does not record an unknown or inactive referral", async () => {
    vi.mocked(getReferralCodeBySlug).mockResolvedValue(null);

    await expect(
      recordReferralSignup({ referralCode: "VET-NOPE00", newUserId: 99 })
    ).resolves.toEqual({ tracked: false, reason: "invalid_code" });
    expect(incrementReferralSignup).not.toHaveBeenCalled();
  });

  it("prevents a self-referral from incrementing signup totals", async () => {
    vi.mocked(getReferralCodeBySlug).mockResolvedValue(activeReferral as never);

    await expect(
      recordReferralSignup({ referralCode: "VET-ABC123", newUserId: 42 })
    ).resolves.toEqual({ tracked: false, reason: "self_referral" });
    expect(incrementReferralSignup).not.toHaveBeenCalled();
  });
});
