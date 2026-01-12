import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domainId, accountId } = body;

    if (!domainId || !accountId) {
      return NextResponse.json(
        { error: "domainId and accountId are required" },
        { status: 400 }
      );
    }

    const custody = getCustodySDK();
    const result = await custody.accounts.addresses({
      domainId,
      accountId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching account addresses:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch account addresses",
      },
      { status: 500 }
    );
  }
}
