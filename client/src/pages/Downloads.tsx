import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { FileDown, Lock, Loader2, Download } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";

export default function Downloads() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  const downloadsQuery = trpc.payment.getUserDownloads.useQuery(
    { userId: user?.id || 0 },
    { enabled: isAuthenticated && !!user?.id }
  );

  if (authLoading || downloadsQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Lock className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Sign In Required</h1>
        <p className="text-muted-foreground">Please sign in to access your downloads</p>
        <Button asChild>
          <a href={getLoginUrl()}>Sign In</a>
        </Button>
      </div>
    );
  }

  const downloads = downloadsQuery.data || [];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <FileDown className="h-6 w-6 text-primary" />
            <a href="/" className="font-bold text-xl">
              Pathfinder
            </a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <a href="/">Home</a>
            </Button>
            <Button variant="outline">Profile</Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-20">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">Your Downloads</h1>
              <p className="text-xl text-muted-foreground">
                Access your purchased Pathfinder resources
              </p>
            </div>

            {downloads.length === 0 ? (
              <Card className="border-2">
                <CardContent className="pt-12 pb-12 text-center space-y-4">
                  <FileDown className="h-16 w-16 text-muted-foreground mx-auto" />
                  <h2 className="text-2xl font-bold">No Downloads Yet</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    You haven't purchased any resources yet. Explore our pricing plans to get
                    started with your career transition.
                  </p>
                  <Button asChild>
                    <a href="/pricing">View Pricing</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {downloads.map((download: any) => (
                  <Card key={download.id} className="border-2 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl">
                            {download.productType === "premium_prompt"
                              ? "Premium Prompt Access"
                              : "Pro Membership"}
                          </CardTitle>
                          <CardDescription>
                            Purchased on {new Date(download.purchaseDate).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <Badge
                          className={
                            download.productType === "premium_prompt"
                              ? "bg-primary"
                              : "bg-accent"
                          }
                        >
                          {download.productType === "premium_prompt" ? "One-time" : "Monthly"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {download.promptPdfUrl && (
                          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileDown className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">Optimized Prompt PDF</p>
                                <p className="text-sm text-muted-foreground">
                                  Complete AI prompt for career transition
                                </p>
                              </div>
                            </div>
                            <Button size="sm" asChild>
                              <a href={download.promptPdfUrl} download>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </a>
                            </Button>
                          </div>
                        )}

                        {download.resumeTemplatePdfUrl && (
                          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileDown className="h-5 w-5 text-accent" />
                              <div>
                                <p className="font-medium">Resume Translation Template</p>
                                <p className="text-sm text-muted-foreground">
                                  Convert your military experience to civilian language
                                </p>
                              </div>
                            </div>
                            <Button size="sm" asChild>
                              <a href={download.resumeTemplatePdfUrl} download>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>

                      {download.productType === "pro_subscription" && (
                        <div className="mt-6 p-4 bg-accent/10 border border-accent rounded-lg">
                          <p className="font-medium text-accent mb-3">Pro Member Benefits</p>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>✓ Monthly live career transition webinars</li>
                            <li>✓ Private veteran community access</li>
                            <li>✓ Q&A sessions with career experts</li>
                            <li>✓ Job posting board & networking</li>
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {downloads.length > 0 && (
              <Card className="border-2 bg-muted/50">
                <CardHeader>
                  <CardTitle>Need More Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    If you have questions about using your resources or need additional support,
                    please reach out to our team.
                  </p>
                  <Button variant="outline">Contact Support</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
