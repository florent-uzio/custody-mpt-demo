export interface SubmittedIntent {
  id: string; // Unique ID for this record
  type: "MPTAuthorize" | "MPTIssuanceCreate" | "MPTIssuanceSet" | "Payment";
  requestId: string;
  submittedAt: string;
  intentId?: string; // Will be fetched later from Request API
}

const STORAGE_KEY = "submitted_intents";

export function saveSubmittedIntent(
  intent: Omit<SubmittedIntent, "id" | "submittedAt">
) {
  const intents = getSubmittedIntents();
  const newIntent: SubmittedIntent = {
    ...intent,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    submittedAt: new Date().toISOString(),
  };
  intents.unshift(newIntent); // Add to beginning
  localStorage.setItem(STORAGE_KEY, JSON.stringify(intents));
  return newIntent;
}

export function getSubmittedIntents(): SubmittedIntent[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function updateIntentIntentId(id: string, intentId: string) {
  const intents = getSubmittedIntents();
  const index = intents.findIndex((intent) => intent.id === id);
  if (index !== -1) {
    intents[index].intentId = intentId;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(intents));
  }
}

export function clearSubmittedIntents() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
