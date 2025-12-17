import { NextRequest, NextResponse } from "next/server";
import { RippleCustody } from "custody";

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
    const { ledgerIds } = body;

    if (!ledgerIds || !Array.isArray(ledgerIds) || ledgerIds.length === 0) {
      return NextResponse.json(
        { error: "ledgerIds array is required and must not be empty" },
        { status: 400 }
      );
    }

    const custody = getCustodySDK();
    const result = await custody.tickers.list({
      ledgerId: ledgerIds,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing tickers:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to list tickers",
      },
      { status: 500 }
    );
  }
}

