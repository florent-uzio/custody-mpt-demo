import { ticketCreate } from "../_actions/tickets";
import { useSubmitIntent } from "./useSubmitIntent";
import type { TicketCreatePayload } from "../components/TicketCreate.types";

export function useSubmitTicketCreate() {
  return useSubmitIntent<TicketCreatePayload>(ticketCreate);
}
