import { getTheme, type ThemeName } from "./pageTheme";

interface SectionCardProps {
  /** Optional numbered/labelled step badge (e.g. 1, 2, 3). */
  step?: number | string;
  title: React.ReactNode;
  /** Badge color; defaults to blue. Only used when `step` is set. */
  theme?: ThemeName;
  /** Optional right-aligned content in the card header row. */
  action?: React.ReactNode;
  children: React.ReactNode;
}

/** White rounded card for a logical section of a page, with an optional
 *  numbered step badge in the page's theme color. */
export function SectionCard({
  step,
  title,
  theme = "blue",
  action,
  children,
}: SectionCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {step !== undefined && (
            <span
              className={`w-8 h-8 ${getTheme(theme).stepBadge} rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0`}
            >
              {step}
            </span>
          )}
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}
