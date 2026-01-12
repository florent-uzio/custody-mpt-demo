import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domainId, transactionId } = body;

    if (!domainId) {
      return NextResponse.json(
        { error: "domainId is required" },
        { status: 400 }
      );
    }

    if (!transactionId) {
      return NextResponse.json(
        { error: "transactionId is required" },
        { status: 400 }
      );
    }

    const custody = getCustodySDK();
    const result = await custody.transactions.transaction({
      domainId,
      transactionId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting transaction:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get transaction",
      },
      { status: 500 }
    );
  }
}
