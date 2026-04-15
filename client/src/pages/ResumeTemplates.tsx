import { trpc } from "@/lib/trpc";
import { AuthenticatedNav } from "@/components/AuthenticatedNav";
import { PageFooter } from "@/components/PageFooter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, FileText, CheckCircle2, Compass } from "lucide-react";
import { toast } from "sonner";

export default function ResumeTemplates() {
  const { isAuthenticated } = useAuth();
  const { data: templates, isLoading } = trpc.templates.getAllTemplates.useQuery();
  const trackDownload = trpc.templates.trackDownload.useMutation();

  const handleDownload = async (templateId: number, fileUrl: string, fileName: string) => {
    try {
      // Track the download
      await trackDownload.mutateAsync({ templateId });

      // Open the file URL in a new tab
      window.open(fileUrl, "_blank");
      toast.success("Template download started!");
    } catch (error) {
      toast.error("Failed to download template");
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      IT: "bg-blue-500",
      Management: "bg-purple-500",
      Technical: "bg-green-500",
      General: "bg-gray-500",
    };
    return colors[category] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {isAuthenticated ? <AuthenticatedNav /> : (
        <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto flex items-center justify-between h-16 px-4">
            <a href="/" className="flex items-center gap-2">
              <Compass className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Pathfinder</span>
            </a>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <a href="/">Home</a>
              </Button>
              <Button variant="ghost" asChild>
                <a href="/pricing">Pricing</a>
              </Button>
              <Button asChild>
                <a href="/tools">Dashboard</a>
              </Button>
            </div>
          </div>
        </nav>
      )}

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
        <div className="container mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">ATS-Optimized Resume Templates</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Download professionally designed resume templates specifically crafted for military veterans transitioning to civilian careers
          </p>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="py-16">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : templates && templates.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template: any) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  {template.thumbnailUrl && (
                    <div className="aspect-[4/3] overflow-hidden rounded-t-lg bg-muted">
                      <img
                        src={template.thumbnailUrl}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Download className="h-4 w-4" />
                        <span>{template.downloadCount} downloads</span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Features:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            <span>ATS-friendly formatting</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            <span>Military-to-civilian language</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                            <span>Optimized for {template.category} roles</span>
                          </li>
                        </ul>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() =>
                          handleDownload(template.id, template.fileUrl, template.name)
                        }
                        disabled={trackDownload.isPending}
                      >
                        {trackDownload.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download Template
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-xl text-muted-foreground">No templates available yet</p>
              <p className="text-sm text-muted-foreground mt-2">Check back soon for new templates!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Need Help With Your Resume?</h2>
          <p className="text-lg max-w-2xl mx-auto opacity-90">
            Upload your resume to our AI-powered analyzer for personalized ATS recommendations and career transition guidance
          </p>
          <Button size="lg" variant="secondary" asChild>
            <a href="/tools">Get AI Resume Analysis</a>
          </Button>
        </div>
      </section>
      <PageFooter />
    </div>
  );
}
