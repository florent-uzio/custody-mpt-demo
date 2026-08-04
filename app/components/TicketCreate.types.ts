import type { CustodyTicketCreate } from "@florent-uzio/custody";
import type { MaximumFee } from "@/app/lib/maximum-fee";

export interface TicketCreatePayload {
  accountId: string;
  domainId: string;
  /** Number of tickets to create, must be from 1 to 250. */
  ticketCount: CustodyTicketCreate["ticketCount"];
  customProperties?: Record<string, string>;
  /** Cap on the fee this transaction may burn. Omit for the default; `null` to send no cap. */
  maximumFee?: MaximumFee;
}

export const MIN_TICKET_COUNT = 1;
export const MAX_TICKET_COUNT = 250;
