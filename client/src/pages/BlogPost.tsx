import { Link, useParams } from "wouter";
import { blogPosts } from "@/data/blogPosts";
import { Calendar, Clock, ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Streamdown } from "streamdown";
import { StructuredData } from "@/components/StructuredData";

export default function BlogPost() {
  const params = useParams();
  const slug = params.slug;
  
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* SEO: BlogPosting structured data */}
      <StructuredData
        type="BlogPosting"
        headline={post.title}
        description={post.description}
        author={post.author}
        datePublished={post.publishDate}
        dateModified={post.publishDate}
        image={post.image}
        url={`https://vetcarepath-tzppwpga.manus.space/blog/${post.slug}`}
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
          <Badge className="mb-4">{post.category}</Badge>
          <h1 className="text-5xl font-bold mb-6">{post.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{post.description}</p>
          
          <div className="flex items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{new Date(post.publishDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>{post.readTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-16">
        <div className="container mx-auto max-w-4xl prose prose-lg dark:prose-invert">
          <Streamdown>{post.content}</Streamdown>
        </div>
      </article>

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
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">More Career Resources</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {blogPosts
              .filter(p => p.slug !== slug)
              .slice(0, 2)
              .map((relatedPost) => (
                <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`}>
                  <div className="p-6 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer bg-card">
                    <Badge className="mb-2">{relatedPost.category}</Badge>
                    <h3 className="text-xl font-bold mb-2">{relatedPost.title}</h3>
                    <p className="text-muted-foreground mb-4">{relatedPost.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{relatedPost.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2026 Pathfinder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
