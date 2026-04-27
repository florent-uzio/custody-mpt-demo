import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domainId, policyId } = body;

    if (!domainId) {
      return NextResponse.json(
        { error: "domainId is required" },
        { status: 400 },
      );
    }

    if (!policyId) {
      return NextResponse.json(
        { error: "policyId is required" },
        { status: 400 },
      );
    }

    const custody = getCustodySDK();
    const result = await custody.policies.get({ domainId, policyId });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting policy:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to get policy",
      },
      { status: 500 },
    );
  }
}
