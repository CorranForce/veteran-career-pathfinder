import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { Loader2, Plus, Trash2, Linkedin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ProfileEdit() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [isSaving, setIsSaving] = useState(false);
  const [showHighlightForm, setShowHighlightForm] = useState(false);

  const profileQuery = trpc.profile.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && !!user?.id,
  });

  const highlightsQuery = trpc.profile.getCareerHighlights.useQuery(undefined, {
    enabled: isAuthenticated && !!user?.id,
  });

  const updateProfileMutation = trpc.profile.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      profileQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const addHighlightMutation = trpc.profile.addCareerHighlight.useMutation({
    onSuccess: () => {
      toast.success("Career highlight added!");
      highlightsQuery.refetch();
      setShowHighlightForm(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add highlight");
    },
  });

  const deleteHighlightMutation = trpc.profile.deleteCareerHighlight.useMutation({
    onSuccess: () => {
      toast.success("Career highlight deleted!");
      highlightsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete highlight");
    },
  });

  if (authLoading || profileQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Sign In Required</h1>
        <p className="text-muted-foreground">Please sign in to edit your profile</p>
        <Button asChild>
          <a href="/login">Sign In</a>
        </Button>
      </div>
    );
  }

  const profile = profileQuery.data;
  const highlights = highlightsQuery.data || [];

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    await updateProfileMutation.mutateAsync({
      bio: formData.get("bio") as string,
      linkedinUrl: (formData.get("linkedinUrl") as string) || undefined,
      linkedinUsername: (formData.get("linkedinUsername") as string) || undefined,
      currentRole: (formData.get("currentRole") as string) || undefined,
      targetRole: (formData.get("targetRole") as string) || undefined,
      militaryBranch: (formData.get("militaryBranch") as string) || undefined,
      militaryRank: (formData.get("militaryRank") as string) || undefined,
    });

    setIsSaving(false);
  };

  const handleAddHighlight = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await addHighlightMutation.mutateAsync({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      category: (formData.get("category") as any) || "achievement",
      date: (formData.get("date") as string) || undefined,
    });

    e.currentTarget.reset();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <a href="/" className="font-bold text-xl">
              Pathfinder
            </a>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
              <a href="/profile">View Profile</a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="/">Home</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-8 sm:py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold">Edit Your Profile</h1>
              <p className="text-xl text-muted-foreground">
                Showcase your career transition journey and connect with other veterans
              </p>
            </div>

            {/* Profile Form */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Tell other members about your military background and career goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentRole">Current Role</Label>
                      <Input
                        id="currentRole"
                        name="currentRole"
                        placeholder="e.g., IT Support Specialist"
                        defaultValue={profile?.currentRole || ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetRole">Target Role</Label>
                      <Input
                        id="targetRole"
                        name="targetRole"
                        placeholder="e.g., Network Administrator"
                        defaultValue={profile?.targetRole || ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="militaryBranch">Military Branch</Label>
                      <Input
                        id="militaryBranch"
                        name="militaryBranch"
                        placeholder="e.g., Army, Navy, Air Force"
                        defaultValue={profile?.militaryBranch || ""}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="militaryRank">Military Rank</Label>
                      <Input
                        id="militaryRank"
                        name="militaryRank"
                        placeholder="e.g., Sergeant, Lieutenant"
                        defaultValue={profile?.militaryRank || ""}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell your story... (max 1000 characters)"
                      maxLength={1000}
                      rows={5}
                      defaultValue={profile?.bio || ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl" className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn Profile URL
                    </Label>
                    <Input
                      id="linkedinUrl"
                      name="linkedinUrl"
                      type="url"
                      placeholder="https://linkedin.com/in/yourprofile"
                      defaultValue={profile?.linkedinUrl || ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedinUsername">LinkedIn Username</Label>
                    <Input
                      id="linkedinUsername"
                      name="linkedinUsername"
                      placeholder="yourprofile"
                      defaultValue={profile?.linkedinUsername || ""}
                    />
                  </div>

                  <Button type="submit" disabled={isSaving} className="w-full">
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Profile"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Career Highlights */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Career Highlights</CardTitle>
                    <CardDescription>
                      Showcase your achievements, certifications, and career milestones
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHighlightForm(!showHighlightForm)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Highlight
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {showHighlightForm && (
                  <form onSubmit={handleAddHighlight} className="p-4 bg-muted/50 rounded-lg space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="e.g., Promoted to Team Lead"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <select
                        name="category"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      >
                        <option value="achievement">Achievement</option>
                        <option value="certification">Certification</option>
                        <option value="promotion">Promotion</option>
                        <option value="project">Project</option>
                        <option value="award">Award</option>
                        <option value="skill">Skill</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Tell the story behind this highlight..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input id="date" name="date" type="date" />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        Add Highlight
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowHighlightForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                {highlights.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No career highlights yet. Add your first one to showcase your achievements!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {highlights.map((highlight: any) => (
                      <div
                        key={highlight.id}
                        className="p-4 border border-border rounded-lg space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{highlight.title}</h3>
                            <Badge className="mt-2">{highlight.category}</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              deleteHighlightMutation.mutate({ highlightId: highlight.id })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {highlight.description && (
                          <p className="text-muted-foreground">{highlight.description}</p>
                        )}
                        {highlight.date && (
                          <p className="text-sm text-muted-foreground">
                            {new Date(highlight.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
