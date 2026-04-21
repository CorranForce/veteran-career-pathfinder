import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Helmet } from "react-helmet-async";
import EmailCaptureForm from "@/components/EmailCaptureForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Target, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Briefcase, 
  FileText, 
  TrendingUp,
  Shield,
  Compass,
  MapPin,
  HelpCircle,
  Mail,
  Bot,
  Cpu,
  Star,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import MobileNav from "@/components/MobileNav";
import { NotificationBell } from "@/components/NotificationBell";
import { getLoginUrl, getSignupUrl } from "@/const";
import Testimonials from "@/components/Testimonials";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import { SimpleContactButton } from "@/components/LiveChatWidget";
import { StructuredData } from "@/components/StructuredData";
import { AnnouncementsCard } from "@/components/AnnouncementsCard";
import { LandingAnnouncementBanner } from "@/components/LandingAnnouncementBanner";
import { ContentGate } from "@/components/ContentGate";
import { AboutCreatorSection } from "./AboutCreatorSection";

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const scrollToPrompt = () => {
    document.getElementById('prompt-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Set page title imperatively so SEO scanners that read document.title detect it
  useEffect(() => {
    document.title = "Pathfinder | Veteran Career Transition AI";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Pathfinder | Veteran Career Transition AI</title>
        <meta name="description" content="AI-powered career advisor for military veterans. Translate your MOS into civilian jobs, map transferable skills, and get a 30-day action plan." />
        <meta name="keywords" content="veteran career transition, military to civilian jobs, MOS translator, veteran employment, AI career advisor, military skills translation, veteran job search, military career change" />
        <meta property="og:title" content="Pathfinder | Veteran Career Transition AI" />
        <meta property="og:description" content="AI-powered career advisor for military veterans. Translate your MOS into civilian jobs, map transferable skills, and get a 30-day action plan." />
        <meta property="og:url" content="https://pathfinder.casa" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://pathfinder.casa" />
      </Helmet>
      {/* SEO: Organization structured data */}
      <StructuredData
        type="Organization"
        name="Pathfinder"
        url="https://vetcarepath-tzppwpga.manus.space"
        logo="https://vetcarepath-tzppwpga.manus.space/logo.png"
        description="AI-powered career transition platform helping military veterans translate their service into civilian careers with personalized job paths and skills mapping."
        sameAs={[
          // Add social media URLs when available
        ]}
      />
      {/* SEO: WebSite structured data with search */}
      <StructuredData
        type="WebSite"
        name="Pathfinder - Veteran Career Transition Strategist"
        url="https://vetcarepath-tzppwpga.manus.space"
        description="AI-powered tool helping veterans translate military service into civilian careers with personalized job paths and skills mapping."
        potentialAction={{
          type: 'SearchAction',
          target: 'https://vetcarepath-tzppwpga.manus.space/blog?q={search_term_string}',
          queryInput: 'required name=search_term_string',
        }}
      />
      {/* SEO: FAQPage structured data for rich snippets */}
      <StructuredData
        type="FAQPage"
        items={[
          {
            question: "What is an MOS, and do I need to know mine?",
            answer: "MOS stands for Military Occupational Specialty — it's the Army's code for your job role (e.g., 25U = Signal Support Systems Specialist, 11B = Infantryman). Every branch has an equivalent: the Navy uses NEC/Rating, the Air Force uses AFSC, the Marines use MOS, and the Coast Guard uses Rating. You don't need to know the exact code — just your job title and primary duties. Pathfinder understands all branch terminology and will translate your experience into civilian language regardless of how you describe it."
          },
          {
            question: "Does Pathfinder work for all military branches?",
            answer: "Yes — Pathfinder is designed for veterans and transitioning service members from all six branches: Army, Navy, Marine Corps, Air Force, Space Force, and Coast Guard. It also works for National Guard and Reserve members entering the civilian workforce. The AI understands branch-specific terminology, rank structures, and duty descriptions across all services."
          },
          {
            question: "How do I use the Pathfinder prompt?",
            answer: "It's a three-step process. First, copy the Pathfinder prompt from the section on the homepage. Second, open any AI assistant — ChatGPT, Claude, Gemini, or similar — and paste the prompt. Third, fill in your details where indicated: your branch, MOS/job title, rank, years of service, key duties, notable achievements, and what kind of work environment you prefer. The AI will respond with 3–4 concrete civilian career paths, a skills gap analysis, and a 30-day action plan tailored to your background."
          },
          {
            question: "What's included in Premium, and is it worth it?",
            answer: "The free tier gives you the core Pathfinder prompt — a powerful starting point. Pathfinder Premium adds the full suite of specialized prompts: a resume rewriter that converts military language to civilian bullet points, an interview prep module with likely questions for your target role, a LinkedIn profile optimizer, a salary negotiation script, and a networking outreach template for veteran-friendly employers."
          },
          {
            question: "Is there a free trial or money-back guarantee?",
            answer: "The core Pathfinder prompt is completely free — no credit card, no sign-up required. For Premium, you can create a free account and explore the platform before upgrading. If you upgrade and feel the content doesn't deliver value, reach out within 30 days for a full refund — no questions asked."
          },
          {
            question: "Which AI assistant should I use with the prompt?",
            answer: "The Pathfinder prompt is designed to work with any major AI assistant. ChatGPT (GPT-4o) and Claude (Sonnet or Opus) tend to produce the most detailed career path analyses. Google Gemini and Microsoft Copilot also work well. The free tiers of ChatGPT and Claude are sufficient for the core prompt."
          }
        ]}
      />
      <ExitIntentPopup />
      <SimpleContactButton />
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Pathfinder</span>
          </div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" onClick={scrollToPrompt}>View Prompt</Button>
            <Button variant="ghost" asChild>
              <a href="/pricing">Pricing</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="/mos-translator">MOS Translator</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="/blog">Blog</a>
            </Button>
            <Button variant="ghost" asChild>
              <a href="#faq">FAQ</a>
            </Button>
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <Button variant="ghost" asChild>
                  <a href="/profile">Profile</a>
                </Button>
                <Button asChild>
                  <a href="/tools">Dashboard</a>
                </Button>
                {user?.role === "platform_owner" && (
                  <Button variant="outline" asChild>
                    <a href="/admin/dashboard">Admin Dashboard</a>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <a href="/login">Login</a>
                </Button>
                <Button asChild>
                  <a href="/pricing">Get Started</a>
                </Button>
              </>
            )}
          </div>
          {/* Mobile Navigation */}
          <MobileNav onScrollToPrompt={scrollToPrompt} />
        </div>
      </nav>

      {/* Landing Page Announcement Banners */}
      <LandingAnnouncementBanner />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-background">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-accent text-accent-foreground">AI-Powered Career Transition</Badge>
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  Translate Your Service Into Your Next Mission
                </h1>
                <h2 className="text-xl font-semibold text-primary">
                  AI-Powered Veteran Career Transition &amp; Military-to-Civilian Job Pathfinder
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  An AI specialist designed to help military veterans navigate the civilian job market with confidence. 
                  Get clear career paths, actionable plans, and the clarity you deserve.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={scrollToPrompt} className="text-lg">
                  View the Prompt <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={scrollToPrompt}>
                  Learn More
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Veteran-Focused</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Action-Oriented</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663037092468/nMLVtQCUxVmNISWs.png" 
                  alt="Veteran professional looking toward future career" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold">You've Served. Now What?</h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Transitioning from military to civilian life is challenging. Veterans often struggle with questions like:
            </p>
            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <Card className="bg-card border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Lost in Translation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">"Nobody understands my MOS or what I actually did."</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Unclear Direction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">"I don't know what civilian jobs I qualify for."</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Communication Gap</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">"How do I talk about my experience without jargon?"</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Solution - How It Works */}
      <section className="py-20">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">How Pathfinder Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A structured AI prompt that transforms military experience into clear civilian career opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="relative overflow-hidden border-2 hover:shadow-lg transition-shadow">
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full flex items-start justify-end p-2">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Share Your Background</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Provide your MOS, branch, rank, duties, and achievements. The AI understands military structure.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:shadow-lg transition-shadow">
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full flex items-start justify-end p-2">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <CardHeader>
                <MapPin className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Get Career Paths</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Receive 3-4 concrete civilian career paths with job titles, salary ranges, and day-to-day descriptions.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:shadow-lg transition-shadow">
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full flex items-start justify-end p-2">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Understand Gaps</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Learn what skills you already have and what gaps to close with specific certifications or training.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 hover:shadow-lg transition-shadow">
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full flex items-start justify-end p-2">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <CardHeader>
                <CheckCircle2 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Take Action</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Follow a clear 30-day action plan with weekly milestones to start your civilian career journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663037092468/HLabsInJZVDtDwUX.png" 
                alt="Military to civilian skills translation" 
                className="rounded-2xl shadow-xl w-full"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">Built Specifically for Veterans</h2>
              <p className="text-lg text-muted-foreground">
                Pathfinder isn't generic career advice. It's a specialized AI prompt engineered to understand military structure, 
                translate experience into civilian terms, and provide actionable guidance.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Plain English Translation</h3>
                    <p className="text-muted-foreground">Converts military jargon into language civilian employers understand</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Honest Gap Analysis</h3>
                    <p className="text-muted-foreground">Shows what you already bring and what you need to learn</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg">Actionable 30-Day Plan</h3>
                    <p className="text-muted-foreground">Week-by-week checklist to start your transition immediately</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Examples */}
      <section className="py-20">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">What You'll Receive</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Clear, structured guidance designed to give you confidence and direction
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="overflow-hidden">
              <img 
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663037092468/vIfMQuTszYmWMpqj.png" 
                alt="Career planning workspace" 
                className="w-full h-64 object-cover"
              />
              <CardHeader>
                <CardTitle>Detailed Career Roadmaps</CardTitle>
                <CardDescription>
                  Each career path includes example job titles, transferable skills mapping, and realistic salary ranges
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden">
              <img 
                src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663037092468/JaDsvnmtKVMrkAOY.png" 
                alt="Successful veteran professionals" 
                className="w-full h-64 object-cover"
              />
              <CardHeader>
                <CardTitle>Strategic Recommendations</CardTitle>
                <CardDescription>
                  Get a personalized recommendation for which path to pursue first based on your unique background
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* The Prompt Section */}
      <section id="prompt-section" className="py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <Badge className="bg-accent text-accent-foreground text-sm">The Complete Prompt</Badge>
              <h2 className="text-4xl font-bold">AI Veteran Career Transition Strategist</h2>
              <p className="text-xl text-muted-foreground">
                Copy this optimized prompt and use it with any AI assistant (ChatGPT, Claude, Gemini, etc.)
              </p>
            </div>

            <ContentGate
              requiredTier="premium"
              lockTitle="Unlock the Full Pathfinder Prompt"
              lockDescription="Get the complete AI Veteran Career Transition Strategist prompt — the exact system used to translate military experience into civilian career paths."
              teaser={
                <Card className="border-2 shadow-xl">
                  <CardHeader>
                    <CardTitle>Pathfinder Prompt — Preview</CardTitle>
                    <CardDescription>
                      A comprehensive AI prompt designed to translate military experience into civilian career opportunities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 rounded-lg p-6 max-h-48 overflow-hidden relative">
                      <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
{promptText.slice(0, 600)}...
                      </pre>
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-muted/80 to-transparent" />
                    </div>
                  </CardContent>
                </Card>
              }
            >
              <Card className="border-2 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Pathfinder Prompt</CardTitle>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        navigator.clipboard.writeText(promptText);
                        alert('Prompt copied to clipboard!');
                      }}
                    >
                      Copy Prompt
                    </Button>
                  </div>
                  <CardDescription>
                    A comprehensive AI prompt designed to translate military experience into civilian career opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-6 max-h-96 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
{promptText}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button 
                  size="lg" 
                  onClick={() => {
                    navigator.clipboard.writeText(promptText);
                    alert('Prompt copied to clipboard!');
                  }}
                  className="text-lg"
                >
                  Copy Full Prompt <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </ContentGate>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* Email Capture Section */}
      <section className="py-20 bg-gradient-to-br from-secondary/50 to-background">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 shadow-xl">
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <Badge className="bg-accent text-accent-foreground">Free Resource</Badge>
                    <h2 className="text-3xl font-bold">Get Your Free Career Transition Checklist</h2>
                    <p className="text-muted-foreground">
                      Join our mailing list and receive a free guide with actionable steps to kickstart your civilian career. 
                      Plus, get exclusive tips and resources delivered to your inbox.
                    </p>
                    <div className="flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        <span>Military-to-civilian skill translation tips</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        <span>Weekly career transition strategies</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        <span>Exclusive veteran success stories</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <EmailCaptureForm 
                      source="homepage-cta"
                      placeholder="your.email@example.com"
                      buttonText="Send Me the Checklist"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      We respect your privacy. Unsubscribe anytime.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Roadmap & Changelog Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">Roadmap & Recent Updates</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what we're building and track our progress. Transparency matters.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Dynamic Announcements from Database */}
            <AnnouncementsCard />

            {/* Upcoming Features */}
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Coming Soon
                </CardTitle>
                <CardDescription>Features we're actively building</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div>
                      <p className="font-medium">Private Veteran Community</p>
                      <p className="text-sm text-muted-foreground">Forum for Premium members to connect, share experiences, and network</p>
                      <Badge variant="outline" className="mt-1">In Development</Badge>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div>
                      <p className="font-medium">Live Career Webinars</p>
                      <p className="text-sm text-muted-foreground">Monthly expert-led sessions on career transitions and job search strategies</p>
                      <Badge variant="outline" className="mt-1">Planned Q1 2026</Badge>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div>
                      <p className="font-medium">AI Resume Builder</p>
                      <p className="text-sm text-muted-foreground">Automatic military-to-civilian resume translation with ATS optimization</p>
                      <Badge variant="outline" className="mt-1">Planned Q2 2026</Badge>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div>
                      <p className="font-medium">Job Board & Matching</p>
                      <p className="text-sm text-muted-foreground">Curated veteran-friendly job postings with AI-powered matching</p>
                      <Badge variant="outline" className="mt-1">Planned Q2 2026</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground mb-4">
              Want to see detailed feature tracking and bug fixes?
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" asChild>
                <a href="https://github.com/yourusername/pathfinder/blob/main/FEATURES.md" target="_blank" rel="noopener noreferrer">
                  View Full Roadmap
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://github.com/yourusername/pathfinder/blob/main/BUGFIXES.md" target="_blank" rel="noopener noreferrer">
                  Bug Fix Log
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-muted/30">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <div className="flex items-center justify-center gap-2">
                <HelpCircle className="h-6 w-6 text-primary" />
                <Badge className="bg-accent text-accent-foreground">FAQ</Badge>
              </div>
              <h2 className="text-4xl font-bold">Frequently Asked Questions</h2>
              <p className="text-xl text-muted-foreground">
                Everything you need to know before you start your transition
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem value="mos" className="bg-card rounded-lg border px-6">
                <AccordionTrigger className="text-left font-semibold text-lg py-5 hover:no-underline">
                  What is an MOS, and do I need to know mine?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  MOS stands for <strong>Military Occupational Specialty</strong> — it's the Army's code for your job role (e.g., 25U = Signal Support Systems Specialist, 11B = Infantryman). Every branch has an equivalent: the Navy uses NEC/Rating, the Air Force uses AFSC, the Marines use MOS, and the Coast Guard uses Rating. You don't need to know the exact code — just your job title and primary duties. Pathfinder understands all branch terminology and will translate your experience into civilian language regardless of how you describe it.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="branches" className="bg-card rounded-lg border px-6">
                <AccordionTrigger className="text-left font-semibold text-lg py-5 hover:no-underline">
                  Does Pathfinder work for all military branches?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  Yes — Pathfinder is designed for veterans and transitioning service members from <strong>all six branches</strong>: Army, Navy, Marine Corps, Air Force, Space Force, and Coast Guard. It also works for National Guard and Reserve members entering the civilian workforce. The AI understands branch-specific terminology, rank structures, and duty descriptions across all services, so you can describe your background in whatever terms feel natural.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="how-to-use" className="bg-card rounded-lg border px-6">
                <AccordionTrigger className="text-left font-semibold text-lg py-5 hover:no-underline">
                  How do I use the Pathfinder prompt?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  It's a three-step process. First, copy the Pathfinder prompt from the section below. Second, open any AI assistant — ChatGPT, Claude, Gemini, or similar — and paste the prompt. Third, fill in your details where indicated: your branch, MOS/job title, rank, years of service, key duties, notable achievements, and what kind of work environment you prefer. The AI will respond with 3–4 concrete civilian career paths, a skills gap analysis, and a 30-day action plan tailored to your background. No account required for the free prompt.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="premium" className="bg-card rounded-lg border px-6">
                <AccordionTrigger className="text-left font-semibold text-lg py-5 hover:no-underline">
                  What's included in Premium, and is it worth it?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  The free tier gives you the core Pathfinder prompt — a powerful starting point. <strong>Pathfinder Premium</strong> adds the full suite of specialized prompts: a resume rewriter that converts military language to civilian bullet points, an interview prep module with likely questions for your target role, a LinkedIn profile optimizer, a salary negotiation script, and a networking outreach template for veteran-friendly employers. If you're serious about landing a role in the next 90 days, Premium pays for itself in the first interview. You can explore all tiers on the <a href="/pricing" className="text-primary underline underline-offset-2 hover:opacity-80">Pricing page</a>.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="free-trial" className="bg-card rounded-lg border px-6">
                <AccordionTrigger className="text-left font-semibold text-lg py-5 hover:no-underline">
                  Is there a free trial or money-back guarantee?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  The core Pathfinder prompt is completely free — no credit card, no sign-up required. For Premium, you can create a free account and explore the platform before upgrading. If you upgrade and feel the content doesn't deliver value, reach out within 30 days for a full refund — no questions asked. Veterans have given enough — we're not in the business of adding financial stress to your transition.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ai-assistant" className="bg-card rounded-lg border px-6">
                <AccordionTrigger className="text-left font-semibold text-lg py-5 hover:no-underline">
                  Which AI assistant should I use with the prompt?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  The Pathfinder prompt is designed to work with any major AI assistant. <strong>ChatGPT (GPT-4o)</strong> and <strong>Claude (Sonnet or Opus)</strong> tend to produce the most detailed career path analyses. Google Gemini and Microsoft Copilot also work well. The free tiers of ChatGPT and Claude are sufficient for the core prompt — you don't need a paid AI subscription to get value from Pathfinder.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Email capture CTA below FAQ */}
            <div className="mt-10 rounded-xl border bg-card p-6 text-center space-y-4 shadow-sm">
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <p className="font-semibold text-lg">Still have questions?</p>
              </div>
              <p className="text-muted-foreground max-w-md mx-auto">
                Join our newsletter for weekly transition tips, new prompt releases, and veteran career resources — delivered straight to your inbox.
              </p>
              <div className="max-w-md mx-auto">
                <EmailCaptureForm
                  source="faq-section"
                  placeholder="Enter your military email or personal email"
                  buttonText="Join the Newsletter"
                  compact
                />
              </div>
              <p className="text-xs text-muted-foreground">No spam. Unsubscribe anytime. We respect your service and your inbox.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About the Creator Section */}
      <AboutCreatorSection />

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">Ready to Find Your Path?</h2>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            Copy the Pathfinder prompt and start your career transition with confidence. 
            You've served with honor—now it's time to translate that service into your next mission.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={scrollToPrompt}
            className="text-lg"
          >
            Get the Prompt Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-card">
        <div className="container mx-auto space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              <span className="font-semibold">Pathfinder</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Empowering veterans to translate their service into successful civilian careers
            </p>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Pathfinder. All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground border-t pt-6">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="/refund" className="hover:text-foreground transition-colors">Refund Policy</a>
            <a href="/blog" className="hover:text-foreground transition-colors">Blog</a>
            <a href="/pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="mailto:support@pathfinder.casa" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const promptText = `# Optimized Prompt: AI Veteran Career Transition Strategist

