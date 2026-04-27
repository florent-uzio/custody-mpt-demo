"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { probeMe } from "./actions";

export default function ProbePage() {
  const [directResult, setDirectResult] = useState<string>("");
  const [directError, setDirectError] = useState<string>("");

  const reactQueryProbe = useQuery({
    queryKey: ["probe-me"],
    queryFn: probeMe,
    enabled: false,
  });

  return (
    <div className="p-8 font-mono space-y-8">
      <div>
        <h1 className="text-xl font-bold mb-2">Server Action Probe</h1>
        <p className="text-sm text-gray-600 mb-4">
          Tests whether a Next.js Server Action can call the custody SDK without
          leaking it into the client bundle.
        </p>
      </div>

      <section className="border p-4 rounded">
        <h2 className="font-bold mb-2">Test 1 — direct call</h2>
        <button
          className="border px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
          onClick={async () => {
            setDirectError("");
            setDirectResult("");
            try {
              const data = await probeMe();
              setDirectResult(JSON.stringify(data, null, 2));
            } catch (e) {
              setDirectError(e instanceof Error ? e.message : String(e));
            }
          }}
        >
          Run probeMe()
        </button>
        {directResult && (
          <pre className="mt-4 p-2 bg-green-50 text-sm">{directResult}</pre>
        )}
        {directError && (
          <pre className="mt-4 p-2 bg-red-50 text-red-700 text-sm">
            {directError}
          </pre>
        )}
      </section>

      <section className="border p-4 rounded">
        <h2 className="font-bold mb-2">Test 2 — via React Query</h2>
        <button
          className="border px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
          onClick={() => reactQueryProbe.refetch()}
          disabled={reactQueryProbe.isFetching}
        >
          {reactQueryProbe.isFetching ? "Fetching..." : "Run via useQuery"}
        </button>
        {reactQueryProbe.data && (
          <pre className="mt-4 p-2 bg-green-50 text-sm">
            {JSON.stringify(reactQueryProbe.data, null, 2)}
          </pre>
        )}
        {reactQueryProbe.error && (
          <pre className="mt-4 p-2 bg-red-50 text-red-700 text-sm">
            {reactQueryProbe.error instanceof Error
              ? reactQueryProbe.error.message
              : String(reactQueryProbe.error)}
          </pre>
        )}
      </section>

      <section className="border p-4 rounded text-sm bg-gray-50">
        <h2 className="font-bold mb-2">Bundle check</h2>
        <p>After both tests pass, run:</p>
        <pre className="mt-2">
          npm run build && grep -r &quot;RippleCustody&quot; .next/static/chunks
          2&gt;/dev/null
        </pre>
        <p className="mt-2">
          Expected: no matches. The SDK should appear only in server bundles.
        </p>
      </section>
    </div>
  );
}
