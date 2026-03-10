import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domainId, transferId } = body;

    if (!domainId) {
      return NextResponse.json(
        { error: "domainId is required" },
        { status: 400 }
      );
    }

    if (!transferId) {
      return NextResponse.json(
        { error: "transferId is required" },
        { status: 400 }
      );
    }

    const custody = getCustodySDK();
    const result = await custody.transactions.transfer({
      domainId,
      transferId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting transfer:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get transfer",
      },
      { status: 500 }
    );
  }
}
