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
    const { domainId, accountId } = body;

    if (!domainId || !accountId) {
      return NextResponse.json(
        { error: "domainId and accountId are required" },
        { status: 400 }
      );
    }

    const custody = getCustodySDK();
    const result = await custody.accounts.addresses({
      domainId,
      accountId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching account addresses:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch account addresses",
      },
      { status: 500 }
    );
  }
}
