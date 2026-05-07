import { updateUser, type UpdateUserInput } from "../_actions/users";
import { useSubmitIntent } from "./useSubmitIntent";

export function useSubmitUpdateUser() {
  return useSubmitIntent<UpdateUserInput>("UpdateUser", updateUser);
}
