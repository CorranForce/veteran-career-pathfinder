import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { paymentRouter } from "./routers/payment";
import { emailRouter } from "./routers/email";
import { marketingRouter } from "./routers/marketing";
import { profileRouter } from "./routers/profile";
import { accountRouter } from "./routers/account";
import { resumeRouter } from "./routers/resume";
import { analyticsRouter } from "./routers/analytics";
import { templatesRouter } from "./routers/templates";
import { adminRouter } from "./routers/admin";
import { emailAuthRouter } from "./routers/emailAuth";
import { googleAuthRouter } from "./routers/googleAuth";
import { authRouter } from "./routers/auth";
import { passwordResetRouter } from "./routers/passwordReset";
import { emailVerificationRouter } from "./routers/emailVerification";
import { accountSettingsRouter } from "./routers/accountSettings";
import { productManagementRouter } from "./routers/productManagement";
import { announcementsRouter } from "./routers/announcements";
import { blogSubscriptionRouter } from "./routers/blogSubscription";
import { stripeProductsRouter } from "./routers/stripeProducts";
import { notificationsRouter } from "./routers/notifications";
import { blogRouter } from "./routers/blog";
import { mosTranslatorRouter } from "./routers/mosTranslator";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  emailAuth: emailAuthRouter,
  googleAuth: googleAuthRouter,
  customAuth: authRouter,
  passwordReset: passwordResetRouter,
  emailVerification: emailVerificationRouter,
  accountSettings: accountSettingsRouter,

  payment: paymentRouter,
  email: emailRouter,
  marketing: marketingRouter,
  profile: profileRouter,
  account: accountRouter,
  resume: resumeRouter,
  analytics: analyticsRouter,
  templates: templatesRouter,
  admin: adminRouter,
  productManagement: productManagementRouter,
  announcements: announcementsRouter,
  blogSubscription: blogSubscriptionRouter,
  stripeProducts: stripeProductsRouter,
  notifications: notificationsRouter,
  blog: blogRouter,
  mosTranslator: mosTranslatorRouter,
});

export type AppRouter = typeof appRouter;
