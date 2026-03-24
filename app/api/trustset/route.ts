import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK, getAccountLedgerId } from "@/app/lib/custody";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { convertStringToHex } from "xrpl";
import type { Core_ProposeIntentBody } from "custody";

const CURRENT_USER_ID = "6ac20654-450e-29e4-65e2-1bdecb7db7c4";

function toCurrencyHex(currency: string): string {
  if (currency.length <= 3) {
    return currency;
  }
  const hex = convertStringToHex(currency);
  return hex.padEnd(40, "0");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      accountId,
      domainId,
      currency,
      issuer,
      value,
      flags,
      enableRippling,
      customProperties,
    } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 },
      );
    }

    if (!domainId) {
      return NextResponse.json(
        { error: "domainId is required" },
        { status: 400 },
      );
    }

    if (!currency || !issuer) {
      return NextResponse.json(
        { error: "currency and issuer are required" },
        { status: 400 },
      );
    }

    if (value === undefined || value === "") {
      return NextResponse.json(
        { error: "value is required" },
        { status: 400 },
      );
    }

    const ledgerId = await getAccountLedgerId(domainId, accountId);

    const trustSetRequest: Core_ProposeIntentBody = {
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
          ledgerId,
          accountId,
          parameters: {
            type: "XRPL",
            feeStrategy: {
              priority: "Low",
              type: "Priority",
            },
            maximumFee: "10000000",
            memos: [],
            operation: {
              type: "TrustSet",
              flags: flags || [],
              limitAmount: {
                currency: {
                  type: "Currency",
                  code: toCurrencyHex(currency),
                  issuer,
                },
                value: String(value),
              },
              ...(enableRippling !== undefined && { enableRippling }),
            },
          },
          description: "TrustSet",
          customProperties: customProperties || {
            description: "Create a Trustline",
          },
          type: "v0_CreateTransactionOrder",
        },
        description: "Create TrustSet",
        customProperties: customProperties || {
          description: "Create a Trustline",
        },
        type: "Propose",
      },
    };

    const custody = getCustodySDK();
    const result = await custody.intents.propose(trustSetRequest);

    return NextResponse.json({
      request: trustSetRequest,
      response: result,
    });
  } catch (error) {
    console.error("Error creating TrustSet:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create TrustSet",
      },
      { status: 500 },
    );
  }
}
