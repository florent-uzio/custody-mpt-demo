import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domainId, kind, quarantined } = body;

    if (!domainId) {
      return NextResponse.json(
        { error: "domainId is required" },
        { status: 400 }
      );
    }

    const custody = getCustodySDK();

    const queryParams: {
      kind?: string;
      quarantined?: boolean;
    } = {};

    if (kind) {
      queryParams.kind = kind;
    }

    if (quarantined !== undefined) {
      queryParams.quarantined = quarantined;
    }

    const result = await custody.transactions.transfers(
      {
        domainId,
      },
      queryParams
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting transfers:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get transfers",
      },
      { status: 500 }
    );
  }
}
