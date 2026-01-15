import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK, getCurrentUser } from "@/app/lib/custody";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import type { Core_ProposeIntentBody } from "custody";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { issuanceId, accountId, domainId } = body;

    if (!domainId) {
      return NextResponse.json(
        { error: "domainId is required" },
        { status: 400 }
      );
    }

    if (!issuanceId) {
      return NextResponse.json(
        { error: "issuanceId is required" },
        { status: 400 }
      );
    }

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

    // Get current user info from the SDK
    const currentUser = await getCurrentUser(domainId);

    // Build the MPT Authorize intent request
    const mptAuthorizeRequest: Core_ProposeIntentBody = {
      request: {
        author: {
          id: currentUser.userId,
          domainId: currentUser.domainId,
        },
        expiryAt: dayjs().add(1, "day").toISOString(),
        targetDomainId: currentUser.domainId,
        id: uuidv4(),
        payload: {
          id: uuidv4(),
          ledgerId: "xrpl-testnet-august-2024",
          accountId: accountId,
          parameters: {
            type: "XRPL",
            feeStrategy: {
              priority: "Medium",
              type: "Priority",
            },
            maximumFee: "10000000",
            memos: [],
            operation: {
              issuanceId: issuanceId,
              flags: [],
              type: "MPTokenAuthorize",
            },
          },
          description: "Test MPT Authorize",
          customProperties: {
            property1: "flo",
          },
          type: "v0_CreateTransactionOrder",
        },
        description: "Transfer order creation intent",
        customProperties: {
          property1: "flo",
        },
        type: "Propose",
      },
    };

    const custody = getCustodySDK();
    const result = await custody.intents.propose(mptAuthorizeRequest);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error proposing intent:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to propose intent",
      },
      { status: 500 }
    );
  }
}
