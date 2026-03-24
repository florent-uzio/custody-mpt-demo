interface Props {
  customProperties: Record<string, string>;
  onChange: (properties: Record<string, string>) => void;
}

export function CustomPropertiesSection({
  customProperties,
  onChange,
}: Props) {
  const entries = Object.entries(customProperties);

  const handleKeyChange = (oldKey: string, newKey: string) => {
    const updated: Record<string, string> = {};
    for (const [k, v] of Object.entries(customProperties)) {
      if (k === oldKey) {
        updated[newKey] = v;
      } else {
        updated[k] = v;
      }
    }
    onChange(updated);
  };

  const handleValueChange = (key: string, newValue: string) => {
    onChange({ ...customProperties, [key]: newValue });
  };

  const handleAdd = () => {
    onChange({ ...customProperties, "": "" });
  };

  const handleRemove = (key: string) => {
    const updated = { ...customProperties };
    delete updated[key];
    onChange(updated);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-sm font-bold">
          5
        </span>
        Custom Properties
      </h3>

      <div className="space-y-3">
        {entries.map(([key, value], index) => (
          <div key={index} className="flex gap-2 items-start">
            <input
              type="text"
              value={key}
              onChange={(e) => handleKeyChange(key, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
              placeholder="Key"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => handleValueChange(key, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-sm"
              placeholder="Value"
            />
            <button
              type="button"
              onClick={() => handleRemove(key)}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAdd}
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          + Add Property
        </button>
      </div>
    </div>
  );
}
