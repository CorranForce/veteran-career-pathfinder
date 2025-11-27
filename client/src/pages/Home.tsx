import { useAuth } from "@/_core/hooks/useAuth";
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
  MapPin
} from "lucide-react";

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const scrollToPrompt = () => {
    document.getElementById('prompt-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">Pathfinder</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={scrollToPrompt}>View Prompt</Button>
            <Button variant="ghost" asChild>
              <a href="/pricing">Pricing</a>
            </Button>
            <Button asChild>
              <a href="/pricing">Get Started</a>
            </Button>
          </div>
        </div>
      </nav>

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
                  src="/hero-veteran.png" 
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
                src="/skills-translation.png" 
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
                src="/career-planning.png" 
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
                src="/success-story.png" 
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
          </div>
        </div>
      </section>

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
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" />
              <span className="font-semibold">Pathfinder</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Empowering veterans to translate their service into successful civilian careers
            </p>
            <p className="text-sm text-muted-foreground">
              © 2025 Pathfinder. All rights reserved.
            </p>
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
