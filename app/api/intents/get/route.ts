import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intentId, domainId } = body;

    if (!intentId) {
      return NextResponse.json(
        { error: "intentId is required" },
        { status: 400 }
      );
    }

    if (!domainId) {
      return NextResponse.json(
        { error: "domainId is required" },
        { status: 400 }
      );
    }

    const custody = getCustodySDK();
    const result = await custody.intents.get({
      domainId: domainId,
      intentId: intentId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting intent:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to get intent",
      },
      { status: 500 }
    );
  }
}
