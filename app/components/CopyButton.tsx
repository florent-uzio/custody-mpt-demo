"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
  className?: string;
  /** Use "light" on dark or theme-colored surfaces (e.g. inside PageHero). */
  tone?: "dark" | "light";
}

export function CopyButton({
  text,
  className = "",
  tone = "dark",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const light = tone === "light";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`p-1 rounded transition-colors ${light ? "hover:bg-white/20" : "hover:bg-gray-100"} ${className}`}
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? (
        <svg
          className={`w-4 h-4 ${light ? "text-green-300" : "text-green-600"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className={`w-4 h-4 ${light ? "text-white/70 hover:text-white" : "text-gray-400 hover:text-gray-600"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}
    </button>
  );
}

