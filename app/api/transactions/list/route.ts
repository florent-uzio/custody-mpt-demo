import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domainId, accountId, ledgerId, sortBy, limit } = body;

    if (!domainId) {
      return NextResponse.json(
        { error: "domainId is required" },
        { status: 400 }
      );
    }

    const queryParams: {
      sortBy?:
        | "id"
        | "registeredAt"
        | "ledgerId"
        | "processingStatus"
        | "ledgerTransactionData.ledgerStatus"
        | "ledgerTransactionData.statusLastUpdatedAt";
      accountId?: string;
      ledgerId?: string;
      limit?: number;
    } = {};

    if (sortBy) {
      queryParams.sortBy = sortBy;
    }

    if (accountId) {
      queryParams.accountId = accountId;
    }

    if (ledgerId) {
      queryParams.ledgerId = ledgerId;
    }

    if (limit) {
      queryParams.limit = limit;
    }

    const custody = getCustodySDK();
    const result = await custody.transactions.transactions(
      {
        domainId,
      },
      queryParams
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting transactions:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get transactions",
      },
      { status: 500 }
    );
  }
}
