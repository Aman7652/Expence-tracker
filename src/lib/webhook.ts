export interface WebhookPayload {
  action: "add" | "update" | "delete" | "batch_sync";
  id?: string;
  expenseId?: string;
  amount?: number;
  category?: string;
  note?: string;
  date?: string;
  expense_date?: string;
  expenses?: Array<{
    id: string;
    amount: number;
    category: string;
    note: string;
    expense_date: string;
  }>;
}

/**
 * Triggers the Google Sheets Webhook asynchronously.
 * Designed to NEVER block or crash the application if Google Sheets is slow, invalid, or offline.
 */
export async function triggerGoogleSheetWebhook(payload: WebhookPayload): Promise<{ success: boolean; message?: string }> {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;

  if (!webhookUrl || webhookUrl.trim() === "" || webhookUrl.includes("your-deployment-id")) {
    // Webhook not configured; silently skip
    return { success: false, message: "Google Sheet webhook URL is not configured." };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8", // Google Apps Script handles text/plain cleanly without CORS preflight
      },
      body: JSON.stringify(payload),
      redirect: "follow",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[Google Sheets Webhook] Server responded with status ${response.status}`);
      return { success: false, message: `Status: ${response.status}` };
    }

    const data = await response.json().catch(() => ({}));
    return { success: true, message: data.message || "Synced successfully" };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Network error";
    console.warn("[Google Sheets Webhook] Non-blocking warning:", message);
    return { success: false, message };
  }
}
