import { useSyncExternalStore } from "react";

const neverChanges = () => () => {};
const onClient = () => true;
const onServer = () => false;

/**
 * `false` during SSR and the hydration render, `true` afterwards.
 *
 * Lets a component read browser-only state (localStorage) in a `useState`
 * initializer without a hydration mismatch: gate the markup that depends on it
 * behind this flag. React swaps the server snapshot for the client one once
 * hydration finishes, so no `setState` in an effect is needed.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(neverChanges, onClient, onServer);
}
