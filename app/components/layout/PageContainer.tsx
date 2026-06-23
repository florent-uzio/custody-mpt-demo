// Scrollable content area with a standardized max-width tier:
//   form   → max-w-3xl  (single-column action/create pages)
//   detail → max-w-5xl  (read/profile/detail pages)
//   list   → max-w-7xl  (tables / index pages)
export type PageWidth = "form" | "detail" | "list";

const WIDTHS: Record<PageWidth, string> = {
  form: "max-w-3xl",
  detail: "max-w-5xl",
  list: "max-w-7xl",
};

interface PageContainerProps {
  width?: PageWidth;
  children: React.ReactNode;
}

export function PageContainer({ width = "form", children }: PageContainerProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <main
        className={`${WIDTHS[width]} mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6`}
      >
        {children}
      </main>
    </div>
  );
}
