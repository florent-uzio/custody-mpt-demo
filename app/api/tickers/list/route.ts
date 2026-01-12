import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ledgerIds } = body;

    if (!ledgerIds || !Array.isArray(ledgerIds) || ledgerIds.length === 0) {
      return NextResponse.json(
        { error: "ledgerIds array is required and must not be empty" },
        { status: 400 }
      );
    }

    const custody = getCustodySDK();
    const result = await custody.tickers.list({
      ledgerId: ledgerIds,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing tickers:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list tickers",
      },
      { status: 500 }
    );
  }
}
