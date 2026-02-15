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

        const prompt = `You are an expert ATS (Applicant Tracking System) resume reviewer specializing in helping military veterans transition to civilian careers.

Analyze this resume and provide detailed feedback following ATS best practices:

Resume File: ${resume.fileName}
File Type: ${resume.mimeType}

${resumeText ? `Resume Content:\n${resumeText.substring(0, 4000)}` : "Note: Text extraction not available for this file type. Analysis based on file metadata."}

Provide your analysis in the following JSON format:
{
  "atsScore": <number 0-100>,
  "strengths": [<list of 3-5 strong points>],
  "weaknesses": [<list of 3-5 areas for improvement>],
  "recommendations": [<list of 5-7 specific actionable recommendations>],
  "keywordSuggestions": [<list of 5-10 industry keywords to add>],
  "formattingIssues": [<list of formatting problems if any>],
  "summary": "<2-3 sentence overall assessment>"
}

Focus on:
1. ATS compatibility (formatting, keywords, structure)
2. Military-to-civilian language translation
3. Quantifiable achievements and impact
4. Keyword optimization for target roles
5. Professional formatting and readability
6. Action verbs and power words
7. Skills section optimization`;

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
