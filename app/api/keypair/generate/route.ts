import { NextRequest, NextResponse } from "next/server";
import { KeypairService } from "custody";

type Algorithm = "ed25519" | "secp256k1" | "secp256r1";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { algorithm } = body as { algorithm: Algorithm };

    if (!algorithm || !["ed25519", "secp256k1", "secp256r1"].includes(algorithm)) {
      return NextResponse.json(
        { error: "algorithm must be one of: ed25519, secp256k1, secp256r1" },
        { status: 400 },
      );
    }

    const service = new KeypairService(algorithm);
    const keypair = service.generate();

    return NextResponse.json({
      algorithm,
      privateKey: keypair.privateKey,
      publicKey: keypair.publicKey,
    });
  } catch (error) {
    console.error("Error generating keypair:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate keypair",
      },
      { status: 500 },
    );
  }
}
