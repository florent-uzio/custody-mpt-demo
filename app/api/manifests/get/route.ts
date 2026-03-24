import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domainId, accountId, manifestId } = body;

    if (!domainId) {
      return NextResponse.json(
        { error: "domainId is required" },
        { status: 400 },
      );
    }

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 },
      );
    }

    if (!manifestId) {
      return NextResponse.json(
        { error: "manifestId is required" },
        { status: 400 },
      );
    }

    const custody = getCustodySDK();
    const result = await custody.accounts.getManifest({
      domainId,
      accountId,
      manifestId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting manifest:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get manifest",
      },
      { status: 500 },
    );
  }
}
