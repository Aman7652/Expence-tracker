import { NextRequest, NextResponse } from "next/server";
import { triggerGoogleSheetWebhook, WebhookPayload } from "@/lib/webhook";

export async function POST(req: NextRequest) {
  try {
    const payload: WebhookPayload = await req.json();

    if (!payload || !payload.action) {
      return NextResponse.json({ success: false, error: "Action is required" }, { status: 400 });
    }

    const result = await triggerGoogleSheetWebhook(payload);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("[API Webhook] Error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
