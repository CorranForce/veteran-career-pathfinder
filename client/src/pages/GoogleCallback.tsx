/**
 * GoogleCallback.tsx
 *
 * This page is the registered redirect URI for Google OAuth
 * (e.g. /auth/google/callback?code=...).
 *
 * The server now handles this route directly via an Express GET handler
 * (server/googleOAuthCallback.ts) which:
 *   1. Exchanges the code for tokens with Google
 *   2. Creates / updates the user record
 *   3. Sets the httpOnly session cookie in the navigation response
 *   4. Redirects the browser to /tools
 *
 * Because the server intercepts /auth/google/callback before Vite/static
 * serving, this React component will only be rendered if the server-side
 * handler is not available (e.g. during local dev without the server, or
 * if there is an error before the redirect). It shows a loading indicator
 * while the server processes the request.
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function GoogleCallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/30 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Completing Sign In</CardTitle>
          <CardDescription>
            Please wait while we complete your authentication...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    </div>
  );
}
