import { NextRequest, NextResponse } from "next/server";
import { RippleCustody } from "custody";

const DOMAIN_ID = "5cd224fe-193e-8bce-c94c-c6c05245e2d1";

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
    const { intentId } = body;

    if (!intentId) {
      return NextResponse.json(
        { error: "intentId is required" },
        { status: 400 }
      );
    }

    const custody = getCustodySDK();
    const result = await custody.intents.get({
      domainId: DOMAIN_ID,
      intentId: intentId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting intent:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get intent",
      },
      { status: 500 }
    );
  }
}

