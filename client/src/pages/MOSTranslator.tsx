import { useState, useCallback, useMemo, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { PageFooter } from "@/components/PageFooter";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Search,
  ChevronRight,
  Briefcase,
  TrendingUp,
  Clock,
  DollarSign,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Building2,
  Star,
  Zap,
  Shield,
  Lock,
  Sparkles,
  Copy,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

const BRANCH_OPTIONS = [
  { value: "all", label: "All Branches", icon: "🎖️" },
  { value: "army", label: "Army", icon: "⭐" },
  { value: "navy", label: "Navy", icon: "⚓" },
  { value: "air_force", label: "Air Force", icon: "✈️" },
  { value: "marine_corps", label: "Marines", icon: "🦅" },
  { value: "coast_guard", label: "Coast Guard", icon: "🚢" },
  { value: "space_force", label: "Space Force", icon: "🚀" },
];

const DIFFICULTY_CONFIG = {
  easy: { label: "Direct Transition", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: <Zap className="h-3 w-3" /> },
  moderate: { label: "Some Retraining", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: <TrendingUp className="h-3 w-3" /> },
  challenging: { label: "Significant Retraining", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <AlertCircle className="h-3 w-3" /> },
};

const BRANCH_COLORS: Record<string, string> = {
  army: "bg-green-500/20 text-green-400 border-green-500/30",
  navy: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  air_force: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  marine_corps: "bg-red-500/20 text-red-400 border-red-500/30",
  coast_guard: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  space_force: "bg-violet-500/20 text-violet-400 border-violet-500/30",
};

function formatBranch(branch: string) {
  return branch.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatSalary(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
  return `$${n}`;
}

type CareerPath = {
  id: number;
  jobTitle: string;
  industry: string;
  description: string;
  salaryMin: number;
  salaryMax: number;
  salaryMedian: number | null;
  transitionDifficulty: "easy" | "moderate" | "challenging";
  timeToHireMonths: number | null;
  requiredCerts: string[];
  recommendedCerts: string[];
  transferableSkills: string[];
  skillsGap: string[];
  exampleEmployers: string[];
  isTopPath: boolean;
  displayOrder: number;
};

type MosResult = {
  mos: {
    id: number;
    code: string;
    branch: string;
    title: string;
    description: string;
    category: string;
    keySkills: string[];
  };
  careerPaths: CareerPath[];
} | null;

function CareerPathCard({ path, index }: { path: CareerPath; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const diff = DIFFICULTY_CONFIG[path.transitionDifficulty];

  return (
    <Card
      className={`border transition-all duration-200 hover:shadow-lg cursor-pointer ${
        path.isTopPath
          ? "border-primary/50 bg-primary/5"
          : "border-border/60 bg-card/50"
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-sm font-bold text-primary">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <CardTitle className="text-base">{path.jobTitle}</CardTitle>
                {path.isTopPath && (
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs gap-1">
                    <Star className="h-3 w-3" /> Top Match
                  </Badge>
                )}
              </div>
              <CardDescription className="text-sm">{path.industry}</CardDescription>
            </div>
          </div>
          <ChevronRight
            className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform mt-1 ${
              expanded ? "rotate-90" : ""
            }`}
          />
        </div>

        {/* Quick stats row */}
        <div className="flex flex-wrap gap-2 mt-3 ml-11">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <DollarSign className="h-3 w-3 text-emerald-400" />
            <span className="font-medium text-foreground">
              {formatSalary(path.salaryMin)}–{formatSalary(path.salaryMax)}
            </span>
            <span>/yr</span>
          </div>
          {path.timeToHireMonths && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 text-blue-400" />
              <span>{path.timeToHireMonths < 12 ? `${path.timeToHireMonths} mo` : `${(path.timeToHireMonths / 12).toFixed(1)} yr`} to hire</span>
            </div>
          )}
          <Badge variant="outline" className={`text-xs gap-1 border ${diff.color}`}>
            {diff.icon}
            {diff.label}
          </Badge>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 ml-11">
          <Separator className="mb-4" />

          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{path.description}</p>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Transferable Skills */}
            {path.transferableSkills.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> You Already Have
                </h4>
                <ul className="space-y-1">
                  {path.transferableSkills.map((skill, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills Gap */}
            {path.skillsGap && path.skillsGap.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> You'll Need to Learn
                </h4>
                <ul className="space-y-1">
                  {path.skillsGap.map((skill, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-amber-400 mt-0.5">•</span>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Required Certs */}
          {path.requiredCerts.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
                <Award className="h-3 w-3" /> Required Certifications
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {path.requiredCerts.map((cert, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Certs */}
          {path.recommendedCerts && path.recommendedCerts.length > 0 && (
            <div className="mt-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                <Award className="h-3 w-3" /> Recommended (Bonus)
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {path.recommendedCerts.map((cert, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Example Employers */}
          {path.exampleEmployers && path.exampleEmployers.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                <Building2 className="h-3 w-3" /> Example Employers
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {path.exampleEmployers.map((emp, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {emp}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Salary breakdown */}
          {path.salaryMedian && (
            <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/40">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Salary Range (USD/year)
              </h4>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Entry</span>
                  <p className="font-semibold text-foreground">{formatSalary(path.salaryMin)}</p>
                </div>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full" style={{ width: "100%" }} />
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground text-xs">Senior</span>
                  <p className="font-semibold text-foreground">{formatSalary(path.salaryMax)}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Median: <span className="font-medium text-foreground">{formatSalary(path.salaryMedian)}</span>/yr
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function MOSTranslator() {
  const { user, isAuthenticated } = useAuth();
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("all");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search input
  const handleQueryChange = useCallback((val: string) => {
    setQuery(val);
    const timer = setTimeout(() => setDebouncedQuery(val), 300);
    return () => clearTimeout(timer);
  }, []);

  const { data: featured } = trpc.mosTranslator.getFeatured.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  const { data: searchResults, isLoading: searching } = trpc.mosTranslator.search.useQuery(
    { query: debouncedQuery, branch: branch as "all" | "army" | "navy" | "air_force" | "marine_corps" | "coast_guard" | "space_force" },
    { enabled: debouncedQuery.length >= 1, staleTime: 30 * 1000 }
  );

  const { data: mosDetail, isLoading: loadingDetail } = trpc.mosTranslator.getByCode.useQuery(
    { code: selectedCode!, userId: user?.id },
    { enabled: !!selectedCode, staleTime: 5 * 60 * 1000 }
  );

  const { data: accessData } = trpc.payment.getAccessLevel.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const hasPremiumAccess = isAuthenticated && (accessData?.level === "premium" || accessData?.level === "pro");

  // Build the pre-filled prompt for the selected MOS
  const prefilledPrompt = useMemo(() => {
    if (!mosDetail) return "";
    const { mos } = mosDetail;
    return `# AI Veteran Career Transition Strategist\n\nYou are an expert AI career advisor specializing in military-to-civilian career transitions.\n\n## My Military Background\n\n- **Branch of Service:** ${formatBranch(mos.branch)}\n- **MOS / Rating / AFSC:** ${mos.code} — ${mos.title}\n- **Rank (Current or Highest Held):** [Enter your rank]\n- **Years of Service:** [Enter years]\n- **Key Duties & Responsibilities:** ${mos.description}\n- **Key Achievements (Awards, eval bullets, major missions):** [Describe your top achievements]\n- **Civilian Interests:** [e.g., tech, management, security, healthcare]\n- **Location Preference:** [City/State or Remote]\n\n## Instructions\n\nBased on my ${mos.code} background, please provide:\n1. A plain-English translation of my military skills for civilian employers\n2. My top 3-4 civilian career paths with salary ranges and day-to-day descriptions\n3. An honest skills gap analysis (what I have vs. what I need)\n4. A specific 30-day action plan with weekly milestones to land my first civilian role\n\nFocus on actionable steps, not generic advice. Speak to me like a trusted advisor, not a recruiter.`;
  }, [mosDetail]);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prefilledPrompt);
    toast.success("Prompt copied! Paste it into ChatGPT or Claude to get your personalized analysis.");
  };

  const showResults = debouncedQuery.length >= 1;
  const showDetail = !!selectedCode;

  useEffect(() => {
    document.title = "MOS Translator | Military to Civilian Career Pathfinder";
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>MOS Translator | Military to Civilian Career Pathfinder</title>
        <meta name="description" content="Translate your Military Occupational Specialty (MOS) into civilian job titles, salary ranges, and career paths. Free MOS lookup for all branches." />
        <meta name="keywords" content="MOS translator, military occupational specialty, military to civilian jobs, MOS to civilian, veteran job search, military skills translation" />
        <link rel="canonical" href="https://pathfinder.casa/mos-translator" />
      </Helmet>
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16">
          <Link href="/">
            <span className="flex items-center gap-2 cursor-pointer">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold text-xl">Pathfinder</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/"><Button variant="ghost">Home</Button></Link>
            <Link href="/pricing"><Button variant="ghost">Pricing</Button></Link>
            <Link href="/blog"><Button variant="ghost">Resources</Button></Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5 pointer-events-none" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="container mx-auto relative">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <Badge className="bg-primary/20 text-primary border-primary/30 text-sm gap-2">
                <Shield className="h-4 w-4" />
                MOS Translator
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Translate Your Military Service Into a{" "}
                <span className="text-primary">Civilian Career</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Enter your MOS, rate, or specialty to instantly see which civilian careers match your training,
                what you already qualify for, and exactly what certifications will close the gap.
              </p>

              {/* Search bar */}
              <div className="max-w-xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    placeholder="Search by MOS code (e.g. 25U, 11B, IT, HM)..."
                    className="pl-12 pr-4 h-14 text-base bg-card border-border/60 focus:border-primary rounded-xl shadow-lg"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchResults && searchResults.length === 1) {
                        setSelectedCode(searchResults[0].code);
                        setQuery("");
                        setDebouncedQuery("");
                      }
                    }}
                  />
                </div>

                {/* Branch filter */}
                <div className="flex flex-wrap gap-2 mt-3 justify-center">
                  {BRANCH_OPTIONS.map((b) => (
                    <button
                      key={b.value}
                      onClick={() => setBranch(b.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        branch === b.value
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card/50 text-muted-foreground border-border/50 hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {b.icon} {b.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto pb-16">
          {/* Search results dropdown */}
          {showResults && !showDetail && (
            <div className="max-w-xl mx-auto mb-8 -mt-4">
              {searching ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                  Searching...
                </div>
              ) : searchResults && searchResults.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-3">
                    {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
                  </p>
                  {searchResults.map((mos) => (
                    <button
                      key={mos.id}
                      onClick={() => {
                        setSelectedCode(mos.code);
                        setQuery("");
                        setDebouncedQuery("");
                      }}
                      className="w-full text-left p-4 rounded-xl border border-border/60 bg-card/80 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-primary text-lg">{mos.code}</span>
                            <Badge variant="outline" className={`text-xs border ${BRANCH_COLORS[mos.branch] || "text-muted-foreground"}`}>
                              {formatBranch(mos.branch)}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">{mos.category}</Badge>
                          </div>
                          <p className="text-sm font-medium text-foreground">{mos.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{mos.description}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-3" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No MOS codes found for "{debouncedQuery}".</p>
                  <p className="text-sm text-muted-foreground mt-1">Try a different code or keyword.</p>
                </div>
              )}
            </div>
          )}

          {/* MOS Detail View */}
          {showDetail && (
            <div className="max-w-4xl mx-auto">
              <Button
                variant="ghost"
                onClick={() => setSelectedCode(null)}
                className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Search
              </Button>

              {loadingDetail ? (
                <div className="text-center py-16">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading career paths...</p>
                </div>
              ) : mosDetail ? (
                <div className="space-y-8">
                  {/* MOS Header */}
                  <div className="p-6 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Shield className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h2 className="text-3xl font-bold text-primary">{mosDetail.mos.code}</h2>
                          <Badge variant="outline" className={`border ${BRANCH_COLORS[mosDetail.mos.branch] || ""}`}>
                            {formatBranch(mosDetail.mos.branch)}
                          </Badge>
                          <Badge variant="secondary">{mosDetail.mos.category}</Badge>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{mosDetail.mos.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{mosDetail.mos.description}</p>
                      </div>
                    </div>

                    {/* Key Skills */}
                    {mosDetail.mos.keySkills.length > 0 && (
                      <div className="mt-5 pt-5 border-t border-border/40">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Core Transferable Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {mosDetail.mos.keySkills.map((skill, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Career Paths */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">
                        {mosDetail.careerPaths.length} Civilian Career Path{mosDetail.careerPaths.length !== 1 ? "s" : ""}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Briefcase className="h-3 w-3" />
                        Click any card to expand details
                      </div>
                    </div>

                    {mosDetail.careerPaths.length > 0 ? (
                      <div className="space-y-3">
                        {mosDetail.careerPaths.map((path, i) => (
                          <CareerPathCard key={path.id} path={path} index={i} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border border-dashed border-border/60 rounded-xl">
                        <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">Career paths coming soon for this MOS.</p>
                      </div>
                    )}
                  </div>

                  {/* Get Full AI Analysis CTA */}
                  {hasPremiumAccess ? (
                    /* Premium/Pro: Show the pre-filled prompt ready to copy */
                    <div className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 overflow-hidden">
                      <div className="p-6 border-b border-primary/20">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 rounded-full bg-primary/20">
                            <Sparkles className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">Your {mosDetail?.mos.code} AI Analysis Prompt</h3>
                            <p className="text-sm text-muted-foreground">Pre-filled with your MOS data — paste into ChatGPT or Claude</p>
                          </div>
                          <Badge className="ml-auto bg-primary/20 text-primary border-primary/30">
                            <Star className="h-3 w-3 mr-1" /> Premium
                          </Badge>
                        </div>
                        <div className="bg-background/60 rounded-xl border border-border/50 p-4 max-h-48 overflow-y-auto">
                          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">{prefilledPrompt}</pre>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col sm:flex-row gap-3">
                        <Button size="lg" className="flex-1 gap-2" onClick={handleCopyPrompt}>
                          <Copy className="h-4 w-4" />
                          Copy Full Prompt
                        </Button>
                        <Button size="lg" variant="outline" className="flex-1 gap-2" asChild>
                          <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            Open ChatGPT
                          </a>
                        </Button>
                        <Button size="lg" variant="outline" className="flex-1 gap-2" asChild>
                          <a href="https://claude.ai" target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            Open Claude
                          </a>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Free / unauthenticated: Locked premium CTA */
                    <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 overflow-hidden">
                      {/* Teaser — blurred prompt preview */}
                      <div className="relative p-6 pb-0">
                        <div className="bg-background/60 rounded-xl border border-border/50 p-4 max-h-32 overflow-hidden select-none pointer-events-none">
                          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed opacity-60">{prefilledPrompt.slice(0, 400)}...</pre>
                        </div>
                        {/* Gradient fade */}
                        <div className="absolute bottom-0 left-6 right-6 h-20 bg-gradient-to-t from-card/90 to-transparent rounded-b-xl" />
                      </div>

                      {/* Lock wall */}
                      <div className="p-6 text-center space-y-4">
                        <div className="flex justify-center">
                          <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                            <Lock className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <Badge className="bg-accent/20 text-accent-foreground border-accent/30 gap-1">
                          <Sparkles className="h-3 w-3" /> Premium Feature
                        </Badge>
                        <h3 className="text-xl font-bold">Get Your {mosDetail?.mos.code} AI Analysis Prompt</h3>
                        <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
                          Unlock a pre-filled AI prompt customized for your {mosDetail?.mos.code} background — ready to paste into ChatGPT or Claude for a personalized 30-day career transition plan.
                        </p>

                        {/* Feature list */}
                        <ul className="text-left space-y-2 max-w-sm mx-auto">
                          {[
                            `MOS ${mosDetail?.mos.code} pre-filled in the prompt`,
                            "Civilian skills translation included",
                            "30-day action plan framework",
                            "Resume & LinkedIn optimization prompts",
                            "Interview prep for your target roles",
                          ].map((f) => (
                            <li key={f} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                          {!isAuthenticated ? (
                            <>
                              <Button size="lg" asChild>
                                <Link href="/signup">
                                  Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                              <Button size="lg" variant="outline" asChild>
                                <Link href="/login">Sign In</Link>
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="lg" asChild>
                                <Link href="/pricing">
                                  Unlock for $29 <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                              <Button size="lg" variant="outline" asChild>
                                <Link href="/pricing">View All Plans</Link>
                              </Button>
                            </>
                          )}
                        </div>
                        {isAuthenticated && (
                          <p className="text-xs text-muted-foreground">One-time payment · Lifetime access · No subscription required</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">MOS code not found in our database.</p>
                  <Button variant="ghost" onClick={() => setSelectedCode(null)} className="mt-4">
                    Search Again
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Featured MOS grid (landing state) */}
          {!showResults && !showDetail && featured && featured.length > 0 && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Browse by MOS Code</h2>
                <p className="text-muted-foreground">Click any MOS to see civilian career paths</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {featured.map((mos) => (
                  <button
                    key={mos.id}
                    onClick={() => setSelectedCode(mos.code)}
                    className="p-4 rounded-xl border border-border/60 bg-card/60 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-bold text-primary text-lg group-hover:text-primary">{mos.code}</span>
                      <Badge variant="outline" className={`text-[10px] border ${BRANCH_COLORS[mos.branch] || ""}`}>
                        {formatBranch(mos.branch).split(" ")[0]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{mos.title}</p>
                    <Badge variant="secondary" className="text-[10px] mt-2">{mos.category}</Badge>
                  </button>
                ))}
              </div>

              {/* Stats bar */}
              <div className="mt-12 grid grid-cols-3 gap-4 p-6 rounded-2xl bg-card/50 border border-border/40">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">20+</p>
                  <p className="text-sm text-muted-foreground mt-1">MOS Codes</p>
                </div>
                <div className="text-center border-x border-border/40">
                  <p className="text-3xl font-bold text-primary">50+</p>
                  <p className="text-sm text-muted-foreground mt-1">Career Paths</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">6</p>
                  <p className="text-sm text-muted-foreground mt-1">Branches</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
