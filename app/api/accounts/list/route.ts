import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domainId } = body;

    if (!domainId) {
      return NextResponse.json(
        { error: "domainId is required" },
        { status: 400 }
      );
    }

    const custody = getCustodySDK();
    const result = await custody.accounts.list({
      domainId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing accounts:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list accounts",
      },
      { status: 500 }
    );
  }
}
