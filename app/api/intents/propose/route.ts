import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import type { Core_ProposeIntentBody } from "custody";

const DOMAIN_ID = "5cd224fe-193e-8bce-c94c-c6c05245e2d1";
const CURRENT_USER_ID = "6ac20654-450e-29e4-65e2-1bdecb7db7c4";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { issuanceId, accountId } = body;

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

    // Build the MPT Authorize intent request
    const mptAuthorizeRequest: Core_ProposeIntentBody = {
      request: {
        author: {
          id: CURRENT_USER_ID,
          domainId: DOMAIN_ID,
        },
        expiryAt: dayjs().add(1, "day").toISOString(),
        targetDomainId: DOMAIN_ID,
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
