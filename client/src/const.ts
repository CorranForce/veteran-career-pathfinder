export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Custom auth: redirect to local login/signup pages, NOT the Manus OAuth portal.
export const getLoginUrl = (_opts?: unknown) => "/login";
export const getSignupUrl = (_opts?: unknown) => "/signup";
