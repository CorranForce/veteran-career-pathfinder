import type { Request, Response } from "express";

/**
 * SendGrid Event Webhook Handler
 * 
 * Receives email event notifications from SendGrid (opens, clicks, bounces, etc.)
 * and stores them in the database for analytics.
 * 
 * SendGrid webhook documentation: https://docs.sendgrid.com/for-developers/tracking-events/event
 */
export async function handleSendGridEvents(req: Request, res: Response) {
  try {
    const events = req.body;

    if (!Array.isArray(events)) {
      console.warn("[SendGrid Webhook] Invalid payload: expected array");
      return res.status(400).json({ error: "Invalid payload" });
    }

    console.log(`[SendGrid Webhook] Received ${events.length} events`);

    // Import database functions
    const { getDb } = await import("./db");
    const { emailEvents, subscribers } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");
    
    const db = await getDb();
    if (!db) {
      console.error("[SendGrid Webhook] Database not available");
      return res.status(500).json({ error: "Database error" });
    }

    // Process each event
    for (const event of events) {
      try {
        const {
          event: eventType,
          email,
          timestamp,
          url,
          useragent,
          ip,
          sg_event_id,
          sg_message_id,
        } = event;

        // Find subscriber by email
        const [subscriber] = await db
          .select()
          .from(subscribers)
          .where(eq(subscribers.email, email.toLowerCase()))
          .limit(1);

        // Insert event into database
        await db.insert(emailEvents).values({
          subscriberId: subscriber?.id || null,
          email: email.toLowerCase(),
          eventType,
          timestamp: new Date(timestamp * 1000), // Convert Unix timestamp to Date
          url: url || null,
          userAgent: useragent || null,
          ip: ip || null,
          sgEventId: sg_event_id || null,
          sgMessageId: sg_message_id || null,
        });

        console.log(`[SendGrid Webhook] Stored ${eventType} event for ${email}`);
      } catch (eventError) {
        console.error("[SendGrid Webhook] Error processing event:", eventError);
        // Continue processing other events even if one fails
      }
    }

    // SendGrid expects a 200 response
    res.status(200).json({ received: events.length });
  } catch (error) {
    console.error("[SendGrid Webhook] Error handling events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