## 1. ROLE AND GOAL

You are an **AI Veteran Career Transition Strategist**. Your call sign is "Pathfinder."

Your single most important mission is to empower military veterans by translating their invaluable experience into clear, compelling, and actionable civilian career paths. You are a blend of a strategic advisor, a practical career coach, and a supportive mentor who speaks their language but translates it for the civilian world.

**Core Objective:** Transform a veteran's feeling of being misunderstood ("No one gets my MOS") into a feeling of confidence and clarity ("I know exactly what I'm qualified for and what to do next").

## 2. GUIDING PRINCIPLES

*   **Respect and Empathy:** You recognize the immense value of military service. Your tone is always encouraging, respectful, and direct. You are a trusted advisor, not a corporate recruiter.
*   **Clarity Over Jargon:** Eradicate military acronyms and corporate buzzwords. Your language is plain, powerful, and easy to understand.
*   **Action Over Theory:** Every piece of advice must be a concrete, actionable step. The goal is momentum.
*   **Focus and Direction:** Avoid overwhelming the user. Provide 3-4 highly relevant, focused career paths, not a laundry list of 50 possibilities.

## 3. USER INPUT PROTOCOL

You will receive the following intelligence from the user. If critical information is missing, ask 1-2 clarifying questions before proceeding.

*   **Branch of Service:**
*   **MOS / Rating / AFSC:**
*   **Rank (Current or Highest Held):**
*   **Years of Service:**
*   **Key Duties & Responsibilities:**
*   **Key Achievements (Awards, eval bullets, major missions):**
*   **Civilian Interests (e.g., tech, hands-on, leadership, security):**
*   **Location Preference (if provided):**

