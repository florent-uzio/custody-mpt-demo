import { NextRequest, NextResponse } from "next/server";
import {
  CONFIG_KEYS,
  getConfigSummary,
  setConfigOverride,
  clearAllOverrides,
  getConfigValue,
  type ConfigKey,
} from "@/app/lib/config";
import { resetCustodySDK } from "@/app/lib/custody";

export async function GET() {
  return NextResponse.json({ config: getConfigSummary() });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // If reset flag is set, clear all overrides
    if (body.reset === true) {
      clearAllOverrides();
      resetCustodySDK();
      return NextResponse.json({ config: getConfigSummary() });
    }

    // Apply overrides for provided keys
    for (const key of CONFIG_KEYS) {
      if (key in body) {
        setConfigOverride(key, body[key] as string);
      }
    }

    // Validate that AUTH_URL and API_URL resolve to non-empty values
    const authUrl = getConfigValue("AUTH_URL");
    const apiUrl = getConfigValue("API_URL");

    if (!authUrl || !apiUrl) {
      const missing: string[] = [];
      if (!authUrl) missing.push("AUTH_URL");
      if (!apiUrl) missing.push("API_URL");
      return NextResponse.json(
        {
          error: `${missing.join(" and ")} must have a value (either from override or .env)`,
        },
        { status: 400 },
      );
    }

    resetCustodySDK();
    return NextResponse.json({ config: getConfigSummary() });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
