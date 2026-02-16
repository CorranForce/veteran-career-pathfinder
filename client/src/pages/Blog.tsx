import { Link } from "wouter";
import { blogPosts } from "@/data/blogPosts";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Blog() {
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
      <section className="py-20">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.slug} className="flex flex-col hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg" />
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                  <CardTitle className="text-2xl">{post.title}</CardTitle>
                  <CardDescription className="text-base">{post.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.publishDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime}</span>
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

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/30">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2026 Pathfinder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
