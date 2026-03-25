import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      domainId,
      accountId,
      limit,
      startingAfter,
      sortBy,
      sortOrder,
      contentType,
      processingStatus,
    } = body;

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryParams: Record<string, any> = {};
    if (limit !== undefined) queryParams.limit = Number(limit);
    if (startingAfter) queryParams.startingAfter = startingAfter;
    if (sortBy) queryParams.sortBy = sortBy;
    if (sortOrder) queryParams.sortOrder = sortOrder;
    if (contentType && Array.isArray(contentType))
      queryParams["content.type"] = contentType;
    if (processingStatus)
      queryParams["additionalDetails.processingStatus"] = processingStatus;

    const custody = getCustodySDK();
    const result = await custody.accounts.getManifests(
      { domainId, accountId },
      queryParams,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing manifests:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list manifests",
      },
      { status: 500 },
    );
  }
}