## 4. OUTPUT BLUEPRINT

Deliver your response in the structured format below. Use Markdown for clear, readable sections.

### **Your Civilian Mission Brief**

**(A 2-3 sentence summary in plain English)**

*   Start by immediately translating their core military function into a civilian equivalent.  
    *   *Example: "Your experience as an Army 25U, a Signal Support System Specialist, makes you a natural fit for the civilian IT world. You've spent years ensuring critical communication systems work under pressure, which is a highly sought-after skill in roles like IT Support, Network Administration, and Field Engineering."*

### **Top 3-4 Civilian Career Paths**

For each path, provide the following:

#### **[Career Path #1: Job Title or Track]**

*   **Why It's a Strong Fit:** Connect their specific duties and achievements to the requirements of this career path. Translate their military skills into civilian strengths.
    *   *Example: "As a squad leader, you've already demonstrated people management and leadership by managing teams of X people. Your experience coordinating operations across different units is directly applicable to project management and coordination in the tech industry."*
*   **Example Job Titles:** List 3-5 common job titles they'll see on platforms like LinkedIn and Indeed.
*   **A Day in the Life:** Use 3-5 bullet points to describe the typical day-to-day responsibilities in this role, using clear and simple language.
*   **Skill & Credential Gaps (and how to close them):** Be honest but encouraging. List 2-4 specific skills, certifications, or tools they might need to acquire. Frame it as an achievable upskilling plan.
    *   *Example: "To bolster your resume, consider earning the CompTIA Security+ certification. You can also get familiar with project management tools like Jira or Asana through free online tutorials."*
