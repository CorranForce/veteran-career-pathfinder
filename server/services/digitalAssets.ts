import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { storagePut, storageGet } from "../storage";

/**
 * Digital Assets Service
 * Manages generation and delivery of digital products (PDFs, templates, etc.)
 */

/**
 * Generate the Pathfinder Optimized Prompt PDF
 */
export async function generatePromptPDF(): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Letter size
  const { height } = page.getSize();
  const fontSize = 12;
  const titleFontSize = 24;
  const headingFontSize = 16;

  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 40;

  // Title
  page.drawText("Pathfinder: AI Veteran Career Transition Strategist", {
    x: 40,
    y,
    size: titleFontSize,
    font: timesBold,
    color: rgb(0, 0.2, 0.4),
  });

  y -= 40;

  // Section: Role and Goal
  page.drawText("1. ROLE AND GOAL", {
    x: 40,
    y,
    size: headingFontSize,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

  y -= 25;

  const roleText =
    "You are an AI Veteran Career Transition Strategist. Your call sign is 'Pathfinder.' Your mission is to empower military veterans by translating their invaluable experience into clear, compelling, and actionable civilian career paths. You are a blend of a strategic advisor, practical career coach, and supportive mentor.";

  const roleLines = wrapText(roleText, 70);
  roleLines.forEach((line) => {
    page.drawText(line, {
      x: 40,
      y,
      size: fontSize,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
    y -= 15;
  });

  y -= 15;

  // Section: Guiding Principles
  page.drawText("2. GUIDING PRINCIPLES", {
    x: 40,
    y,
    size: headingFontSize,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

  y -= 25;

  const principles = [
    "Respect and Empathy: Recognize the immense value of military service.",
    "Clarity Over Jargon: Eradicate military acronyms and corporate buzzwords.",
    "Action Over Theory: Every piece of advice must be concrete and actionable.",
    "Focus and Direction: Provide 3-4 highly relevant career paths, not 50 possibilities.",
  ];

  principles.forEach((principle) => {
    const lines = wrapText(`• ${principle}`, 65);
    lines.forEach((line) => {
      page.drawText(line, {
        x: 50,
        y,
        size: fontSize,
        font: helvetica,
        color: rgb(0, 0, 0),
      });
      y -= 15;
    });
  });

  y -= 15;

  // Section: Output Blueprint
  page.drawText("3. OUTPUT BLUEPRINT", {
    x: 40,
    y,
    size: headingFontSize,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });

  y -= 25;

  const outputText =
    "Deliver your response in the following structured format:\n\n• Your Civilian Mission Brief (2-3 sentence summary)\n• Top 3-4 Civilian Career Paths (with job titles, day-in-life, gaps, salary)\n• Strategic Recommendation (quick comparison + top pick)\n• Your 30-Day Action Plan (week-by-week checklist)";

  const outputLines = wrapText(outputText, 70);
  outputLines.forEach((line) => {
    page.drawText(line, {
      x: 40,
      y,
      size: fontSize,
      font: helvetica,
      color: rgb(0, 0, 0),
    });
    y -= 15;
  });

  y -= 20;

  // Footer
  page.drawText("For the complete prompt with examples, visit pathfinder.manus.space", {
    x: 40,
    y: 20,
    size: 10,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  const pdfBytes = await pdfDoc.save();
  const buffer = Buffer.from(pdfBytes);

  // Upload to S3
  const { url } = await storagePut(
    `digital-assets/pathfinder-prompt-${Date.now()}.pdf`,
    buffer,
    "application/pdf"
  );

  return url;
}

/**
 * Generate Resume Translation Template PDF
 */
export async function generateResumeTemplatePDF(): Promise<string> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const { height } = page.getSize();

  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = height - 40;

  // Title
  page.drawText("Military-to-Civilian Resume Translation Template", {
    x: 40,
    y,
    size: 18,
    font: helveticaBold,
    color: rgb(0, 0.2, 0.4),
  });

  y -= 40;

  // Instructions
  page.drawText("Instructions: Use this template to translate your military experience into civilian language.", {
    x: 40,
    y,
    size: 10,
    font: helvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  y -= 30;

  // Section 1
  page.drawText("MILITARY EXPERIENCE", {
    x: 40,
    y,
    size: 12,
    font: helveticaBold,
  });

  y -= 20;
  page.drawText("MOS/Rating: ___________________________________", {
    x: 40,
    y,
    size: 11,
    font: helvetica,
  });

  y -= 20;
  page.drawText("Rank: ___________________________________", {
    x: 40,
    y,
    size: 11,
    font: helvetica,
  });

  y -= 20;
  page.drawText("Key Duties:", {
    x: 40,
    y,
    size: 11,
    font: helveticaBold,
  });

  y -= 20;
  page.drawText("1. ___________________________________", {
    x: 50,
    y,
    size: 11,
    font: helvetica,
  });

  y -= 20;
  page.drawText("2. ___________________________________", {
    x: 50,
    y,
    size: 11,
    font: helvetica,
  });

  y -= 20;
  page.drawText("3. ___________________________________", {
    x: 50,
    y,
    size: 11,
    font: helvetica,
  });

  y -= 40;

  // Section 2
  page.drawText("CIVILIAN TRANSLATION", {
    x: 40,
    y,
    size: 12,
    font: helveticaBold,
  });

  y -= 20;
  page.drawText("Civilian Job Title: ___________________________________", {
    x: 40,
    y,
    size: 11,
    font: helvetica,
  });

  y -= 20;
  page.drawText("Industry: ___________________________________", {
    x: 40,
    y,
    size: 11,
    font: helvetica,
  });

  y -= 20;
  page.drawText("Translated Responsibilities:", {
    x: 40,
    y,
    size: 11,
    font: helveticaBold,
  });

  y -= 20;
  page.drawText("1. ___________________________________", {
    x: 50,
    y,
    size: 11,
    font: helvetica,
  });

  y -= 20;
  page.drawText("2. ___________________________________", {
    x: 50,
    y,
    size: 11,
    font: helvetica,
  });

  y -= 20;
  page.drawText("3. ___________________________________", {
    x: 50,
    y,
    size: 11,
    font: helvetica,
  });

  const pdfBytes = await pdfDoc.save();
  const buffer = Buffer.from(pdfBytes);

  const { url } = await storagePut(
    `digital-assets/resume-template-${Date.now()}.pdf`,
    buffer,
    "application/pdf"
  );

  return url;
}

/**
 * Helper function to wrap text
 */
function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    if ((currentLine + word).length > maxCharsPerLine) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += (currentLine ? " " : "") + word;
    }
  });

  if (currentLine) lines.push(currentLine.trim());
  return lines;
}
