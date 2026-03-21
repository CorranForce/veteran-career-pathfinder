import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  createResume,
  getUserResumes,
  getResumeById,
  updateResumeAnalysis,
  deleteResume,
} from "../db";
import { storagePut } from "../storage";
import { invokeLLM } from "../_core/llm";
import { TRPCError } from "@trpc/server";
import { extractPdfTextFromUrl, cleanExtractedText } from "../utils/pdfExtractor";

// Helper to generate random suffix for file keys
function randomSuffix() {
  return Math.random().toString(36).substring(2, 10);
}

export const resumeRouter = router({
  /**
   * Upload resume file to S3 and create database record
   */
  uploadResume: protectedProcedure
    .input(
      z.object({
        fileName: z.string().max(255),
        fileData: z.string(), // base64 encoded file
        mimeType: z.string().max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Decode base64 file data
        const fileBuffer = Buffer.from(input.fileData, "base64");
        const fileSize = fileBuffer.length;

        // Validate file size (max 10MB)
        const MAX_FILE_SIZE = 10 * 1024 * 1024;
        if (fileSize > MAX_FILE_SIZE) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "File size exceeds 10MB limit",
          });
        }

        // Validate file type
        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!allowedTypes.includes(input.mimeType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Only PDF and Word documents are allowed",
          });
        }

        // Upload to S3
        const fileKey = `${ctx.user.id}-resumes/${input.fileName}-${randomSuffix()}`;
        const { url: fileUrl } = await storagePut(fileKey, fileBuffer, input.mimeType);

        // Create database record
        const result = await createResume({
          userId: ctx.user.id,
          fileName: input.fileName,
          fileUrl,
          fileKey,
          fileSize,
          mimeType: input.mimeType,
          analysisStatus: "pending",
        });

        if (!result) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to save resume record",
          });
        }

        // Get the created resume to return its ID
        const resumes = await getUserResumes(ctx.user.id);
        const latestResume = resumes[resumes.length - 1];

        // Log activity
        const { logActivity } = await import("../db");
        await logActivity({
          activityType: "resume_upload",
          userId: ctx.user.id,
          userName: ctx.user.name || null,
          userEmail: ctx.user.email || null,
          description: `${ctx.user.name || ctx.user.email || "User"} uploaded a resume: ${input.fileName}`,
          metadata: JSON.stringify({ fileName: input.fileName, fileSize, mimeType: input.mimeType }),
        });

        return {
          success: true,
          resumeId: latestResume?.id || 0,
          message: "Resume uploaded successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[Resume Upload] Error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload resume",
        });
      }
    }),

  /**
   * Get all resumes for current user
   */
  getMyResumes: protectedProcedure.query(async ({ ctx }) => {
    return await getUserResumes(ctx.user.id);
  }),

  /**
   * Get single resume by ID (must belong to user)
   */
  getResume: protectedProcedure
    .input(z.object({ resumeId: z.number() }))
    .query(async ({ ctx, input }) => {
      const resume = await getResumeById(input.resumeId);

      if (!resume) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resume not found",
        });
      }

      if (resume.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this resume",
        });
      }

      return resume;
    }),

  /**
   * Analyze resume using AI for ATS best practices
   */
  analyzeResume: protectedProcedure
    .input(z.object({ resumeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const resume = await getResumeById(input.resumeId);

      if (!resume) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resume not found",
        });
      }

      if (resume.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this resume",
        });
      }

      try {
        // Extract text from PDF
        let resumeText = "";
        if (resume.mimeType === "application/pdf") {
          try {
            const rawText = await extractPdfTextFromUrl(resume.fileUrl);
            resumeText = cleanExtractedText(rawText);
          } catch (error) {
            console.error("[Resume Analysis] PDF extraction failed:", error);
            // Fall back to metadata-based analysis if extraction fails
          }
        }

        const prompt = `You are a senior ATS (Applicant Tracking System) optimization specialist and military career transition expert. You have deep knowledge of how modern ATS platforms (Workday, Taleo, iCIMS, Greenhouse, Lever, BambooHR, SAP SuccessFactors, and SmartRecruiters) parse, rank, and filter resumes.

## Deep ATS Best Practices Knowledge Base

### ATS Parsing Rules
- ATS systems parse resumes top-to-bottom and left-to-right; multi-column layouts, tables, text boxes, headers/footers, and graphics are frequently skipped or garbled
- File format matters: plain .docx or single-column PDF (text-based, not scanned) parse most reliably; avoid image-based PDFs
- Font: use standard fonts (Arial, Calibri, Times New Roman, Garamond) at 10–12pt; avoid decorative fonts
- Avoid: tables, text boxes, columns, graphics, logos, headers/footers, fancy bullets (use plain hyphens or standard bullets)
- Section headers must be standard labels: "Work Experience", "Education", "Skills", "Certifications" — non-standard headers like "My Journey" are often missed
- Contact info must be in the body, not in a header/footer, and must include: name, phone, email, LinkedIn URL, city/state

### Keyword Optimization (2024–2025 Best Practices)
- ATS uses exact-match and semantic matching; include both spelled-out terms AND acronyms (e.g., "Project Management Professional (PMP)")
- Mirror the exact language from the job description; do not paraphrase
- Place high-priority keywords in the top third of the resume and in a dedicated Skills section
- Use industry-standard job titles (not military equivalents) as the actual job title in each role
- Include a "Core Competencies" or "Skills" section near the top with 12–18 keyword-rich skills
- Avoid keyword stuffing; each keyword should appear in context 2–3 times maximum

### Military-to-Civilian Translation Rules
- Replace ALL military jargon, MOS codes, and acronyms with civilian equivalents
- Translate rank to civilian equivalent: E-7/E-8/E-9 → Senior Manager/Director; O-3/O-4 → Manager/Senior Manager; O-5/O-6 → Director/VP
- Reframe military duties as civilian accomplishments: "Led 12-person team" not "Commanded a squad"
- Quantify EVERYTHING: budget managed, team size, equipment value, % improvement, number of personnel trained
- Use civilian action verbs: Managed, Led, Developed, Implemented, Optimized, Coordinated, Delivered, Reduced, Increased
- Remove: classified references, unit designations (e.g., "3rd Infantry Division"), deployment locations unless relevant

### ATS Scoring Factors (weighted)
1. Keyword match rate vs. job description (35%)
2. Chronological work history completeness with dates (20%)
3. Education and certifications match (15%)
4. Skills section keyword density (15%)
5. Formatting parsability (10%)
6. Contact information completeness (5%)

### Common ATS Failure Points
- Missing or non-standard section headers
- Dates formatted inconsistently (use MM/YYYY or Month YYYY)
- Employment gaps not addressed
- Objective statement instead of Professional Summary
- Skills buried at the bottom instead of near the top
- No LinkedIn URL or outdated LinkedIn URL
- Resume longer than 2 pages for <10 years experience
- Using "I", "my", or first-person language
- Passive voice instead of active voice with strong verbs

---

## Resume to Analyze

Resume File: ${resume.fileName}
File Type: ${resume.mimeType}

${resumeText ? `Resume Content:\n${resumeText.substring(0, 5000)}` : "Note: Text extraction not available for this file type. Provide analysis based on file metadata and general best practices, noting that a text-based PDF or .docx would enable deeper analysis."}

---

## Instructions

Using the ATS best practices knowledge above, provide a thorough, specific analysis. For each weakness and recommendation, cite the specific ATS rule or best practice it violates or addresses. Be specific — do not give generic advice. Reference actual content from the resume where possible.

Provide your analysis in the following JSON format:
{
  "atsScore": <integer 0-100 based on the weighted scoring factors above>,
  "strengths": [<list of 3-5 specific strong points with evidence from the resume>],
  "weaknesses": [<list of 3-5 specific ATS failure points found in this resume>],
  "recommendations": [<list of 5-8 specific, actionable recommendations with the exact change to make>],
  "keywordSuggestions": [<list of 8-12 high-value industry keywords missing from this resume>],
  "formattingIssues": [<list of specific ATS-breaking formatting problems found>],
  "summary": "<2-3 sentence overall assessment referencing the ATS score and top priority fix>"
}`;

        const llmResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are an expert ATS resume reviewer. Always respond with valid JSON only.",
            },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "resume_analysis",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  atsScore: {
                    type: "integer",
                    description: "ATS compatibility score from 0-100",
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of resume strengths",
                  },
                  weaknesses: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of areas for improvement",
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Actionable recommendations",
                  },
                  keywordSuggestions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Industry keywords to add",
                  },
                  formattingIssues: {
                    type: "array",
                    items: { type: "string" },
                    description: "Formatting problems",
                  },
                  summary: {
                    type: "string",
                    description: "Overall assessment summary",
                  },
                },
                required: [
                  "atsScore",
                  "strengths",
                  "weaknesses",
                  "recommendations",
                  "keywordSuggestions",
                  "formattingIssues",
                  "summary",
                ],
                additionalProperties: false,
              },
            },
          },
        });

        const messageContent = llmResponse.choices[0]?.message?.content;
        const analysisText = typeof messageContent === 'string' ? messageContent : "{}";
        const analysis = JSON.parse(analysisText);

        // Update database with analysis results
        await updateResumeAnalysis(input.resumeId, {
          analysisStatus: "completed",
          analysisResult: analysisText || undefined,
          atsScore: analysis.atsScore || 0,
        });

        return {
          success: true,
          analysis,
        };
      } catch (error) {
        console.error("[Resume Analysis] Error:", error);

        // Mark as failed
        await updateResumeAnalysis(input.resumeId, {
          analysisStatus: "failed",
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze resume",
        });
      }
    }),

  /**
   * Delete resume
   */
  deleteResume: protectedProcedure
    .input(z.object({ resumeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const resume = await getResumeById(input.resumeId);

      if (!resume) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resume not found",
        });
      }

      if (resume.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this resume",
        });
      }

      const success = await deleteResume(input.resumeId);

      if (!success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete resume",
        });
      }

      return {
        success: true,
        message: "Resume deleted successfully",
      };
    }),
});
