import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK, getCurrentUser } from "@/app/lib/custody";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import type { Core_ProposeIntentBody } from "custody";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, transferIds, domainId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

    if (
      !transferIds ||
      !Array.isArray(transferIds) ||
      transferIds.length === 0
    ) {
      return NextResponse.json(
        { error: "transferIds array is required and must not be empty" },
        { status: 400 }
      );
    }

    if (!domainId) {
      return NextResponse.json(
        { error: "domainId is required" },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser(domainId);

    // Build the release quarantined transfers intent request
    const releaseIntentRequest: Core_ProposeIntentBody = {
      request: {
        author: {
          id: currentUser.userId,
          domainId: currentUser.domainId,
        },
        expiryAt: dayjs().add(1, "day").toISOString(),
        targetDomainId: currentUser.domainId,
        id: uuidv4(),
        payload: {
          accountId: accountId,
          transferIds: transferIds,
          type: "v0_ReleaseQuarantinedTransfers",
        },
        description: `Release ${transferIds.length} quarantined transfer${
          transferIds.length > 1 ? "s" : ""
        }`,
        customProperties: {},
        type: "Propose",
      },
    };

    const custody = getCustodySDK();
    const result = await custody.intents.propose(releaseIntentRequest);

    return NextResponse.json({
      request: releaseIntentRequest,
      response: result,
    });
  } catch (error) {
    console.error("Error proposing release intent:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to propose release intent",
      },
      { status: 500 }
    );
  }
}
