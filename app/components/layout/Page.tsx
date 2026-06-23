// Outer page wrapper: a full-height flex column that hosts a PageHeader
// (fixed) above a scrollable PageContainer.
export function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
  );
}
