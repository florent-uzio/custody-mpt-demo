import { useMutation } from "@tanstack/react-query";

type Algorithm = "ed25519" | "secp256k1" | "secp256r1";

export interface KeypairResult {
  algorithm: Algorithm;
  privateKey: string;
  publicKey: string;
}

async function generateKeypair(algorithm: Algorithm): Promise<KeypairResult> {
  const res = await fetch("/api/keypair/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ algorithm }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to generate keypair");
  }

  return res.json();
}

export function useKeypairGenerate() {
  return useMutation({
    mutationFn: generateKeypair,
  });
}
