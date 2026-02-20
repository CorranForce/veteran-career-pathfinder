import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Megaphone, Bug, Newspaper, Wrench, ArrowRight } from "lucide-react";

type AnnouncementType = "feature" | "bugfix" | "news" | "maintenance";

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: AnnouncementType;
  link: string | null;
  publishedAt: Date | null;
}

export function AnnouncementsCard() {
  const { data: announcements, isLoading } = trpc.announcements.getPublished.useQuery({ limit: 5 });

  const getIcon = (type: AnnouncementType) => {
    switch (type) {
      case "feature":
        return <Megaphone className="h-5 w-5 text-blue-600" />;
      case "bugfix":
        return <Bug className="h-5 w-5 text-green-600" />;
      case "news":
        return <Newspaper className="h-5 w-5 text-purple-600" />;
      case "maintenance":
        return <Wrench className="h-5 w-5 text-orange-600" />;
    }
  };

  const getTypeBadge = (type: AnnouncementType) => {
    const colors = {
      feature: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      bugfix: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      news: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      maintenance: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    };

    return <Badge className={colors[type]}>{type}</Badge>;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Latest Updates
          </CardTitle>
          <CardDescription>Recent features, bug fixes, and news</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading announcements...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!announcements || announcements.length === 0) {
    return null; // Don't show the card if there are no announcements
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Latest Updates
        </CardTitle>
        <CardDescription>Recent features, bug fixes, and news</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="border-l-4 border-primary/20 pl-4 py-2 space-y-2"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  {getIcon(announcement.type)}
                  <h4 className="font-semibold text-sm">{announcement.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  {getTypeBadge(announcement.type)}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(announcement.publishedAt)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{announcement.content}</p>
              {announcement.link && (
                <a
                  href={announcement.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  Learn more
                  <ArrowRight className="ml-1 h-3 w-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
