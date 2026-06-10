"use server";

import { randomUUID } from "node:crypto";
import type {
  EDS_Channel,
  EDS_ChannelCreate,
  EDS_ChannelUpdate,
} from "@florent-uzio/custody";
import { getCustodySDK, getCurrentUser } from "@/app/lib/custody";

export type CreateChannelInput = Omit<
  EDS_ChannelCreate,
  "id" | "createdBy" | "type" | "status"
>;

export type UpdateChannelInput = Omit<EDS_ChannelUpdate, "lastUpdatedBy">;

export async function listChannels(domainId: string): Promise<EDS_Channel[]> {
  if (!domainId) throw new Error("domainId is required");
  const sdk = getCustodySDK();
  return sdk.channels.list({ domainId });
}

export async function getChannel(
  domainId: string,
  channelId: string,
): Promise<EDS_Channel> {
  if (!domainId) throw new Error("domainId is required");
  if (!channelId) throw new Error("channelId is required");
  const sdk = getCustodySDK();
  return sdk.channels.get({ domainId, channelId });
}

export async function createChannel(
  domainId: string,
  input: CreateChannelInput,
): Promise<EDS_Channel> {
  if (!domainId) throw new Error("domainId is required");
  if (!input.name?.trim()) throw new Error("name is required");
  if (!input.url?.trim()) throw new Error("url is required");
  if (!input.supportedEventTypes?.length)
    throw new Error("at least one supportedEventType is required");

  const sdk = getCustodySDK();
  const { userId } = await getCurrentUser(domainId);

  return sdk.channels.create(
    { domainId },
    {
      ...input,
      id: randomUUID(),
      type: "WEBHOOK",
      name: input.name.trim(),
      url: input.url.trim(),
      createdBy: userId,
      status: "ACTIVE",
    },
  );
}

export async function updateChannel(
  domainId: string,
  channelId: string,
  input: UpdateChannelInput,
): Promise<EDS_Channel> {
  if (!domainId) throw new Error("domainId is required");
  if (!channelId) throw new Error("channelId is required");

  const sdk = getCustodySDK();
  const { userId } = await getCurrentUser(domainId);

  return sdk.channels.update(
    { domainId, channelId },
    {
      ...input,
      ...(input.name !== undefined && { name: input.name.trim() }),
      lastUpdatedBy: userId,
    },
  );
}

export async function deleteChannel(
  domainId: string,
  channelId: string,
): Promise<void> {
  if (!domainId) throw new Error("domainId is required");
  if (!channelId) throw new Error("channelId is required");
  const sdk = getCustodySDK();
  await sdk.channels.delete({ domainId, channelId });
}
