import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tickerId } = body;

    if (!tickerId) {
      return NextResponse.json(
        { error: "tickerId is required" },
        { status: 400 }
      );
    }

    const custody = getCustodySDK();
    const result = await custody.tickers.get({
      tickerId: tickerId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting ticker:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get ticker",
      },
      { status: 500 }
    );
  }
}
