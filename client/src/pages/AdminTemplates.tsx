import { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, Trash2, Edit, Download, FileText, Plus } from "lucide-react";
import { toast } from "sonner";

export default function AdminTemplates() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [uploadForm, setUploadForm] = useState({
    name: "",
    description: "",
    category: "General",
    fileData: "",
    fileName: "",
    mimeType: "",
  });

  const { data: templates, isLoading, refetch } = trpc.templates.getAllTemplates.useQuery();
  const createTemplate = trpc.templates.createTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template created successfully!");
      setIsUploadDialogOpen(false);
      setUploadForm({ name: "", description: "", category: "General", fileData: "", fileName: "", mimeType: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });

  const deleteTemplate = trpc.templates.deleteTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template deleted successfully!");
      setIsDeleteDialogOpen(false);
      setSelectedTemplateId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete template: ${error.message}`);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    toast.info("Processing file...");

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        setUploadForm((prev) => ({
          ...prev,
          fileData: base64,
          fileName: file.name,
          mimeType: file.type,
        }));
        toast.success("File ready for upload!");
      };
      reader.onerror = () => {
        toast.error("Failed to read file");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to process file. Please try again.");
    }
  };

  const handleCreateTemplate = () => {
    if (!uploadForm.name || !uploadForm.description || !uploadForm.fileData) {
      toast.error("Please fill in all required fields and upload a file");
      return;
    }

    createTemplate.mutate(uploadForm);
  };

  const handleDeleteClick = (templateId: number) => {
    setSelectedTemplateId(templateId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedTemplateId) {
      deleteTemplate.mutate({ templateId: selectedTemplateId });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      IT: "bg-blue-500",
      Management: "bg-purple-500",
      Technical: "bg-green-500",
      General: "bg-gray-500",
    };
    return colors[category] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Resume Template Management</h1>
            <p className="text-muted-foreground mt-1">
              Upload and manage ATS-optimized resume templates for veterans
            </p>
          </div>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Template
          </Button>
        </div>

        {/* Templates Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Templates</CardTitle>
            <CardDescription>
              {templates?.length || 0} template(s) available
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : templates && templates.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template: any) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(template.category)}>
                            {template.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Download className="h-4 w-4 text-muted-foreground" />
                            <span>{template.downloadCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={template.isActive ? "default" : "secondary"}>
                            {template.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(template.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(template.fileUrl, "_blank")}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(template.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-xl text-muted-foreground">No templates yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Click "Add Template" to upload your first template
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Dialog */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Template</DialogTitle>
              <DialogDescription>
                Upload an ATS-optimized resume template for veterans
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., IT & Cybersecurity Resume Template"
                  value={uploadForm.name}
                  onChange={(e) =>
                    setUploadForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the template and who it's for..."
                  rows={3}
                  value={uploadForm.description}
                  onChange={(e) =>
                    setUploadForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={uploadForm.category}
                  onValueChange={(value) =>
                    setUploadForm((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Template File (PDF) *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                  {uploadForm.fileData && (
                    <Badge variant="default" className="bg-green-500">
                      Uploaded
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload a PDF file (max 10MB)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUploadDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTemplate}
                disabled={createTemplate.isPending}
              >
                {createTemplate.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Create Template
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Template</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this template? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteTemplate.isPending}
              >
                {deleteTemplate.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
