"use server";

import { KeypairService } from "custody";

export type KeypairAlgorithm = "ed25519" | "secp256k1" | "secp256r1";

export type GeneratedKeypair = {
  algorithm: KeypairAlgorithm;
  privateKey: string;
  publicKey: string;
};

const VALID_ALGORITHMS: KeypairAlgorithm[] = ["ed25519", "secp256k1", "secp256r1"];

export async function generateKeypair(
  algorithm: KeypairAlgorithm,
): Promise<GeneratedKeypair> {
  if (!algorithm || !VALID_ALGORITHMS.includes(algorithm)) {
    throw new Error("algorithm must be one of: ed25519, secp256k1, secp256r1");
  }

  const service = new KeypairService(algorithm);
  const keypair = service.generate();

  return {
    algorithm,
    privateKey: keypair.privateKey,
    publicKey: keypair.publicKey,
  };
}
