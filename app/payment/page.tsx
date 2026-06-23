"use client";

import { useState } from "react";
import { JsonViewer } from "../components/JsonViewer";
import { useAccounts } from "../hooks/useAccounts";
import { useDefaultDomain } from "../contexts/DomainContext";
import { useSubmitPayment } from "../hooks/useSubmitPayment";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  SectionCard,
  SubmitButton,
  ErrorBanner,
  DomainWarning,
} from "../components/layout";

type PaymentType = "XRP" | "IOU" | "MPT";
type DestinationType = "Address" | "Account" | "Endpoint";

export default function PaymentPage() {
  const { accounts, loading: accountsLoading } = useAccounts();
  const { defaultDomainId } = useDefaultDomain();
  const { mutate, isPending, data: response, error } = useSubmitPayment();

  const [accountId, setAccountId] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("XRP");

  // Destination
  const [destinationType, setDestinationType] =
    useState<DestinationType>("Address");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [destinationAccountId, setDestinationAccountId] = useState("");
  const [destinationEndpointId, setDestinationEndpointId] = useState("");

  // Amount
  const [amount, setAmount] = useState("");

  // IOU fields
  const [currency, setCurrency] = useState("");
  const [issuer, setIssuer] = useState("");

  // MPT fields
  const [issuanceId, setIssuanceId] = useState("");

  const [description, setDescription] = useState("Payment");
  const [showRequestModal, setShowRequestModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defaultDomainId) return;
    mutate(
      {
        accountId,
        paymentType,
        destinationType,
        destinationAddress,
        destinationAccountId,
        destinationEndpointId,
        domainId: defaultDomainId,
        amount,
        currency: paymentType === "IOU" ? currency : undefined,
        issuer: paymentType === "IOU" ? issuer : undefined,
        issuanceId: paymentType === "MPT" ? issuanceId : undefined,
        description,
      },
      { onSuccess: () => setShowRequestModal(true) },
    );
  };

  return (
    <Page>
      <PageHeader title="Payment" subtitle="XRPL · Payment" />
      <PageContainer width="form">
        <PageHero
          theme="sky"
          icon="💳"
          title="Payment"
          description="Create an intent to send an XRP, IOU, or Multi-Purpose Token (MPT) payment."
          badge={{
            label: "Payment Intent",
            note: "XRP · IOU · MPT",
          }}
        />

        {!defaultDomainId && (
          <DomainWarning action="creating a payment" />
        )}

        <SectionCard title="Payment Details">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account ID */}
            <div>
              <label
                htmlFor="accountId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Account ID
              </label>
              <select
                id="accountId"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                required
                disabled={accountsLoading}
              >
                {accountsLoading ? (
                  <option>Loading accounts...</option>
                ) : (
                  <>
                    <option value="" disabled>
                      Select an account
                    </option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.alias} ({account.id})
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Payment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Type
              </label>
              <div className="flex gap-6">
                {(["XRP", "IOU", "MPT"] as PaymentType[]).map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="paymentType"
                      value={type}
                      checked={paymentType === type}
                      onChange={() => setPaymentType(type)}
                      className="text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination
              </label>
              <div className="flex gap-2 mb-2">
                {(["Address", "Account", "Endpoint"] as DestinationType[]).map(
                  (type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setDestinationType(type)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                        destinationType === type
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {type}
                    </button>
                  )
                )}
              </div>
              {destinationType === "Address" && (
                <input
                  type="text"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="rXXXX..."
                  required
                />
              )}
              {destinationType === "Account" && (
                <input
                  type="text"
                  value={destinationAccountId}
                  onChange={(e) => setDestinationAccountId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Account UUID"
                  required
                />
              )}
              {destinationType === "Endpoint" && (
                <input
                  type="text"
                  value={destinationEndpointId}
                  onChange={(e) => setDestinationEndpointId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Endpoint ID"
                  required
                />
              )}
            </div>

            {/* Amount */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Amount
              </label>
              <input
                type="text"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder={
                  paymentType === "XRP"
                    ? "Amount in drops (e.g., 1000000 = 1 XRP)"
                    : "Amount (e.g., 100)"
                }
                required
              />
              {paymentType === "XRP" && (
                <p className="mt-1 text-xs text-gray-500">
                  1 XRP = 1,000,000 drops
                </p>
              )}
            </div>

            {/* IOU Fields */}
            {paymentType === "IOU" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="currency"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Currency Code
                  </label>
                  <input
                    type="text"
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="USD, EUR, BTC..."
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="issuer"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Issuer Address
                  </label>
                  <input
                    type="text"
                    id="issuer"
                    value={issuer}
                    onChange={(e) => setIssuer(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="rIssuerXXXX..."
                    required
                  />
                </div>
              </div>
            )}

            {/* MPT Fields */}
            {paymentType === "MPT" && (
              <div>
                <label
                  htmlFor="issuanceId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  MPT Issuance ID
                </label>
                <input
                  type="text"
                  id="issuanceId"
                  value={issuanceId}
                  onChange={(e) => setIssuanceId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="00CA8BD9F2582AF39B51725D510C5401ED4495ECFB250591"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  The ID of the MPT issuance created with xrpl.js SDK.
                </p>
              </div>
            )}

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description (Optional)
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Enter description"
              />
            </div>

            {/* Fixed Configuration */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <h3 className="font-medium text-gray-700 mb-2">
                Fixed Configuration:
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-600">Domain ID:</span>
                  <span className="ml-2 font-mono text-xs text-gray-800">
                    {defaultDomainId}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Ledger:</span>
                  <span className="ml-2 text-gray-800">
                    xrpl-testnet-august-2024
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Fee Strategy:</span>
                  <span className="ml-2 text-gray-800">Medium Priority</span>
                </div>
              </div>
            </div>

            <SubmitButton theme="sky" pending={isPending} disabled={isPending}>
              {isPending ? "Proposing Payment..." : "Propose Payment Intent"}
            </SubmitButton>
          </form>
        </SectionCard>

        <ErrorBanner error={error} />

        {/* Request Modal */}
        {showRequestModal && response && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRequestModal(false)}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Payment Intent Request
                </h2>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6 overflow-auto flex-1">
                <JsonViewer data={response.request} title="Request" />
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {response && (
          <div>
            <JsonViewer data={response.response} title="Payment Intent Response" />
          </div>
        )}
      </PageContainer>
    </Page>
  );
}
