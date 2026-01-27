import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK, getCurrentUser } from "@/app/lib/custody";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import type { Core_ProposeIntentBody } from "custody";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      domainId,
      alias,
      vaultId,
      keyStrategy,
      ledgerIds,
      lock,
      description,
    } = body;

    if (!domainId) {
      return NextResponse.json(
        { error: "domainId is required" },
        { status: 400 },
      );
    }

    if (!alias) {
      return NextResponse.json({ error: "alias is required" }, { status: 400 });
    }

    if (!vaultId) {
      return NextResponse.json(
        { error: "vaultId is required" },
        { status: 400 },
      );
    }

    if (!keyStrategy) {
      return NextResponse.json(
        { error: "keyStrategy is required" },
        { status: 400 },
      );
    }

    // Get current user info from the SDK
    const currentUser = await getCurrentUser(domainId);

    // Build the Create Account intent request
    const createAccountRequest: Core_ProposeIntentBody = {
      request: {
        author: {
          id: currentUser.userId,
          domainId: currentUser.domainId,
        },
        expiryAt: dayjs().add(1, "day").toISOString(),
        targetDomainId: domainId,
        id: uuidv4(),
        payload: {
          id: uuidv4(),
          alias,
          providerDetails: {
            vaultId,
            keyStrategy,
            type: "Vault",
          },
          lock: lock || "Unlocked",
          ...(description && { description }),
          ...(ledgerIds && ledgerIds.length > 0 && { ledgerIds }),
          customProperties: {},
          type: "v0_CreateAccount",
        },
        description: description || `Create account: ${alias}`,
        customProperties: {},
        type: "Propose",
      },
    };

    const custody = getCustodySDK();
    const result = await custody.intents.propose(createAccountRequest);

    return NextResponse.json({
      request: createAccountRequest,
      response: result,
    });
  } catch (error) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create account",
      },
      { status: 500 },
    );
  }
}
