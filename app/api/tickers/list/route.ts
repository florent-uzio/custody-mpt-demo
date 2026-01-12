import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";
import { GetTickersQueryParams } from "custody/dist/services/tickers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      ledgerIds,
      limit,
      startingAfter,
      sortBy,
      sortOrder,
      kind,
      names,
      symbols,
      validationStatus,
      locks,
    } = body;

    // Build query params - only include defined values
    const queryParams: GetTickersQueryParams = {};

    if (ledgerIds && Array.isArray(ledgerIds) && ledgerIds.length > 0) {
      queryParams.ledgerId = ledgerIds;
    }

    if (limit !== undefined && limit !== null && limit !== "") {
      queryParams.limit = Number(limit);
    }

    if (startingAfter) {
      queryParams.startingAfter = startingAfter;
    }

    if (sortBy) {
      queryParams.sortBy = sortBy;
    }

    if (sortOrder) {
      queryParams.sortOrder = sortOrder;
    }

    if (kind) {
      queryParams.kind = kind;
    }

    if (names && Array.isArray(names) && names.length > 0) {
      queryParams.name = names;
    }

    if (symbols && Array.isArray(symbols) && symbols.length > 0) {
      queryParams.symbol = symbols;
    }

    if (validationStatus) {
      queryParams.validationStatus = validationStatus;
    }

    if (locks && Array.isArray(locks) && locks.length > 0) {
      queryParams.lock = locks;
    }

    const custody = getCustodySDK();
    const result = await custody.tickers.list(queryParams);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing tickers:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list tickers",
      },
      { status: 500 }
    );
  }
}
