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
    const { accountId, transferIds } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

    if (!transferIds || !Array.isArray(transferIds) || transferIds.length === 0) {
      return NextResponse.json(
        { error: "transferIds array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Build the release quarantined transfers intent request
    const releaseIntentRequest: Core_ProposeIntentBody = {
      request: {
        author: {
          id: CURRENT_USER_ID,
          domainId: DOMAIN_ID,
        },
        expiryAt: dayjs().add(1, "day").toISOString(),
        targetDomainId: DOMAIN_ID,
        id: uuidv4(),
        payload: {
          accountId: accountId,
          transferIds: transferIds,
          type: "v0_ReleaseQuarantinedTransfers",
        },
        description: `Release ${transferIds.length} quarantined transfer${transferIds.length > 1 ? "s" : ""}`,
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

