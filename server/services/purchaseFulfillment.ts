import { getDb } from "../db";
import { purchases, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendPurchaseConfirmationEmail } from "./email";
import { generatePromptPDF, generateResumeTemplatePDF } from "./digitalAssets";

/**
 * Purchase Fulfillment Service
 * Handles post-purchase delivery of digital products
 */

/**
 * Fulfill a purchase by generating and sending digital assets
 */
export async function fulfillPurchase(purchaseId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[Fulfillment] Database not available");
      return false;
    }

    // Get purchase details
    const purchase = await db
      .select()
      .from(purchases)
      .where(eq(purchases.id, purchaseId))
      .limit(1);

    if (!purchase || purchase.length === 0) {
      console.error(`[Fulfillment] Purchase ${purchaseId} not found`);
      return false;
    }

    const purchaseRecord = purchase[0];

    // Get user details
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, purchaseRecord.userId))
      .limit(1);

    if (!user || user.length === 0) {
      console.error(`[Fulfillment] User ${purchaseRecord.userId} not found`);
      return false;
    }

    const userRecord = user[0];

    // Generate digital assets based on product
    let promptPdfUrl: string | null = null;
    let resumeTemplatePdfUrl: string | null = null;

    if (
      purchaseRecord.productType === "premium_prompt" ||
      purchaseRecord.productType === "pro_subscription"
    ) {
      console.log(`[Fulfillment] Generating prompt PDF for purchase ${purchaseId}`);
      promptPdfUrl = await generatePromptPDF();

      console.log(`[Fulfillment] Generating resume template PDF for purchase ${purchaseId}`);
      resumeTemplatePdfUrl = await generateResumeTemplatePDF();
    }

    // Update purchase with asset URLs
    await db
      .update(purchases)
      .set({
        promptPdfUrl,
        resumeTemplatePdfUrl,
        fulfilledAt: new Date(),
      })
      .where(eq(purchases.id, purchaseId));

    // Send confirmation email with download links
    await sendPurchaseConfirmationEmail({
      email: userRecord.email || "",
      name: userRecord.name || "Veteran",
      productType: purchaseRecord.productType,
      promptPdfUrl,
      resumeTemplatePdfUrl,
    });

    console.log(`[Fulfillment] Purchase ${purchaseId} fulfilled successfully`);
    return true;
  } catch (error) {
    console.error(`[Fulfillment] Error fulfilling purchase ${purchaseId}:`, error);
    return false;
  }
}

/**
 * Get download URLs for a user's purchases
 */
export async function getUserDownloads(userId: number) {
  try {
    const db = await getDb();
    if (!db) return [];

    const userPurchases = await db
      .select()
      .from(purchases)
      .where(eq(purchases.userId, userId));

    return userPurchases
      .filter((p) => p.fulfilledAt !== null)
      .map((p) => ({
        id: p.id,
        productType: p.productType,
        purchaseDate: p.createdAt,
        promptPdfUrl: p.promptPdfUrl,
        resumeTemplatePdfUrl: p.resumeTemplatePdfUrl,
      }));
  } catch (error) {
    console.error("[Fulfillment] Error getting user downloads:", error);
    return [];
  }
}
