import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import type { Core_ProposeIntentBody } from "custody";

const CURRENT_USER_ID = "6ac20654-450e-29e4-65e2-1bdecb7db7c4";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, domainId, issuanceId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

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

    // Build the MPT Issuance Destroy intent request
    // Following the XRPL MPTokenIssuanceDestroy transaction format
    const mptDestroyRequest: Core_ProposeIntentBody = {
      request: {
        author: {
          id: CURRENT_USER_ID,
          domainId,
        },
        expiryAt: dayjs().add(1, "day").toISOString(),
        targetDomainId: domainId,
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
              type: "MPTokenIssuanceDestroy",
              issuanceId: issuanceId,
            },
          },
          description: "MPT Issuance Destroy",
          customProperties: {
            property1: "mpt-destroy",
          },
          type: "v0_CreateTransactionOrder",
        },
        description: "Destroy MPT Issuance",
        customProperties: {
          property1: "mpt-issuance-destroy",
        },
        type: "Propose",
      },
    };

    const custody = getCustodySDK();
    const result = await custody.intents.propose(mptDestroyRequest);

    return NextResponse.json({
      request: mptDestroyRequest,
      response: result,
    });
  } catch (error) {
    console.error("Error destroying MPT issuance:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to destroy MPT issuance",
      },
      { status: 500 }
    );
  }
}

