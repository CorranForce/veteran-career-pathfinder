import { PageFooter } from "@/components/PageFooter";
import { Link, useParams } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Calendar, Clock, ArrowLeft, User, Loader2, BookOpen, Share2, Linkedin, Twitter, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Streamdown } from "streamdown";
import { StructuredData } from "@/components/StructuredData";
import { PostSEO } from "@/components/PostSEO";

/** Estimate read time from content length (~200 wpm) */
function estimateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

export default function BlogPost() {
  const params = useParams();
  const slug = params.slug ?? "";

  const { data: post, isLoading, error } = trpc.blog.getBySlug.useQuery(
    { slug },
    { enabled: slug.length > 0 }
  );

  // Fetch related posts (all published, then filter client-side)
  const { data: allPosts } = trpc.blog.getPublished.useQuery({ limit: 50 });
  const relatedPosts = allPosts?.filter((p) => p.slug !== slug).slice(0, 2) ?? [];

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Not found / error ─────────────────────────────────────────────────────
  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <h1 className="text-4xl font-bold mb-2">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This article may have been moved or removed.
          </p>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://pathfinder.casa";
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const seoTitle = post.metaTitle ?? `${post.title} | Pathfinder`;
  const seoDescription = post.metaDescription ?? post.excerpt;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Per-post HTML meta tags: title, description, canonical, OG, Twitter Card */}
      <PostSEO
        title={seoTitle}
        description={seoDescription}
        url={postUrl}
        image={post.coverImageUrl}
        publishedAt={post.publishedAt}
        authorName={post.authorName}
      />

      {/* SEO: BlogPosting structured data (JSON-LD) */}
      <StructuredData
        type="BlogPosting"
        headline={seoTitle}
        description={seoDescription}
        author={post.authorName}
        datePublished={post.publishedAt ? post.publishedAt.toISOString() : post.createdAt.toISOString()}
        dateModified={post.updatedAt.toISOString()}
        image={post.coverImageUrl ?? undefined}
        url={postUrl}
      />

      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16">
          <Link href="/">
            <span className="flex items-center gap-2 cursor-pointer">
              <span className="font-bold text-xl">Pathfinder</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/blog">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Article Header */}
      <section className="py-16 bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-5xl font-bold mb-6">{post.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>

          <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span>{post.authorName}</span>
            </div>
            {post.publishedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{estimateReadTime(post.content)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cover image (if present) */}
      {post.coverImageUrl && (
        <div className="container mx-auto max-w-4xl px-4">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full rounded-xl shadow-lg max-h-96 object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <article className="py-16 flex-1">
        <div className="container mx-auto max-w-4xl prose prose-lg dark:prose-invert">
          <Streamdown>{post.content}</Streamdown>
        </div>
      </article>

      {/* Social Sharing */}
      <section className="py-10 border-t">
        <div className="container mx-auto max-w-4xl">
          <SocialShare title={post.title} url={postUrl} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold mb-4">Ready to Accelerate Your Transition?</h2>
          <p className="text-xl mb-8 opacity-90">
            Get personalized career paths, resume templates, and step-by-step guidance tailored to your MOS
          </p>
          <Link href="/pricing">
            <Button size="lg" variant="secondary">
              Get Premium Access
            </Button>
          </Link>
        </div>
      </section>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold mb-8">More Career Resources</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`}>
                  <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer bg-card">
                    <h3 className="text-xl font-bold mb-2">{relatedPost.title}</h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{relatedPost.excerpt}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{estimateReadTime(relatedPost.content)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <PageFooter />
    </div>
  );
}

/** Social sharing row — LinkedIn, X/Twitter, and copy-link */
function SocialShare({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Share2 className="h-4 w-4" />
        <span className="text-sm font-medium">Share this article</span>
      </div>
      <div className="flex items-center gap-2">
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on LinkedIn"
        >
          <Button variant="outline" size="sm" className="gap-2">
            <Linkedin className="h-4 w-4 text-[#0A66C2]" />
            LinkedIn
          </Button>
        </a>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on X (Twitter)"
        >
          <Button variant="outline" size="sm" className="gap-2">
            <Twitter className="h-4 w-4" />
            X / Twitter
          </Button>
        </a>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleCopy}
          aria-label="Copy link to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              Copy Link
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
