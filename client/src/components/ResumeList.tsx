import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Loader2,
  Trash2,
  Download,
  Eye,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Streamdown } from "streamdown";

interface AnalysisResult {
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  keywordSuggestions: string[];
  formattingIssues: string[];
  summary: string;
}

export default function ResumeList() {
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [reanalyzingId, setReanalyzingId] = useState<number | null>(null);
  const [viewingAnalysis, setViewingAnalysis] = useState<AnalysisResult | null>(null);
  const [viewingScore, setViewingScore] = useState<number | null>(null);

  const { data: resumes, isLoading } = trpc.resume.getMyResumes.useQuery();
  const utils = trpc.useUtils();

  const analyzeMutation = trpc.resume.analyzeResume.useMutation({
    onSuccess: (data) => {
      utils.resume.getMyResumes.invalidate();
      setAnalyzingId(null);
      setViewingAnalysis(data.analysis);
      setViewingScore(data.analysis.atsScore);
      toast.success("Resume analyzed successfully!");
    },
    onError: (error) => {
      setAnalyzingId(null);
      toast.error(error.message || "Failed to analyze resume");
    },
  });

  const reanalyzeMutation = trpc.resume.analyzeResume.useMutation({
    onSuccess: (data) => {
      utils.resume.getMyResumes.invalidate();
      setReanalyzingId(null);
      setViewingAnalysis(data.analysis);
      setViewingScore(data.analysis.atsScore);
      toast.success("Resume re-analyzed successfully!");
    },
    onError: (error) => {
      setReanalyzingId(null);
      toast.error(error.message || "Failed to re-analyze resume");
    },
  });

  const deleteMutation = trpc.resume.deleteResume.useMutation({
    onSuccess: () => {
      utils.resume.getMyResumes.invalidate();
      toast.success("Resume deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete resume");
    },
  });

  const handleAnalyze = (resumeId: number) => {
    setAnalyzingId(resumeId);
    analyzeMutation.mutate({ resumeId });
  };

  const handleReanalyze = (resumeId: number) => {
    setReanalyzingId(resumeId);
    reanalyzeMutation.mutate({ resumeId });
  };

  const handleDelete = (resumeId: number) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      deleteMutation.mutate({ resumeId });
    }
  };

  const handleViewAnalysis = (analysisResult: string | null, atsScore: number | null) => {
    if (!analysisResult) {
      toast.error("No analysis available");
      return;
    }

    try {
      const analysis = JSON.parse(analysisResult) as AnalysisResult;
      setViewingAnalysis(analysis);
      setViewingScore(atsScore);
    } catch (error) {
      toast.error("Failed to parse analysis");
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "bg-gray-500";
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Analyzed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading resumes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!resumes || resumes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No resumes uploaded yet</p>
            <p className="text-sm">Upload your first resume to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>My Resumes</CardTitle>
          <CardDescription>
            View and manage your uploaded resumes and AI analysis results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="flex flex-col p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-3"
              >
                {/* Top row: file info + download/delete actions */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{resume.fileName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(resume.analysisStatus)}
                        {resume.atsScore !== null && (
                          <Badge className={getScoreColor(resume.atsScore)}>
                            ATS Score: {resume.atsScore}/100
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(resume.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Download + Delete always on the right */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button size="sm" variant="ghost" asChild>
                      <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(resume.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Second row: analysis action buttons */}
                <div className="flex items-center gap-2 pl-12">
                  {resume.analysisStatus === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => handleAnalyze(resume.id)}
                      disabled={analyzingId === resume.id}
                    >
                      {analyzingId === resume.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Analyze
                        </>
                      )}
                    </Button>
                  )}

                  {resume.analysisStatus === "completed" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleViewAnalysis(resume.analysisResult, resume.atsScore)
                        }
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Analysis
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReanalyze(resume.id)}
                        disabled={reanalyzingId === resume.id}
                        title="Re-run AI analysis to get fresh insights"
                      >
                        {reanalyzingId === resume.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Re-analyzing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            ReAnalyze
                          </>
                        )}
                      </Button>
                    </>
                  )}

                  {resume.analysisStatus === "failed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAnalyze(resume.id)}
                      disabled={analyzingId === resume.id}
                    >
                      {analyzingId === resume.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Retrying...
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Retry
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Dialog */}
      <Dialog open={!!viewingAnalysis} onOpenChange={() => setViewingAnalysis(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Resume Analysis
            </DialogTitle>
            <DialogDescription>
              Detailed ATS analysis and recommendations for your resume
            </DialogDescription>
          </DialogHeader>

          {viewingAnalysis && (
            <div className="space-y-6">
              {/* ATS Score */}
              <div className="text-center p-6 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">ATS Compatibility Score</p>
                <div className="flex items-center justify-center gap-4">
                  <div
                    className={`text-5xl font-bold ${
                      viewingScore && viewingScore >= 80
                        ? "text-green-500"
                        : viewingScore && viewingScore >= 60
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  >
                    {viewingScore}/100
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-sm text-muted-foreground">{viewingAnalysis.summary}</p>
              </div>

              {/* Strengths */}
              <div>
                <h3 className="font-semibold mb-2 text-green-600">Strengths</h3>
                <ul className="space-y-1">
                  {viewingAnalysis.strengths.map((strength, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <Streamdown>{strength}</Streamdown>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div>
                <h3 className="font-semibold mb-2 text-red-600">Areas for Improvement</h3>
                <ul className="space-y-1">
                  {viewingAnalysis.weaknesses.map((weakness, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-red-500 mt-1">✗</span>
                      <Streamdown>{weakness}</Streamdown>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="font-semibold mb-2">Recommendations</h3>
                <ul className="space-y-2">
                  {viewingAnalysis.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-primary font-bold mt-1">{i + 1}.</span>
                      <Streamdown>{rec}</Streamdown>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Keyword Suggestions */}
              <div>
                <h3 className="font-semibold mb-2">Keyword Suggestions</h3>
                <div className="flex flex-wrap gap-2">
                  {viewingAnalysis.keywordSuggestions.map((keyword, i) => (
                    <Badge key={i} variant="outline">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Formatting Issues */}
              {viewingAnalysis.formattingIssues.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Formatting Issues</h3>
                  <ul className="space-y-1">
                    {viewingAnalysis.formattingIssues.map((issue, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <Streamdown>{issue}</Streamdown>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
