import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK, getCurrentUser } from "@/app/lib/custody";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import type { Core_ProposeIntentBody } from "custody";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domainId, alias, publicKey, roles, lock, description, loginIds } =
      body;

    if (!domainId) {
      return NextResponse.json(
        { error: "domainId is required" },
        { status: 400 }
      );
    }

    if (!alias) {
      return NextResponse.json({ error: "alias is required" }, { status: 400 });
    }

    if (!publicKey) {
      return NextResponse.json(
        { error: "publicKey is required" },
        { status: 400 }
      );
    }

    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json(
        { error: "At least one role is required" },
        { status: 400 }
      );
    }

    // Get current user info from the SDK
    const currentUser = await getCurrentUser(domainId);

    // Build the Create User intent request
    const createUserRequest: Core_ProposeIntentBody = {
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
          publicKey,
          roles,
          lock: lock || "Unlocked",
          ...(description && { description }),
          customProperties: {},
          ...(loginIds &&
            loginIds.length > 0 && {
              loginIds: loginIds.map(
                (login: { id: string; providerId: string }) => ({
                  id: login.id,
                  providerId: login.providerId,
                })
              ),
            }),
          type: "v0_CreateUser",
        },
        description: description || `Create user: ${alias}`,
        customProperties: {},
        type: "Propose",
      },
    };

    const custody = getCustodySDK();
    const result = await custody.intents.propose(createUserRequest);

    return NextResponse.json({
      request: createUserRequest,
      response: result,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create user",
      },
      { status: 500 }
    );
  }
}
