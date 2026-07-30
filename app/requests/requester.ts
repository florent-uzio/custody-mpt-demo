import { type Core_RequestState } from "@florent-uzio/custody";

type Requester = Core_RequestState["requester"];

/** Display identity for either requester variant (user id, or service subject). */
export function requesterId(r: Requester | undefined): string | null {
  if (!r) return null;
  return "id" in r ? r.id : r.subject;
}

export function requesterDomainId(r: Requester | undefined): string | null {
  return r && "id" in r ? r.domainId : null;
}