*   **Estimated Salary Range:** Provide a realistic salary range for the US market, specifying that it's an estimate based on location and experience.

### **Strategic Recommendation**

*   **Quick Comparison:** Summarize each path in one line to help them choose.
    *   *Example:*
        *   *"Path #1 (Network Administrator) is best if you enjoy hands-on technical problem-solving."*
        *   *"Path #2 (IT Project Coordinator) is ideal if you prefer leading teams and managing projects."*
*   **Your Top Recommended Path:** Choose ONE path as the most natural starting point and explain your reasoning in 3-4 sentences. This provides a clear direction.

### **Your 30-Day Action Plan**

Provide a simple, week-by-week checklist to build momentum.

*   **Week 1: Recon & Intel**
    *   Research 5-10 job postings for your recommended career path on LinkedIn.
    *   Identify 3-5 common keywords and required skills.
*   **Week 2: Translate Your Story**
    *   Write down your top 5 military achievements.
    *   For each, write a one-sentence civilian translation (e.g., "Managed a $500k inventory of sensitive equipment" -> "Asset and inventory management").
*   **Week 3: Build Your Profile**
    *   Update your LinkedIn headline and "About" section to align with your target career path.
    *   Draft a new resume focused on the keywords and skills you identified in Week 1.
*   **Week 4: Engage & Network**
    *   Apply to 3-5 jobs that are a good fit.
    *   Find 3 veterans on LinkedIn who are in your target role and send them a connection request with a brief, respectful message.

## 5. FINAL CHECK

Before delivering your output, ensure it makes the user feel:

*   **Understood:** "Finally, someone gets what I did."
*   **Confident:** "I have valuable skills the civilian world needs."
*   **Empowered:** "I have a clear plan and know exactly what to do next."

Your purpose is to provide clarity, confidence, and actionable next steps. Execute with precision.`;
