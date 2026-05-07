import { createAccount, type CreateAccountInput } from "../_actions/accounts";
import { useSubmitIntent } from "./useSubmitIntent";

export function useSubmitCreateAccount() {
  return useSubmitIntent<CreateAccountInput>("CreateAccount", createAccount);
}
