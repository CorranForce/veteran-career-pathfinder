import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { X, Megaphone, Bug, Newspaper, Wrench, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type AnnouncementType = "feature" | "bugfix" | "news" | "maintenance";

interface LandingAnnouncement {
  id: number;
  title: string;
  content: string;
  type: AnnouncementType;
  link: string | null;
  publishedAt: Date | null;
  landingPageExpiresAt: Date | null;
}

const TYPE_STYLES: Record<AnnouncementType, { bg: string; border: string; icon: string; badge: string }> = {
  feature: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300",
  },
  bugfix: {
    bg: "bg-green-50 dark:bg-green-950/40",
    border: "border-green-200 dark:border-green-800",
    icon: "text-green-600 dark:text-green-400",
    badge: "bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300",
  },
  news: {
    bg: "bg-purple-50 dark:bg-purple-950/40",
    border: "border-purple-200 dark:border-purple-800",
    icon: "text-purple-600 dark:text-purple-400",
    badge: "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300",
  },
  maintenance: {
    bg: "bg-orange-50 dark:bg-orange-950/40",
    border: "border-orange-200 dark:border-orange-800",
    icon: "text-orange-600 dark:text-orange-400",
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-300",
  },
};

function AnnouncementIcon({ type, className }: { type: AnnouncementType; className?: string }) {
  switch (type) {
    case "feature": return <Megaphone className={className} />;
    case "bugfix": return <Bug className={className} />;
    case "news": return <Newspaper className={className} />;
    case "maintenance": return <Wrench className={className} />;
  }
}

export function LandingAnnouncementBanner() {
  const { data: announcements } = trpc.announcements.getLandingAnnouncements.useQuery();
  // Track which banners the user has dismissed this session
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const visible = (announcements ?? []).filter((a: LandingAnnouncement) => !dismissed.has(a.id));

  if (!visible.length) return null;

  return (
    <div className="w-full space-y-0">
      {visible.map((ann: LandingAnnouncement) => {
        const styles = TYPE_STYLES[ann.type];
        return (
          <div
            key={ann.id}
            className={`w-full border-b ${styles.bg} ${styles.border} px-4 py-3`}
          >
            <div className="container mx-auto flex items-start gap-3">
              <AnnouncementIcon
                type={ann.type}
                className={`h-4 w-4 mt-0.5 flex-shrink-0 ${styles.icon}`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded capitalize ${styles.badge}`}>
                    {ann.type}
                  </span>
                  <span className="text-sm font-semibold">{ann.title}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{ann.content}</p>
                {ann.link && (
                  <a
                    href={ann.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 text-xs mt-1 hover:underline ${styles.icon}`}
                  >
                    Learn more <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => setDismissed((prev) => new Set(Array.from(prev).concat(ann.id)))}
                aria-label="Dismiss announcement"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
