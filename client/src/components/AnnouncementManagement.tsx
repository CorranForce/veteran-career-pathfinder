import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, Archive, CheckCircle } from "lucide-react";
import { toast } from "sonner";

type AnnouncementType = "feature" | "bugfix" | "news" | "maintenance";
type AnnouncementStatus = "draft" | "published" | "archived";

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: AnnouncementType;
  status: AnnouncementStatus;
  priority: number;
  link: string | null;
  createdAt: Date;
  publishedAt: Date | null;
  archivedAt: Date | null;
  createdBy: number;
  createdByName: string;
}

const PAGE_SIZE = 5;

export function AnnouncementManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<AnnouncementType>("feature");
  const [priority, setPriority] = useState(0);
  const [link, setLink] = useState("");

  // Fetch announcements
  const { data: announcements, isLoading, refetch } = trpc.announcements.getAll.useQuery();

  // Pagination derived state
  const totalItems = announcements?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedAnnouncements = useMemo(() => {
    if (!announcements) return [];
    const start = (safePage - 1) * PAGE_SIZE;
    return announcements.slice(start, start + PAGE_SIZE);
  }, [announcements, safePage]);

  // Reset to page 1 after mutations that may change total count
  const refetchAndReset = () => { refetch(); setCurrentPage(1); };

  // Mutations
  const createMutation = trpc.announcements.create.useMutation({
    onSuccess: () => {
      toast.success("Announcement created successfully");
      refetchAndReset();
      resetForm();
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to create announcement: ${error.message}`);
    },
  });

  const updateMutation = trpc.announcements.update.useMutation({
    onSuccess: () => {
      toast.success("Announcement updated successfully");
      refetch();
      setIsEditDialogOpen(false);
      setEditingAnnouncement(null);
    },
    onError: (error) => {
      toast.error(`Failed to update announcement: ${error.message}`);
    },
  });

  const deleteMutation = trpc.announcements.delete.useMutation({
    onSuccess: () => {
      toast.success("Announcement deleted successfully");
      refetchAndReset();
    },
    onError: (error) => {
      toast.error(`Failed to delete announcement: ${error.message}`);
    },
  });

  const publishMutation = trpc.announcements.publish.useMutation({
    onSuccess: () => {
      toast.success("Announcement published successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to publish announcement: ${error.message}`);
    },
  });

  const archiveMutation = trpc.announcements.archive.useMutation({
    onSuccess: () => {
      toast.success("Announcement archived successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to archive announcement: ${error.message}`);
    },
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setType("feature");
    setPriority(0);
    setLink("");
  };

  const handleCreate = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      type,
      priority,
      link: link.trim() || undefined,
    });
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setTitle(announcement.title);
    setContent(announcement.content);
    setType(announcement.type);
    setPriority(announcement.priority);
    setLink(announcement.link || "");
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingAnnouncement) return;
    
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    updateMutation.mutate({
      id: editingAnnouncement.id,
      title: title.trim(),
      content: content.trim(),
      type,
      priority,
      link: link.trim() || "",
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handlePublish = (id: number) => {
    publishMutation.mutate({ id });
  };

  const handleArchive = (id: number) => {
    if (confirm("Are you sure you want to archive this announcement?")) {
      archiveMutation.mutate({ id });
    }
  };

  const getStatusBadge = (status: AnnouncementStatus) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "published":
        return <Badge variant="default">Published</Badge>;
      case "archived":
        return <Badge variant="outline">Archived</Badge>;
    }
  };

  const getTypeBadge = (type: AnnouncementType) => {
    const colors = {
      feature: "bg-blue-100 text-blue-800",
      bugfix: "bg-green-100 text-green-800",
      news: "bg-purple-100 text-purple-800",
      maintenance: "bg-orange-100 text-orange-800",
    };

    return <Badge className={colors[type]}>{type}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Announcement Management</CardTitle>
            <CardDescription>
              Create and manage announcements for features, bug fixes, and news
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading announcements...</div>
        ) : !announcements || announcements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No announcements yet. Create your first one!
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{announcement.title}</h3>
                      {getStatusBadge(announcement.status)}
                      {getTypeBadge(announcement.type)}
                      {announcement.priority > 0 && (
                        <Badge variant="outline">Priority: {announcement.priority}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {announcement.content}
                    </p>
                    {announcement.link && (
                      <a
                        href={announcement.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Learn more →
                      </a>
                    )}
                    <div className="text-xs text-muted-foreground mt-2">
                      Created by {announcement.createdByName} on{" "}
                      {new Date(announcement.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {announcement.status === "draft" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePublish(announcement.id)}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Publish
                      </Button>
                    )}
                    {announcement.status === "published" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleArchive(announcement.id)}
                      >
                        <Archive className="mr-1 h-4 w-4" />
                        Archive
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(announcement)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && totalItems > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, totalItems)} of {totalItems}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={safePage === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(safePage - 1)}
                disabled={safePage === 1}
              >
                Previous
              </Button>
              <span className="px-3 text-sm">
                Page {safePage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(safePage + 1)}
                disabled={safePage === totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safePage === totalPages}
              >
                Last
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
            <DialogDescription>
              Add a new announcement to display on the landing page
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., New AI Resume Builder Feature"
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe the announcement..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as AnnouncementType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="bugfix">Bug Fix</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="link">Link (optional)</Label>
              <Input
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
            <DialogDescription>
              Update announcement details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., New AI Resume Builder Feature"
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe the announcement..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as AnnouncementType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="bugfix">Bug Fix</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Input
                  id="edit-priority"
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-link">Link (optional)</Label>
              <Input
                id="edit-link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
