"use client";

import { SectionCard } from "../layout";
import {
  ACCOUNT_SET_FLAGS,
  type AccountSetFlag,
} from "../AccountSet.types";

interface Props {
  setFlag: AccountSetFlag | "";
  clearFlag: AccountSetFlag | "";
  onSetFlagChange: (flag: AccountSetFlag | "") => void;
  onClearFlagChange: (flag: AccountSetFlag | "") => void;
}

const selectCls =
  "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors bg-white";

/** A single asf-flag dropdown. `excluded` is the flag chosen in the sibling
 *  dropdown so the same flag can't be both set and cleared. */
function FlagSelect({
  id,
  label,
  value,
  excluded,
  onChange,
}: {
  id: string;
  label: string;
  value: AccountSetFlag | "";
  excluded: AccountSetFlag | "";
  onChange: (flag: AccountSetFlag | "") => void;
}) {
  const selected = ACCOUNT_SET_FLAGS.find((f) => f.name === value);
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as AccountSetFlag | "")}
        className={selectCls}
      >
        <option value="">None</option>
        {ACCOUNT_SET_FLAGS.map((flag) => (
          <option key={flag.name} value={flag.name} disabled={flag.name === excluded}>
            {flag.label} ({flag.name})
          </option>
        ))}
      </select>
      {selected && (
        <p className="mt-2 text-xs text-gray-500">{selected.description}</p>
      )}
    </div>
  );
}

/** Step 2 — choose one flag to enable (`setFlag`) and/or one to disable
 *  (`clearFlag`). XRPL allows at most one of each per AccountSet. */
export function FlagsSection({
  setFlag,
  clearFlag,
  onSetFlagChange,
  onClearFlagChange,
}: Props) {
  return (
    <SectionCard step={2} title="Flags" theme="teal">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FlagSelect
          id="accountset-setflag"
          label="Set Flag"
          value={setFlag}
          excluded={clearFlag}
          onChange={onSetFlagChange}
        />
        <FlagSelect
          id="accountset-clearflag"
          label="Clear Flag"
          value={clearFlag}
          excluded={setFlag}
          onChange={onClearFlagChange}
        />
      </div>
    </SectionCard>
  );
}
