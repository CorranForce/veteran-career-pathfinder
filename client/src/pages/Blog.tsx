import { PageFooter } from "@/components/PageFooter";
import { Link } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Calendar, Clock, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/** Estimate read time from content length (~200 wpm) */
function estimateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

export default function Blog() {
  const { data: posts, isLoading, error } = trpc.blog.getPublished.useQuery({ limit: 50 });

  // Set page-level SEO meta tags
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Career Resources & Guides | Pathfinder";

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
      el.setAttribute("content", content);
      return el;
    };
    const setOg = (property: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute("property", property); document.head.appendChild(el); }
      el.setAttribute("content", content);
      return el;
    };

    const desc = setMeta("description", "Career guides, MOS translation tips, certification roadmaps, and transition strategies for military veterans entering the civilian workforce.");
    const kw = setMeta("keywords", "veteran career blog, military to civilian guide, MOS translation tips, veteran job search, military career resources");
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', 'https://pathfinder.casa/blog');
    const ogTitle = setOg("og:title", "Career Resources & Guides | Pathfinder");
    const ogDesc = setOg("og:description", "Career guides, MOS translation tips, certification roadmaps, and transition strategies written specifically for military veterans.");
    const ogType = setOg("og:type", "website");

    return () => {
      document.title = prevTitle;
      [desc, ogTitle, ogDesc, ogType].forEach((el) => { if (el?.parentNode === document.head) document.head.removeChild(el); });
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16">
          <Link href="/">
            <span className="flex items-center gap-2 cursor-pointer">
              <span className="font-bold text-xl">Pathfinder</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost">Pricing</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto text-center">
          <Badge className="mb-4">Career Resources</Badge>
          <h1 className="text-5xl font-bold mb-4">Veteran Career Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Expert guidance, career tips, and transition strategies to help veterans succeed in civilian careers.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 flex-1">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <span>Loading articles…</span>
            </div>
          ) : error ? (
            <div className="text-center py-24 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Unable to load articles right now.</p>
              <p className="text-sm mt-1">Please try again later.</p>
            </div>
          ) : !posts || posts.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No articles published yet.</p>
              <p className="text-sm mt-1">Check back soon — new career resources are on the way.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Card key={post.slug} className="flex flex-col hover:shadow-lg transition-shadow">
                  {/* Cover image or gradient placeholder */}
                  {post.coverImageUrl ? (
                    <div className="h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-primary/40" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl leading-snug">{post.title}</CardTitle>
                    <CardDescription className="text-base line-clamp-3">{post.excerpt}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      {post.publishedAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{estimateReadTime(post.content)}</span>
                      </div>
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <Button className="w-full">
                        Read Article <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Transition?</h2>
          <p className="text-xl mb-8 opacity-90">
            Get personalized career guidance powered by AI
          </p>
          <Link href="/pricing">
            <Button size="lg" variant="secondary">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      <PageFooter />
    </div>
  );
}
