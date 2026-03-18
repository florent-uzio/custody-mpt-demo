import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";
import type { GetAllUserRequestsStateQueryParams } from "custody";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { limit, startingAfter, sortBy, sortOrder } = body;

    const custody = getCustodySDK();

    const queryParams: GetAllUserRequestsStateQueryParams = {};
    if (limit !== undefined) queryParams.limit = Number(limit);
    if (startingAfter) queryParams.startingAfter = startingAfter;
    if (sortBy === "id") queryParams.sortBy = sortBy;
    if (sortOrder === "ASC" || sortOrder === "DESC")
      queryParams.sortOrder = sortOrder;

    const result = await custody.requests.userStates(queryParams);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching user request states:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch user request states",
      },
      { status: 500 },
    );
  }
}
