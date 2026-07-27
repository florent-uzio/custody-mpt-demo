import {
  provisionElGamalKeyPair,
  type ProvisionElGamalKeyPairInput,
} from "../_actions/elgamal";
import { useSubmitIntent } from "./useSubmitIntent";

export function useProvisionElGamalKeyPair() {
  return useSubmitIntent<ProvisionElGamalKeyPairInput>(provisionElGamalKeyPair);
}
