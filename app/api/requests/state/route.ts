import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, domainId } = body;

    if (!requestId || !domainId) {
      return NextResponse.json(
        { error: "requestId and domainId are required" },
        { status: 400 }
      );
    }

    const custody = getCustodySDK();
    const result = await custody.requests.state({
      requestId,
      domainId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching request state:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch request state",
      },
      { status: 500 }
    );
  }
}
