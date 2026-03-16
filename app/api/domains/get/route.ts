import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";

export async function POST(req: NextRequest) {
  try {
    const { domainId } = await req.json();

    if (!domainId) {
      return NextResponse.json(
        { error: "domainId is required" },
        { status: 400 },
      );
    }

    const custody = getCustodySDK();
    const result = await custody.domains.get({ domainId });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting domain:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get domain",
      },
      { status: 500 },
    );
  }
}
