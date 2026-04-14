import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import {
  loginRateLimiter,
  signupRateLimiter,
  passwordResetRateLimiter,
} from "./rateLimiter";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Trust the first proxy hop (Manus reverse proxy / load balancer).
  // Required for express-rate-limit to correctly read X-Forwarded-For IPs
  // and for secure cookies to work in production behind HTTPS termination.
  app.set("trust proxy", 1);

  // Stripe webhook MUST be registered BEFORE express.json() to access raw body
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const { handleStripeWebhook } = await import("../stripeWebhook");
      return handleStripeWebhook(req, res);
    }
  );
  
  // SendGrid events webhook for email tracking
  app.post(
    "/api/sendgrid/events",
    express.json(),
    async (req, res) => {
      const { handleSendGridEvents } = await import("../sendgridEventsWebhook");
      return handleSendGridEvents(req, res);
    }
  );
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // ── Auth rate limiters ────────────────────────────────────────────────────
  // These must be registered BEFORE the tRPC middleware so they run first.
  // The URL pattern is /api/trpc/<routerName>.<procedureName>
  app.use("/api/trpc/emailAuth.login", loginRateLimiter);
  app.use("/api/trpc/emailAuth.signup", signupRateLimiter);
  app.use("/api/trpc/emailAuth.requestPasswordReset", passwordResetRateLimiter);
  app.use("/api/trpc/emailAuth.resetPassword", passwordResetRateLimiter);

  // Sitemap (before tRPC so it's served as XML, not JSON)
  app.get("/sitemap.xml", async (req, res) => {
    const { handleSitemap } = await import("../sitemap");
    return handleSitemap(req, res);
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    // Start Stripe heartbeat after server is up
    import("../stripeHeartbeat").then(({ startStripeHeartbeat }) => {
      startStripeHeartbeat();
    }).catch((err) => console.error("[Server] Failed to start Stripe heartbeat:", err));
    // Start Platform AI Agent (daily checks)
    import("../platformAgent").then(({ startPlatformAgent }) => {
      startPlatformAgent();
    }).catch((err) => console.error("[Server] Failed to start Platform Agent:", err));
  });
}

startServer().catch(console.error);
