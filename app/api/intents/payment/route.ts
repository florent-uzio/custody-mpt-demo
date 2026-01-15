import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK, getCurrentUser } from "@/app/lib/custody";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import type { Core_ProposeIntentBody } from "custody";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      accountId,
      destinationAddress,
      domainId,
      amount,
      issuanceId,
      description,
    } = body;

    if (!domainId) {
      return NextResponse.json(
        { error: "domainId is required" },
        { status: 400 }
      );
    }

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

    if (!destinationAddress) {
      return NextResponse.json(
        { error: "destinationAddress is required" },
        { status: 400 }
      );
    }

    if (!amount) {
      return NextResponse.json(
        { error: "amount is required" },
        { status: 400 }
      );
    }

    if (!issuanceId) {
      return NextResponse.json(
        { error: "issuanceId is required" },
        { status: 400 }
      );
    }

    // Get current user info from the SDK
    const currentUser = await getCurrentUser(domainId);

    // Build the MPT Payment intent request
    const mptPaymentRequest: Core_ProposeIntentBody = {
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
              destination: {
                address: destinationAddress,
                type: "Address",
              },
              amount: amount,
              currency: {
                issuanceId: issuanceId,
                type: "MultiPurposeToken",
              },
              type: "Payment",
            },
          },
          description: description || "MPT Payment",
          customProperties: {
            property1: "flo",
          },
          type: "v0_CreateTransactionOrder",
        },
        description: description || "MPT Payment",
        customProperties: {
          property1: "flo",
        },
        type: "Propose",
      },
    };

    const custody = getCustodySDK();
    const result = await custody.intents.propose(mptPaymentRequest);

    return NextResponse.json({
      request: mptPaymentRequest,
      response: result,
    });
  } catch (error) {
    console.error("Error proposing payment intent:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to propose payment intent",
      },
      { status: 500 }
    );
  }
}
