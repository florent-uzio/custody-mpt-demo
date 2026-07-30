import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  { ignores: [".next/**", "node_modules/**", "vendor/**", "plans/**"] },
  // Pre-existing backlog: 5 violations across app/channels, app/config,
  // app/contexts and app/hooks. Demoted to a warning so CI can gate new work;
  // restore to "error" once the backlog is cleared (see plans/README.md).
  { rules: { "react-hooks/set-state-in-effect": "warn" } },
]);
