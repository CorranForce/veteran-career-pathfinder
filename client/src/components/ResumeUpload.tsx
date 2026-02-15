import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function ResumeUpload() {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const utils = trpc.useUtils();
  const uploadMutation = trpc.resume.uploadResume.useMutation({
    onSuccess: () => {
      utils.resume.getMyResumes.invalidate();
      setSelectedFile(null);
      toast.success("Resume uploaded successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload resume");
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF or Word document");
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(",")[1]; // Remove data:mime;base64, prefix

        await uploadMutation.mutateAsync({
          fileName: selectedFile.name,
          fileData: base64Data,
          mimeType: selectedFile.type,
        });

        setUploading(false);
      };

      reader.onerror = () => {
        toast.error("Failed to read file");
        setUploading(false);
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error("Upload error:", error);
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Resume
        </CardTitle>
        <CardDescription>
          Upload your resume for AI-powered ATS analysis and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary">
                <FileText className="h-8 w-8" />
                <div className="text-left">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-32"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedFile(null)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
              />
              <div className="space-y-2">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF or Word document (max 10MB)
                </p>
              </div>
            </label>
          )}
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium">What you'll get:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <span>ATS compatibility score (0-100)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <span>Military-to-civilian language translation suggestions</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <span>Keyword optimization recommendations</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <span>Formatting and structure improvements</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
