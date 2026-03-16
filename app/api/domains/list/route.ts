import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";
import { GetDomainsQueryParams } from "custody";

export async function POST(req: NextRequest) {
  try {
    const body: GetDomainsQueryParams = await req.json().catch(() => ({}));
    const custody = getCustodySDK();
    const result = await custody.domains.list(body);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing domains:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list domains",
      },
      { status: 500 },
    );
  }
}
