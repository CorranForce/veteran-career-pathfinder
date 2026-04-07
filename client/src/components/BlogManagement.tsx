import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Edit,
  Trash2,
  Archive,
  CheckCircle,
  Eye,
  EyeOff,
  MoreVertical,
  BookOpen,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type BlogStatus = "draft" | "published" | "archived";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  authorId: number;
  authorName: string;
  status: BlogStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const PAGE_SIZE = 5;

function StatusBadge({ status }: { status: BlogStatus }) {
  const map: Record<BlogStatus, { label: string; className: string }> = {
    draft: { label: "Draft", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
    published: { label: "Published", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
    archived: { label: "Archived", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  };
  const { label, className } = map[status];
  return <Badge className={className}>{label}</Badge>;
}

interface PostListProps {
  posts: BlogPost[] | undefined;
  isLoading: boolean;
  emptyMessage: string;
  onEdit: (p: BlogPost) => void;
  onDelete: (id: number) => void;
  onPublish?: (id: number) => void;
  onUnpublish?: (id: number) => void;
  onArchive?: (id: number) => void;
}

function PostList({ posts, isLoading, emptyMessage, onEdit, onDelete, onPublish, onUnpublish, onArchive }: PostListProps) {
  const [page, setPage] = useState(1);
  const total = posts?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    if (!posts) return [];
    const start = (safePage - 1) * PAGE_SIZE;
    return posts.slice(start, start + PAGE_SIZE);
  }, [posts, safePage]);

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Loading posts…</div>;

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {paginated.map((post) => (
        <div key={post.id} className="border rounded-lg p-4 space-y-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{post.title}</h3>
                <StatusBadge status={post.status} />
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-1">{post.excerpt}</p>
              <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                <span>By {post.authorName}</span>
                <span>· Created {format(new Date(post.createdAt), "MMM d, yyyy")}</span>
                {post.publishedAt && (
                  <span>· Published {format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
                )}
                <span className="font-mono opacity-60">/{post.slug}</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(post)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                {post.status === "published" && (
                  <DropdownMenuItem asChild>
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> View Live
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {post.status === "draft" && onPublish && (
                  <DropdownMenuItem onClick={() => onPublish(post.id)}>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Publish
                  </DropdownMenuItem>
                )}
                {post.status === "published" && onUnpublish && (
                  <DropdownMenuItem onClick={() => onUnpublish(post.id)}>
                    <EyeOff className="mr-2 h-4 w-4" /> Unpublish (to Draft)
                  </DropdownMenuItem>
                )}
                {post.status !== "archived" && onArchive && (
                  <DropdownMenuItem onClick={() => onArchive(post.id)}>
                    <Archive className="mr-2 h-4 w-4" /> Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(post.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            Page {safePage} of {totalPages} ({total} posts)
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  metaTitle: "",
  metaDescription: "",
};

export function BlogManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: allPosts, isLoading, refetch } = trpc.blog.getAll.useQuery();

  const active = useMemo(() => allPosts?.filter((p) => p.status !== "archived") ?? [], [allPosts]);
  const archived = useMemo(() => allPosts?.filter((p) => p.status === "archived") ?? [], [allPosts]);

  const resetForm = () => setForm(EMPTY_FORM);

  const createMutation = trpc.blog.create.useMutation({
    onSuccess: () => { toast.success("Blog post created as draft"); refetch(); resetForm(); setIsCreateOpen(false); },
    onError: (e) => toast.error(`Failed to create: ${e.message}`),
  });

  const updateMutation = trpc.blog.update.useMutation({
    onSuccess: () => { toast.success("Blog post updated"); refetch(); setIsEditOpen(false); setEditingPost(null); },
    onError: (e) => toast.error(`Failed to update: ${e.message}`),
  });

  const publishMutation = trpc.blog.publish.useMutation({
    onSuccess: () => { toast.success("Post published"); refetch(); },
    onError: (e) => toast.error(`Failed to publish: ${e.message}`),
  });

  const unpublishMutation = trpc.blog.unpublish.useMutation({
    onSuccess: () => { toast.success("Post moved back to draft"); refetch(); },
    onError: (e) => toast.error(`Failed to unpublish: ${e.message}`),
  });

  const archiveMutation = trpc.blog.archive.useMutation({
    onSuccess: () => { toast.success("Post archived"); refetch(); },
    onError: (e) => toast.error(`Failed to archive: ${e.message}`),
  });

  const deleteMutation = trpc.blog.delete.useMutation({
    onSuccess: () => { toast.success("Post permanently deleted"); refetch(); },
    onError: (e) => toast.error(`Failed to delete: ${e.message}`),
  });

  const handleCreate = () => {
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      toast.error("Title, excerpt, and content are required");
      return;
    }
    createMutation.mutate({
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      coverImageUrl: form.coverImageUrl.trim() || undefined,
      metaTitle: form.metaTitle.trim() || undefined,
      metaDescription: form.metaDescription.trim() || undefined,
    });
  };

  const handleUpdate = () => {
    if (!editingPost) return;
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      toast.error("Title, excerpt, and content are required");
      return;
    }
    updateMutation.mutate({
      id: editingPost.id,
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      coverImageUrl: form.coverImageUrl.trim() || undefined,
      metaTitle: form.metaTitle.trim() || undefined,
      metaDescription: form.metaDescription.trim() || undefined,
    });
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      coverImageUrl: post.coverImageUrl ?? "",
      metaTitle: post.metaTitle ?? "",
      metaDescription: post.metaDescription ?? "",
    });
    setIsEditOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Permanently delete this blog post? This cannot be undone.")) {
      deleteMutation.mutate({ id });
    }
  };

  const FormFields = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      <div>
        <Label htmlFor="blog-title">Title *</Label>
        <Input
          id="blog-title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="e.g., 5 Ways Veterans Excel in Project Management"
        />
      </div>
      <div>
        <Label htmlFor="blog-excerpt">Excerpt * <span className="text-xs text-muted-foreground">(shown in previews)</span></Label>
        <Textarea
          id="blog-excerpt"
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          placeholder="A brief summary of the post…"
          rows={2}
        />
      </div>
      <div>
        <Label htmlFor="blog-content">Content * <span className="text-xs text-muted-foreground">(Markdown supported)</span></Label>
        <Textarea
          id="blog-content"
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          placeholder="Write the full post content here…"
          rows={10}
          className="font-mono text-sm"
        />
      </div>
      <div>
        <Label htmlFor="blog-cover">Cover Image URL <span className="text-xs text-muted-foreground">(optional)</span></Label>
        <Input
          id="blog-cover"
          value={form.coverImageUrl}
          onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))}
          placeholder="https://..."
        />
      </div>
      <div className="border-t pt-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">SEO (optional)</p>
        <div className="space-y-3">
          <div>
            <Label htmlFor="blog-meta-title">Meta Title</Label>
            <Input
              id="blog-meta-title"
              value={form.metaTitle}
              onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))}
              placeholder="Defaults to post title if blank"
            />
          </div>
          <div>
            <Label htmlFor="blog-meta-desc">Meta Description</Label>
            <Textarea
              id="blog-meta-desc"
              value={form.metaDescription}
              onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
              placeholder="Defaults to excerpt if blank"
              rows={2}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const draftCount = active.filter((p) => p.status === "draft").length;
  const publishedCount = active.filter((p) => p.status === "published").length;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> Blog Management
              </CardTitle>
              <CardDescription>
                Create, edit, publish, and archive blog posts. Posts are accessible at <code className="text-xs">/blog/:slug</code>.
              </CardDescription>
            </div>
            <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> New Post
            </Button>
          </div>
          {/* Stats row */}
          <div className="flex gap-4 pt-2">
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{publishedCount}</span> published
            </span>
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{draftCount}</span> draft
            </span>
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{archived.length}</span> archived
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList className="mb-4">
              <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
              <TabsTrigger value="archived">Archived ({archived.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
              <PostList
                posts={active}
                isLoading={isLoading}
                emptyMessage="No active posts yet. Create your first blog post."
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPublish={(id) => publishMutation.mutate({ id })}
                onUnpublish={(id) => unpublishMutation.mutate({ id })}
                onArchive={(id) => archiveMutation.mutate({ id })}
              />
            </TabsContent>
            <TabsContent value="archived">
              <PostList
                posts={archived}
                isLoading={isLoading}
                emptyMessage="No archived posts."
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Blog Post</DialogTitle>
            <DialogDescription>New posts are saved as drafts. Publish when ready.</DialogDescription>
          </DialogHeader>
          <FormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating…" : "Create Draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>
              {editingPost && (
                <span className="font-mono text-xs">/{editingPost.slug}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <FormFields />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditOpen(false); setEditingPost(null); }}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
