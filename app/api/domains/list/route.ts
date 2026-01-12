import { NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";

export async function POST() {
  try {
    const custody = getCustodySDK();
    const result = await custody.domains.list();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing domains:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list domains",
      },
      { status: 500 }
    );
  }
}
