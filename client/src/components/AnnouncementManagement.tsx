import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Plus, Edit, Trash2, Archive, CheckCircle, RotateCcw, Megaphone } from "lucide-react";
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

function AnnouncementList({
  announcements,
  isLoading,
  emptyMessage,
  onEdit,
  onDelete,
  onPublish,
  onArchive,
  onRestore,
  showRestore = false,
}: {
  announcements: Announcement[] | undefined;
  isLoading: boolean;
  emptyMessage: string;
  onEdit: (a: Announcement) => void;
  onDelete: (id: number) => void;
  onPublish?: (id: number) => void;
  onArchive?: (id: number) => void;
  onRestore?: (id: number) => void;
  showRestore?: boolean;
}) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = announcements?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const paginated = useMemo(() => {
    if (!announcements) return [];
    const start = (safePage - 1) * PAGE_SIZE;
    return announcements.slice(start, start + PAGE_SIZE);
  }, [announcements, safePage]);

  const getStatusBadge = (status: AnnouncementStatus) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "published":
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Published</Badge>;
      case "archived":
        return <Badge variant="outline" className="text-muted-foreground">Archived</Badge>;
    }
  };

  const getTypeBadge = (type: AnnouncementType) => {
    const colors: Record<AnnouncementType, string> = {
      feature: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
      bugfix: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
      news: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
      maintenance: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    };
    return <Badge className={colors[type]}>{type}</Badge>;
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading announcements...</div>;
  }

  if (!announcements || announcements.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {paginated.map((announcement) => (
        <div key={announcement.id} className="border rounded-lg p-4 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="font-semibold">{announcement.title}</h3>
                {getStatusBadge(announcement.status)}
                {getTypeBadge(announcement.type)}
                {announcement.priority > 0 && (
                  <Badge variant="outline">Priority: {announcement.priority}</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
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
                {announcement.publishedAt && (
                  <> · Published {new Date(announcement.publishedAt).toLocaleDateString()}</>
                )}
                {announcement.archivedAt && (
                  <> · Archived {new Date(announcement.archivedAt).toLocaleDateString()}</>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Active tab actions */}
              {!showRestore && announcement.status === "draft" && onPublish && (
                <Button size="sm" variant="outline" onClick={() => onPublish(announcement.id)}>
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Publish
                </Button>
              )}
              {!showRestore && announcement.status === "published" && onArchive && (
                <Button size="sm" variant="outline" onClick={() => onArchive(announcement.id)}>
                  <Archive className="mr-1 h-4 w-4" />
                  Archive
                </Button>
              )}
              {/* Archive tab: restore action */}
              {showRestore && onRestore && (
                <Button size="sm" variant="outline" onClick={() => onRestore(announcement.id)}>
                  <RotateCcw className="mr-1 h-4 w-4" />
                  Restore
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => onEdit(announcement)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(announcement.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {totalItems > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, totalItems)} of {totalItems}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={safePage === 1}>First</Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(safePage - 1)} disabled={safePage === 1}>Previous</Button>
            <span className="px-3 text-sm">Page {safePage} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(safePage + 1)} disabled={safePage === totalPages}>Next</Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)} disabled={safePage === totalPages}>Last</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AnnouncementManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<AnnouncementType>("feature");
  const [priority, setPriority] = useState(0);
  const [link, setLink] = useState("");

  // Fetch active (draft + published) and archived separately
  const { data: activeAnnouncements, isLoading: isLoadingActive, refetch: refetchActive } =
    trpc.announcements.getAll.useQuery();
  const { data: archivedAnnouncements, isLoading: isLoadingArchived, refetch: refetchArchived } =
    trpc.announcements.getArchived.useQuery();

  // Active = draft + published (not archived)
  const active = useMemo(
    () => activeAnnouncements?.filter((a) => a.status !== "archived") ?? [],
    [activeAnnouncements]
  );

  const refetchAll = () => { refetchActive(); refetchArchived(); };

  // Mutations
  const createMutation = trpc.announcements.create.useMutation({
    onSuccess: () => { toast.success("Announcement created"); refetchAll(); resetForm(); setIsCreateDialogOpen(false); },
    onError: (e) => toast.error(`Failed to create: ${e.message}`),
  });

  const updateMutation = trpc.announcements.update.useMutation({
    onSuccess: () => { toast.success("Announcement updated"); refetchAll(); setIsEditDialogOpen(false); setEditingAnnouncement(null); },
    onError: (e) => toast.error(`Failed to update: ${e.message}`),
  });

  const deleteMutation = trpc.announcements.delete.useMutation({
    onSuccess: () => { toast.success("Announcement deleted"); refetchAll(); },
    onError: (e) => toast.error(`Failed to delete: ${e.message}`),
  });

  const publishMutation = trpc.announcements.publish.useMutation({
    onSuccess: () => { toast.success("Announcement published — now visible on the landing page"); refetchAll(); },
    onError: (e) => toast.error(`Failed to publish: ${e.message}`),
  });

  const archiveMutation = trpc.announcements.archive.useMutation({
    onSuccess: () => { toast.success("Announcement archived"); refetchAll(); },
    onError: (e) => toast.error(`Failed to archive: ${e.message}`),
  });

  const restoreMutation = trpc.announcements.restore.useMutation({
    onSuccess: () => { toast.success("Announcement restored to Draft"); refetchAll(); },
    onError: (e) => toast.error(`Failed to restore: ${e.message}`),
  });

  const resetForm = () => { setTitle(""); setContent(""); setType("feature"); setPriority(0); setLink(""); };

  const handleCreate = () => {
    if (!title.trim() || !content.trim()) { toast.error("Title and content are required"); return; }
    createMutation.mutate({ title: title.trim(), content: content.trim(), type, priority, link: link.trim() || undefined });
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
    if (!title.trim() || !content.trim()) { toast.error("Title and content are required"); return; }
    updateMutation.mutate({ id: editingAnnouncement.id, title: title.trim(), content: content.trim(), type, priority, link: link.trim() || "" });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to permanently delete this announcement?")) {
      deleteMutation.mutate({ id });
    }
  };

  const FormFields = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="ann-title">Title</Label>
        <Input id="ann-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., New AI Resume Builder Feature" />
      </div>
      <div>
        <Label htmlFor="ann-content">Content</Label>
        <Textarea id="ann-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Describe the announcement..." rows={4} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ann-type">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as AnnouncementType)}>
            <SelectTrigger id="ann-type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="feature">Feature</SelectItem>
              <SelectItem value="bugfix">Bug Fix</SelectItem>
              <SelectItem value="news">News</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="ann-priority">Priority</Label>
          <Input id="ann-priority" type="number" value={priority} onChange={(e) => setPriority(parseInt(e.target.value) || 0)} placeholder="0" />
        </div>
      </div>
      <div>
        <Label htmlFor="ann-link">Link (optional)</Label>
        <Input id="ann-link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Announcement Management</CardTitle>
            <CardDescription>
              Create and manage announcements. Published announcements appear on the landing page.
            </CardDescription>
          </div>
          <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active">
          <TabsList className="mb-4">
            <TabsTrigger value="active">
              Active
              {active.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">{active.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="archive">
              Archive
              {(archivedAnnouncements?.length ?? 0) > 0 && (
                <Badge variant="outline" className="ml-2 text-xs">{archivedAnnouncements?.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Active Tab — draft + published */}
          <TabsContent value="active">
            <AnnouncementList
              announcements={active}
              isLoading={isLoadingActive}
              emptyMessage="No active announcements. Create one and publish it to show it on the landing page."
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPublish={(id) => publishMutation.mutate({ id })}
              onArchive={(id) => { if (confirm("Archive this announcement? It will be removed from the landing page.")) archiveMutation.mutate({ id }); }}
            />
          </TabsContent>

          {/* Archive Tab — archived only */}
          <TabsContent value="archive">
            <AnnouncementList
              announcements={archivedAnnouncements}
              isLoading={isLoadingArchived}
              emptyMessage="No archived announcements."
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRestore={(id) => restoreMutation.mutate({ id })}
              showRestore
            />
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
            <DialogDescription>
              New announcements start as Draft. Publish them to display on the landing page.
            </DialogDescription>
          </DialogHeader>
          <FormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
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
            <DialogDescription>Update announcement details</DialogDescription>
          </DialogHeader>
          <FormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
