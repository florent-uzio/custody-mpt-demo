import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import type { Core_ProposeIntentBody } from "custody";

const CURRENT_USER_ID = "6ac20654-450e-29e4-65e2-1bdecb7db7c4";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      accountId,
      domainId,
      assetScale,
      transferFee,
      maximumAmount,
      flags,
      metadata,
    } = body;

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

    // Build the MPT Issuance Create intent request
    // Following the XRPL MPTokenIssuanceCreate transaction format
    const mptCreateRequest: Core_ProposeIntentBody = {
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
              type: "MPTokenIssuanceCreate",
              // Asset scale determines decimal places (0-255)
              ...(assetScale !== undefined && { assetScale }),
              // Transfer fee in basis points (0-50000 = 0.000%-50.000%)
              ...(transferFee !== undefined && transferFee > 0 && { transferFee }),
              // Maximum amount that can ever be issued
              ...(maximumAmount && { maximumAmount: String(maximumAmount) }),
              // Combined flags value
              ...(flags !== undefined && flags > 0 && { flags }),
              // XLS-89 compliant metadata (hex encoded JSON)
              ...(metadata && { metadata }),
            },
          },
          description: "MPT Issuance Create",
          customProperties: {
            property1: "mpt-create",
          },
          type: "v0_CreateTransactionOrder",
        },
        description: "Create new MPT Issuance",
        customProperties: {
          property1: "mpt-issuance-create",
        },
        type: "Propose",
      },
    };

    const custody = getCustodySDK();
    const result = await custody.intents.propose(mptCreateRequest);

    return NextResponse.json({
      request: mptCreateRequest,
      response: result,
    });
  } catch (error) {
    console.error("Error creating MPT issuance:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create MPT issuance",
      },
      { status: 500 }
    );
  }
}

