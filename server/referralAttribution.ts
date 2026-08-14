import {
  getReferralCodeBySlug,
  incrementReferralSignup,
} from "./db-referral";

export async function recordReferralSignup(input: {
  referralCode?: string;
  newUserId: number;
}) {
  const code = input.referralCode?.trim().toUpperCase();
  if (!code) return { tracked: false, reason: "missing_code" as const };

  const referral = await getReferralCodeBySlug(code);
  if (!referral || !referral.isActive) {
    return { tracked: false, reason: "invalid_code" as const };
  }

  if (referral.userId === input.newUserId) {
    return { tracked: false, reason: "self_referral" as const };
  }

  await incrementReferralSignup(referral.id);
  return { tracked: true, referralCodeId: referral.id };
}
