import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";
import type { GetAllUserRequestsStateInDomainQueryParams } from "custody";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domainId, limit, startingAfter, sortBy, sortOrder } = body;

    if (!domainId) {
      return NextResponse.json(
        { error: "domainId is required" },
        { status: 400 },
      );
    }

    const custody = getCustodySDK();

    const queryParams: GetAllUserRequestsStateInDomainQueryParams = {};
    if (limit !== undefined) queryParams.limit = Number(limit);
    if (startingAfter) queryParams.startingAfter = startingAfter;
    if (sortBy === "id") queryParams.sortBy = sortBy;
    if (sortOrder === "ASC" || sortOrder === "DESC")
      queryParams.sortOrder = sortOrder;

    const result = await custody.requests.userStatesInDomain(
      { domainId },
      queryParams,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching user request states in domain:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch user request states in domain",
      },
      { status: 500 },
    );
  }
}
