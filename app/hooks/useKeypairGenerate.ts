import { useMutation } from "@tanstack/react-query";
import { generateKeypair, type KeypairAlgorithm } from "../_actions/keypair";

export type KeypairResult = {
  algorithm: KeypairAlgorithm;
  privateKey: string;
  publicKey: string;
};

export function useKeypairGenerate() {
  return useMutation({
    mutationFn: (algorithm: KeypairAlgorithm) => generateKeypair(algorithm),
  });
}
