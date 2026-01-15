import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote, Star } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  photo: string;
  branch: string;
  rank: string;
  mos: string;
  beforeRole: string;
  afterRole: string;
  company: string;
  quote: string;
  rating: number;
  transitionTime: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Marcus Johnson",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    branch: "Army",
    rank: "E-6 Staff Sergeant",
    mos: "25U Signal Support",
    beforeRole: "Signal Support Systems Specialist",
    afterRole: "Senior Network Administrator",
    company: "Amazon Web Services",
    quote: "Pathfinder helped me realize my military comms experience was exactly what civilian IT needed. Within 60 days of using the prompt, I landed a role at AWS making 40% more than I expected. The skills translation was a game-changer.",
    rating: 5,
    transitionTime: "60 days"
  },
  {
    id: 2,
    name: "Sarah Mitchell",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    branch: "Air Force",
    rank: "E-5 Staff Sergeant",
    mos: "3D0X2 Cyber Systems",
    beforeRole: "Cyber Systems Operations",
    afterRole: "Cybersecurity Analyst",
    company: "Lockheed Martin",
    quote: "I was overwhelmed by the transition process until I found this prompt. It broke down exactly what certifications I needed and how to position my clearance. Now I'm protecting critical infrastructure and loving every minute.",
    rating: 5,
    transitionTime: "45 days"
  },
  {
    id: 3,
    name: "David Rodriguez",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    branch: "Marines",
    rank: "E-7 Gunnery Sergeant",
    mos: "0369 Infantry Unit Leader",
    beforeRole: "Infantry Unit Leader",
    afterRole: "Operations Manager",
    company: "Tesla",
    quote: "20 years of leading Marines, and I had no idea how to explain that to civilians. Pathfinder translated my leadership experience into business language. I went from feeling lost to running operations at Tesla in under 90 days.",
    rating: 5,
    transitionTime: "87 days"
  },
  {
    id: 4,
    name: "Jennifer Williams",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    branch: "Navy",
    rank: "E-6 Petty Officer 1st Class",
    mos: "IT Information Systems",
    beforeRole: "Information Systems Technician",
    afterRole: "Cloud Solutions Architect",
    company: "Microsoft",
    quote: "The 30-day action plan was exactly what I needed. Week by week, I knew exactly what to do. The prompt even helped me negotiate a signing bonus I didn't know I could ask for. Best career investment I've ever made.",
    rating: 5,
    transitionTime: "52 days"
  },
  {
    id: 5,
    name: "Michael Thompson",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    branch: "Army",
    rank: "O-3 Captain",
    mos: "35D MI Officer",
    beforeRole: "Military Intelligence Officer",
    afterRole: "Director of Security",
    company: "Goldman Sachs",
    quote: "Transitioning from military intelligence felt impossible. How do you explain classified work? Pathfinder showed me how to highlight transferable skills without compromising OPSEC. Now I lead security strategy at Goldman.",
    rating: 5,
    transitionTime: "75 days"
  },
  {
    id: 6,
    name: "Amanda Chen",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    branch: "Coast Guard",
    rank: "E-5 Petty Officer 2nd Class",
    mos: "OS Operations Specialist",
    beforeRole: "Operations Specialist",
    afterRole: "Project Manager",
    company: "Boeing",
    quote: "Everyone told me Coast Guard experience wouldn't translate. Pathfinder proved them wrong. My watchstanding and coordination skills were exactly what Boeing needed for their project management team. Don't let anyone limit your potential.",
    rating: 5,
    transitionTime: "40 days"
  }
];

const branchColors: Record<string, string> = {
  "Army": "bg-green-600",
  "Air Force": "bg-blue-600",
  "Marines": "bg-red-600",
  "Navy": "bg-blue-800",
  "Coast Guard": "bg-orange-500",
  "Space Force": "bg-gray-700"
};

export default function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge className="bg-accent text-accent-foreground">Success Stories</Badge>
          <h2 className="text-3xl md:text-4xl font-bold">
            Veterans Who Found Their Path
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Real stories from service members who used Pathfinder to translate their military 
            experience into successful civilian careers.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-16 max-w-4xl mx-auto">
          <div className="text-center p-4 bg-card rounded-lg border">
            <div className="text-2xl md:text-3xl font-bold text-primary">2,847+</div>
            <div className="text-sm text-muted-foreground">Veterans Helped</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg border">
            <div className="text-2xl md:text-3xl font-bold text-primary">94%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg border">
            <div className="text-2xl md:text-3xl font-bold text-primary">58 days</div>
            <div className="text-sm text-muted-foreground">Avg. Time to Job</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg border">
            <div className="text-2xl md:text-3xl font-bold text-primary">+35%</div>
            <div className="text-sm text-muted-foreground">Avg. Salary Increase</div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.id} 
              className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group"
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10 group-hover:text-primary/20 transition-colors" />
                
                {/* Header with Photo and Info */}
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={testimonial.photo}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{testimonial.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge 
                        variant="secondary" 
                        className={`${branchColors[testimonial.branch]} text-white text-xs`}
                      >
                        {testimonial.branch}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{testimonial.rank}</span>
                    </div>
                  </div>
                </div>

                {/* Career Transition */}
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-center flex-1">
                      <div className="text-xs text-muted-foreground mb-1">Before</div>
                      <div className="font-medium text-xs">{testimonial.beforeRole}</div>
                    </div>
                    <div className="text-primary font-bold px-2">→</div>
                    <div className="text-center flex-1">
                      <div className="text-xs text-muted-foreground mb-1">After</div>
                      <div className="font-medium text-xs text-primary">{testimonial.afterRole}</div>
                    </div>
                  </div>
                  <div className="text-center mt-2 text-xs text-muted-foreground">
                    at <span className="font-semibold text-foreground">{testimonial.company}</span>
                  </div>
                </div>

                {/* Quote */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-4">
                  "{testimonial.quote}"
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Hired in {testimonial.transitionTime}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Ready to write your own success story?
          </p>
          <a 
            href="/pricing" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
          >
            Start Your Transition Today
          </a>
        </div>
      </div>
    </section>
  );
}
