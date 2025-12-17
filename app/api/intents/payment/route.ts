import { NextRequest, NextResponse } from "next/server";
import { RippleCustody } from "custody";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import type { Core_ProposeIntentBody } from "custody";

const DOMAIN_ID = "5cd224fe-193e-8bce-c94c-c6c05245e2d1";
const CURRENT_USER_ID = "6ac20654-450e-29e4-65e2-1bdecb7db7c4";

// Initialize RippleCustody SDK (server-side only)
function getCustodySDK() {
  const authUrl = process.env.AUTH_URL;
  const apiUrl = process.env.API_URL;
  const privateKey = process.env.PRIVATE_KEY || "";
  const publicKey = process.env.PUBLIC_KEY || "";

  if (!authUrl || !apiUrl) {
    throw new Error(
      "Missing required environment variables: AUTH_URL and API_URL"
    );
  }

  return new RippleCustody({
    authUrl,
    apiUrl,
    privateKey,
    publicKey,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      accountId,
      destinationAddress,
      amount,
      issuanceId,
      description,
    } = body;

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

    // Build the MPT Payment intent request
    const mptPaymentRequest: Core_ProposeIntentBody = {
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

