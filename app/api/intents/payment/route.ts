import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK, getCurrentUser, getAccountLedgerId } from "@/app/lib/custody";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import type { Core_ProposeIntentBody } from "custody";

type PaymentType = "XRP" | "IOU" | "MPT";
type DestinationType = "Address" | "Account" | "Endpoint";

function buildDestination(
  destinationType: DestinationType,
  body: Record<string, unknown>,
) {
  if (destinationType === "Account") {
    return { accountId: body.destinationAccountId as string, type: "Account" };
  }
  if (destinationType === "Endpoint") {
    return {
      endpointId: body.destinationEndpointId as string,
      type: "Endpoint",
    };
  }
  return { address: body.destinationAddress as string, type: "Address" };
}

function buildAmount(
  paymentType: PaymentType,
  amount: string,
  body: Record<string, unknown>,
): unknown {
  if (paymentType === "IOU") {
    return {
      value: amount,
      currency: body.currency as string,
      issuer: body.issuer as string,
    };
  }
  if (paymentType === "MPT") {
    return {
      value: amount,
      mpt_issuance_id: body.issuanceId as string,
    };
  }
  // XRP: drops as string
  return amount;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      accountId,
      paymentType = "XRP",
      destinationType = "Address",
      domainId,
      amount,
      description,
    } = body;

    if (!domainId) {
      return NextResponse.json(
        { error: "domainId is required" },
        { status: 400 },
      );
    }
    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 },
      );
    }
    if (!amount) {
      return NextResponse.json(
        { error: "amount is required" },
        { status: 400 },
      );
    }
    if (destinationType === "Address" && !body.destinationAddress) {
      return NextResponse.json(
        { error: "destinationAddress is required" },
        { status: 400 },
      );
    }
    if (destinationType === "Account" && !body.destinationAccountId) {
      return NextResponse.json(
        { error: "destinationAccountId is required" },
        { status: 400 },
      );
    }
    if (destinationType === "Endpoint" && !body.destinationEndpointId) {
      return NextResponse.json(
        { error: "destinationEndpointId is required" },
        { status: 400 },
      );
    }
    if (paymentType === "IOU" && (!body.currency || !body.issuer)) {
      return NextResponse.json(
        { error: "currency and issuer are required for IOU payments" },
        { status: 400 },
      );
    }
    if (paymentType === "MPT" && !body.issuanceId) {
      return NextResponse.json(
        { error: "issuanceId is required for MPT payments" },
        { status: 400 },
      );
    }

    const currentUser = await getCurrentUser(domainId);
    const ledgerId = await getAccountLedgerId(domainId, accountId);

    const paymentRequest: Core_ProposeIntentBody = {
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
          ledgerId,
          accountId,
          parameters: {
            type: "XRPL",
            feeStrategy: {
              priority: "Medium",
              type: "Priority",
            },
            maximumFee: "10000000",
            memos: [],
            operation: {
              // @ts-expect-error works fine
              destination: buildDestination(
                destinationType as DestinationType,
                body,
              ),
              amount: buildAmount(
                paymentType as PaymentType,
                amount,
                body,
              ) as string,
              type: "Payment",
            },
          },
          description: description || "Payment",
          customProperties: {
            property1: "flo",
          },
          type: "v0_CreateTransactionOrder",
        },
        description: description || "Payment",
        customProperties: {
          property1: "flo",
        },
        type: "Propose",
      },
    };

    const custody = getCustodySDK();
    const result = await custody.intents.propose(paymentRequest);

    return NextResponse.json({
      request: paymentRequest,
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
      { status: 500 },
    );
  }
}
