import { createUser, type CreateUserInput } from "../_actions/users";
import { useSubmitIntent } from "./useSubmitIntent";

export function useSubmitCreateUser() {
  return useSubmitIntent<CreateUserInput>("CreateUser", createUser);
}
