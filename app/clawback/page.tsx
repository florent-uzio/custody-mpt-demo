"use client";

import { useState } from "react";
import { JsonViewer } from "../components/JsonViewer";
import { useAccountsWithAddresses } from "../hooks/useAccountsWithAddresses";
import { useEndpoints } from "../hooks/useEndpoints";
import { useSubmitClawback } from "../hooks/useSubmitClawback";
import { useDefaultDomain } from "../contexts/DomainContext";
import type { AccountWithAddress } from "../_actions/accounts";
import type { EndpointOption } from "../hooks/useEndpoints";
import type { ClawbackCurrency, ClawbackHolder } from "../_actions/clawback";
import {
  Page,
  PageHeader,
  PageContainer,
  PageHero,
  SubmitButton,
  ErrorBanner,
  DomainWarning,
} from "../components/layout";

type CurrencyType = ClawbackCurrency["type"];
type HolderType = ClawbackHolder["type"];

const inputCls =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-colors";

const accountLabel = (a: AccountWithAddress) =>
  a.address ? `${a.alias} — ${a.address}` : `${a.alias} (${a.id})`;

const endpointLabel = (e: EndpointOption) => `${e.alias} — ${e.address}`;

function StepCard({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-8 h-8 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center text-sm font-bold">
          {step}
        </span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Label({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700 mb-2"
    >
      {children}
    </label>
  );
}

export default function ClawbackPage() {
  const { defaultDomainId } = useDefaultDomain();
  const { accounts, loading: accountsLoading } = useAccountsWithAddresses();
  const { endpoints, loading: endpointsLoading } = useEndpoints();
  const { mutate, isPending, data: response, error } = useSubmitClawback();

  const [accountId, setAccountId] = useState("");

  const [currencyType, setCurrencyType] = useState<CurrencyType>("Currency");
  const [code, setCode] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issuanceId, setIssuanceId] = useState("");
  const [tickerId, setTickerId] = useState("");

  const [holderType, setHolderType] = useState<HolderType>("Address");
  const [holderAccountId, setHolderAccountId] = useState("");
  const [holderAddress, setHolderAddress] = useState("");
  const [holderEndpointId, setHolderEndpointId] = useState("");

  const [value, setValue] = useState("");
  const [description, setDescription] = useState("Clawback");
  const [validationError, setValidationError] = useState<string | null>(null);

  const buildCurrency = (): ClawbackCurrency => {
    switch (currencyType) {
      case "Currency":
        return { type: "Currency", code: code.trim(), issuer: issuer.trim() };
      case "MultiPurposeToken":
        return { type: "MultiPurposeToken", issuanceId: issuanceId.trim() };
      case "TickerId":
        return { type: "TickerId", tickerId: tickerId.trim() };
    }
  };

  const buildHolder = (): ClawbackHolder => {
    switch (holderType) {
      case "Account":
        return { type: "Account", accountId: holderAccountId.trim() };
      case "Address":
        return { type: "Address", address: holderAddress.trim() };
      case "Endpoint":
        return { type: "Endpoint", endpointId: holderEndpointId.trim() };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!defaultDomainId) return;
    if (!accountId) {
      setValidationError("Select the issuer account performing the clawback.");
      return;
    }
    if (!value.trim()) {
      setValidationError("Amount (value) is required.");
      return;
    }

    mutate({
      domainId: defaultDomainId,
      accountId,
      currency: buildCurrency(),
      holder: buildHolder(),
      value: value.trim(),
      customProperties: { description: description.trim() || "Clawback" },
    });
  };

  return (
    <Page>
      <PageHeader title="Clawback" subtitle="XRPL · Clawback" />
      <PageContainer width="form">
        <PageHero
          theme="rose"
          icon="↩️"
          title="Clawback"
          description="Recall issued tokens from a holder back to the issuer. The clawback is sent by the issuer account and requires the token to have been issued as clawback-enabled."
          badge={{ label: "Clawback", note: "XRPL native clawback transaction" }}
        />

        {!defaultDomainId && <DomainWarning action="creating a clawback" />}

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Issuer account */}
            <StepCard step={1} title="Issuer account">
              <Label htmlFor="clawback-accountId">Account ID</Label>
              <select
                id="clawback-accountId"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className={`${inputCls} bg-white`}
                required
                disabled={accountsLoading}
              >
                {accountsLoading ? (
                  <option>Loading accounts...</option>
                ) : accounts.length === 0 ? (
                  <option value="">
                    No accounts found - set Default Domain ID
                  </option>
                ) : (
                  <>
                    <option value="" disabled>
                      Select an account
                    </option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {accountLabel(account)}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                The issuer account clawing the tokens back.
              </p>
            </StepCard>

            {/* 2. Currency */}
            <StepCard step={2} title="Currency to claw back">
              <Label htmlFor="clawback-currencyType">Currency type</Label>
              <select
                id="clawback-currencyType"
                value={currencyType}
                onChange={(e) => setCurrencyType(e.target.value as CurrencyType)}
                className={`${inputCls} bg-white mb-4`}
              >
                <option value="Currency">
                  Currency (issued token: code + issuer)
                </option>
                <option value="MultiPurposeToken">
                  MultiPurposeToken (MPT issuance)
                </option>
                <option value="TickerId">TickerId (custody ticker)</option>
              </select>

              {currencyType === "Currency" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clawback-code">Currency code</Label>
                    <input
                      id="clawback-code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className={inputCls}
                      placeholder="USD or a >3 char code"
                    />
                    <p className="mt-1 text-xs text-gray-400">
                      Codes longer than 3 chars are hex-encoded automatically.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="clawback-issuer">Issuer address</Label>
                    <input
                      id="clawback-issuer"
                      type="text"
                      value={issuer}
                      onChange={(e) => setIssuer(e.target.value)}
                      className={`${inputCls} font-mono`}
                      placeholder="r..."
                    />
                  </div>
                </div>
              )}

              {currencyType === "MultiPurposeToken" && (
                <div>
                  <Label htmlFor="clawback-issuanceId">MPT Issuance ID</Label>
                  <input
                    id="clawback-issuanceId"
                    type="text"
                    value={issuanceId}
                    onChange={(e) => setIssuanceId(e.target.value)}
                    className={`${inputCls} font-mono`}
                    placeholder="00CA8BD9... (192-bit hex)"
                  />
                </div>
              )}

              {currencyType === "TickerId" && (
                <div>
                  <Label htmlFor="clawback-tickerId">Ticker ID</Label>
                  <input
                    id="clawback-tickerId"
                    type="text"
                    value={tickerId}
                    onChange={(e) => setTickerId(e.target.value)}
                    className={`${inputCls} font-mono`}
                    placeholder="ticker UUID"
                  />
                </div>
              )}
            </StepCard>

            {/* 3. Holder */}
            <StepCard step={3} title="Holder (whose tokens are clawed back)">
              <Label htmlFor="clawback-holderType">Holder type</Label>
              <select
                id="clawback-holderType"
                value={holderType}
                onChange={(e) => setHolderType(e.target.value as HolderType)}
                className={`${inputCls} bg-white mb-4`}
              >
                <option value="Address">Address (XRPL classic address)</option>
                <option value="Account">Account (custody account)</option>
                <option value="Endpoint">Endpoint (registered endpoint)</option>
              </select>

              {holderType === "Address" && (
                <div>
                  <Label htmlFor="clawback-holderAddress">Address</Label>
                  <input
                    id="clawback-holderAddress"
                    type="text"
                    value={holderAddress}
                    onChange={(e) => setHolderAddress(e.target.value)}
                    className={`${inputCls} font-mono`}
                    placeholder="r..."
                  />
                </div>
              )}

              {holderType === "Account" && (
                <div>
                  <Label htmlFor="clawback-holderAccountId">Account</Label>
                  <select
                    id="clawback-holderAccountId"
                    value={holderAccountId}
                    onChange={(e) => setHolderAccountId(e.target.value)}
                    className={`${inputCls} bg-white`}
                    disabled={accountsLoading}
                  >
                    {accountsLoading ? (
                      <option>Loading accounts...</option>
                    ) : accounts.length === 0 ? (
                      <option value="">
                        No accounts found - set Default Domain ID
                      </option>
                    ) : (
                      <>
                        <option value="" disabled>
                          Select a holder account
                        </option>
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {accountLabel(account)}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    The custody account holding the tokens. Its r-address is
                    shown next to the alias.
                  </p>
                </div>
              )}

              {holderType === "Endpoint" && (
                <div>
                  <Label htmlFor="clawback-holderEndpointId">Endpoint</Label>
                  <select
                    id="clawback-holderEndpointId"
                    value={holderEndpointId}
                    onChange={(e) => setHolderEndpointId(e.target.value)}
                    className={`${inputCls} bg-white`}
                    disabled={endpointsLoading}
                  >
                    {endpointsLoading ? (
                      <option>Loading endpoints...</option>
                    ) : endpoints.length === 0 ? (
                      <option value="">No endpoints found in this domain</option>
                    ) : (
                      <>
                        <option value="" disabled>
                          Select a holder endpoint
                        </option>
                        {endpoints.map((endpoint) => (
                          <option key={endpoint.id} value={endpoint.id}>
                            {endpointLabel(endpoint)}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    A registered endpoint (trusted address). Its r-address is
                    shown next to the alias.
                  </p>
                </div>
              )}
            </StepCard>

            {/* 4. Amount */}
            <StepCard step={4} title="Amount">
              <Label htmlFor="clawback-value">Value to claw back</Label>
              <input
                id="clawback-value"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className={`${inputCls} font-mono`}
                placeholder="e.g. 100"
              />
              <p className="mt-2 text-xs text-gray-500">
                Large integer, sent as a string to preserve precision.
              </p>

              <div className="mt-4">
                <Label htmlFor="clawback-description">Description</Label>
                <input
                  id="clawback-description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={inputCls}
                  placeholder="Clawback"
                />
              </div>
            </StepCard>

            <SubmitButton
              theme="rose"
              pending={isPending}
              disabled={isPending || !defaultDomainId || accounts.length === 0}
              pendingLabel="Creating Clawback..."
            >
              Create Clawback
            </SubmitButton>
          </form>

          {validationError && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 font-medium">
              {validationError}
            </div>
          )}

          <ErrorBanner error={error} />

          {response && (
            <div className="space-y-4">
              <JsonViewer data={response.request} title="Request Payload" />
              <JsonViewer data={response.response} title="API Response" />
            </div>
          )}
      </PageContainer>
    </Page>
  );
}
