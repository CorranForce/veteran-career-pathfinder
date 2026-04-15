import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Bot, Cpu, CheckCircle2, Star } from "lucide-react";

export function AboutCreatorSection() {
  const credentials = [
    { icon: Shield, label: "U.S. Army Veteran", detail: "25U Signal Support Systems Specialist" },
    { icon: Bot, label: "RPA Developer", detail: "Automation & AI workflow engineering" },
    { icon: Cpu, label: "AI Practitioner", detail: "LLM integration, prompt engineering, AI tooling" },
  ];

  const highlights = [
    "Served as a 25U Signal Support Systems Specialist in the U.S. Army",
    "Transitioned to a civilian technology career in RPA and AI development",
    "Built Pathfinder to solve the exact problem he faced during his own transition",
    "Combines military discipline with modern AI expertise to help fellow veterans",
  ];

  return (
    <section id="about" className="py-20 bg-background">
      <div className="container mx-auto">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Photo + credential cards column */}
            <div className="flex flex-col items-center lg:items-start gap-6">
              {/* Avatar placeholder */}
              <div className="relative">
                <div className="w-52 h-52 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/30 flex items-center justify-center shadow-xl border-2 border-primary/20 overflow-hidden">
                  <div className="flex flex-col items-center gap-2 text-primary/60">
                    <Shield className="h-24 w-24" />
                    <span className="text-xs font-medium uppercase tracking-wider">U.S. Army</span>
                  </div>
                </div>
                <div className="absolute -bottom-3 -right-3 bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-bold shadow">
                  Veteran
                </div>
              </div>

              {/* Credential cards */}
              <div className="w-full space-y-3">
                {credentials.map(({ icon: Icon, label, detail }) => (
                  <Card key={label} className="border bg-card/60">
                    <CardContent className="flex items-center gap-3 py-3 px-4">
                      <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{label}</p>
                        <p className="text-xs text-muted-foreground">{detail}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Bio column */}
            <div className="space-y-6">
              <div className="space-y-3">
                <Badge className="bg-accent/20 text-accent-foreground border-accent/30">
                  <Star className="h-3 w-3 mr-1" />
                  About the Creator
                </Badge>
                <h2 className="text-4xl font-bold leading-tight">
                  Built by a Veteran,<br />for Veterans
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Allen is a U.S. Army veteran who served as a{" "}
                  <strong className="text-foreground">25U Signal Support Systems Specialist</strong>.
                  After leaving the military, he navigated the same confusing civilian job market
                  that thousands of veterans face every year.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Today, Allen works as an{" "}
                  <strong className="text-foreground">RPA Developer and AI practitioner</strong>,
                  building automation and AI-powered tools. He created Pathfinder because he
                  believes every veteran deserves a clear, actionable path — not generic advice.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Pathfinder is the tool he wished he had when he was transitioning. It combines
                  his military experience, technical expertise, and deep understanding of what
                  employers actually look for.
                </p>
              </div>

              {/* Highlights */}
              <div className="space-y-3 pt-2">
                {highlights.map((h) => (
                  <div key={h} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{h}</p>
                  </div>
                ))}
              </div>

              {/* Mission statement */}
              <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                "You spent years serving your country with discipline and purpose. You deserve a
                career transition that honors that service — not one that makes you feel like you're
                starting from zero."
                <footer className="mt-2 text-sm font-medium text-foreground not-italic">
                  — Allen, Founder of Pathfinder
                </footer>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
