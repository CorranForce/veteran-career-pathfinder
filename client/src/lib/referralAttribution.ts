const REFERRAL_STORAGE_KEY = "pathfinder_referral_code";
const REFERRAL_CODE_PATTERN = /^VET-[A-Z0-9]{6}$/;

export function normalizeReferralCode(value: string | null | undefined) {
  const code = value?.trim().toUpperCase();
  return code && REFERRAL_CODE_PATTERN.test(code) ? code : null;
}

export function captureReferralCodeFromSearch(search: string) {
  const code = normalizeReferralCode(new URLSearchParams(search).get("ref"));
  if (code) {
    window.localStorage.setItem(REFERRAL_STORAGE_KEY, code);
  }
  return code;
}

export function getStoredReferralCode() {
  return normalizeReferralCode(window.localStorage.getItem(REFERRAL_STORAGE_KEY));
}
