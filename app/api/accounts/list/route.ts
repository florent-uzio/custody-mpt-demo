import { NextRequest, NextResponse } from "next/server";
import { getCustodySDK } from "@/app/lib/custody";
import { GetAccountsQueryParams } from "custody/dist/services/accounts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      domainId,
      limit,
      startingAfter,
      sortBy,
      sortOrder,
      ledgerId,
      alias,
      vaultId,
      createdBy,
      lastModifiedBy,
      description,
      customProperties,
      locks,
      processingStatus,
      additionalLedgerIds,
      additionalLedgerStatuses,
    } = body;

    if (!domainId) {
      return NextResponse.json(
        { error: "domainId is required" },
        { status: 400 }
      );
    }

    // Build query params - only include defined values
    const queryParams: GetAccountsQueryParams = {};

    if (limit !== undefined && limit !== null && limit !== "") {
      queryParams.limit = Number(limit);
    }

    if (startingAfter) {
      queryParams.startingAfter = startingAfter;
    }

    if (sortBy) {
      queryParams.sortBy = sortBy;
    }

    if (sortOrder) {
      queryParams.sortOrder = sortOrder;
    }

    if (ledgerId) {
      queryParams.ledgerId = ledgerId;
    }

    if (alias) {
      queryParams.alias = alias;
    }

    if (vaultId) {
      queryParams["providerDetails.vaultId"] = vaultId;
    }

    if (createdBy) {
      queryParams["metadata.createdBy"] = createdBy;
    }

    if (lastModifiedBy) {
      queryParams["metadata.lastModifiedBy"] = lastModifiedBy;
    }

    if (description) {
      queryParams["metadata.description"] = description;
    }

    if (
      customProperties &&
      Array.isArray(customProperties) &&
      customProperties.length > 0
    ) {
      queryParams["metadata.customProperties"] = customProperties;
    }

    if (locks && Array.isArray(locks) && locks.length > 0) {
      queryParams.lock = locks;
    }

    if (processingStatus) {
      queryParams["additionalDetails.processingStatus"] = processingStatus;
    }

    if (
      additionalLedgerIds &&
      Array.isArray(additionalLedgerIds) &&
      additionalLedgerIds.length > 0
    ) {
      queryParams["additionalDetails.ledgers.ledgerId"] = additionalLedgerIds;
    }

    if (
      additionalLedgerStatuses &&
      Array.isArray(additionalLedgerStatuses) &&
      additionalLedgerStatuses.length > 0
    ) {
      queryParams["additionalDetails.ledgers.status"] =
        additionalLedgerStatuses;
    }

    const custody = getCustodySDK();
    const result = await custody.accounts.list(
      {
        domainId,
      },
      queryParams
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing accounts:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list accounts",
      },
      { status: 500 }
    );
  }
}
