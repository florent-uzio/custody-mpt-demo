import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domainId, limit, startingAfter, sortBy, sortOrder, status } = body;

    if (!domainId) {
      return NextResponse.json(
        { error: "domainId is required" },
        { status: 400 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryParams: Record<string, any> = {};
    if (limit !== undefined) queryParams.limit = Number(limit);
    if (startingAfter) queryParams.startingAfter = startingAfter;
    if (sortBy) queryParams.sortBy = sortBy;
    if (sortOrder) queryParams.sortOrder = sortOrder;
    if (status && Array.isArray(status)) queryParams["state.status"] = status;

    const custody = getCustodySDK();
    const result = await custody.intents.list({ domainId }, queryParams);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing intents:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list intents",
      },
      { status: 500 },
    );
  }
}
