import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";

const DOMAIN_ID = "5cd224fe-193e-8bce-c94c-c6c05245e2d1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intentId } = body;

    if (!intentId) {
      return NextResponse.json(
        { error: "intentId is required" },
        { status: 400 }
      );
    }

    const custody = getCustodySDK();
    const result = await custody.intents.get({
      domainId: DOMAIN_ID,
      intentId: intentId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting intent:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get intent",
      },
      { status: 500 }
    );
  }
}
