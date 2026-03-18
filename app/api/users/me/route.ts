import { NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";

export async function GET() {
  try {
    const custody = getCustodySDK();
    const result = await custody.users.me();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching me:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch me" },
      { status: 500 },
    );
  }
}
