import { accountSet, type AccountSetInput } from "../_actions/accountset";
import { useSubmitIntent } from "./useSubmitIntent";

export function useSubmitAccountSet() {
  return useSubmitIntent<AccountSetInput>(accountSet);
}
