"use server";

import {
  getAccountLedgerId,
  getCurrentUser,
  proposeIntent,
  type ProposeIntentResult,
} from "@/app/lib/custody";
import {
  buildProposeIntent,
  buildTransactionOrderPayload,
} from "@/app/lib/intent-builder";
import {
  MAX_TICKET_COUNT,
  MIN_TICKET_COUNT,
  type TicketCreatePayload,
} from "@/app/components/TicketCreate.types";

export async function ticketCreate(
  input: TicketCreatePayload,
): Promise<ProposeIntentResult> {
  const { domainId, accountId, ticketCount, customProperties } = input;

  if (!domainId) throw new Error("domainId is required");
  if (!accountId) throw new Error("accountId is required");
  if (
    !Number.isInteger(ticketCount) ||
    ticketCount < MIN_TICKET_COUNT ||
    ticketCount > MAX_TICKET_COUNT
  ) {
    throw new Error(
      `ticketCount must be an integer between ${MIN_TICKET_COUNT} and ${MAX_TICKET_COUNT}`,
    );
  }

  const [ledgerId, currentUser] = await Promise.all([
    getAccountLedgerId(domainId, accountId),
    getCurrentUser(domainId),
  ]);

  const ticketProperties = customProperties ?? {
    description: "Create Tickets",
  };

  const request = buildProposeIntent({
    author: { id: currentUser.userId, domainId },
    targetDomainId: domainId,
    payload: buildTransactionOrderPayload({
      ledgerId,
      accountId,
      feePriority: "Low",
      operation: {
        type: "TicketCreate",
        ticketCount,
      },
      description: "TicketCreate",
      customProperties: ticketProperties,
    }),
    description: "Create Tickets",
    customProperties: ticketProperties,
  });

  return proposeIntent(request);
}
