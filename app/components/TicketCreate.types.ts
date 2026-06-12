import type { CustodyTicketCreate } from "@florent-uzio/custody";

export interface TicketCreatePayload {
  accountId: string;
  domainId: string;
  /** Number of tickets to create, must be from 1 to 250. */
  ticketCount: CustodyTicketCreate["ticketCount"];
  customProperties?: Record<string, string>;
}

export const MIN_TICKET_COUNT = 1;
export const MAX_TICKET_COUNT = 250;
