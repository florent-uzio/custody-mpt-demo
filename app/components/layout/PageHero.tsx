import { getTheme, type ThemeName } from "./pageTheme";

interface PageHeroProps {
  theme: ThemeName;
  /** Emoji string or an inline SVG node. */
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  /** Optional pill + trailing note rendered under the description. */
  badge?: { label: string; note?: React.ReactNode };
}

/**
 * Themed gradient hero card shown at the top of a page's scrollable content.
 * The white top bar (PageHeader) stays neutral; this card carries the page's
 * color identity, icon, title and one-line explanation.
 */
export function PageHero({
  theme,
  icon,
  title,
  description,
  badge,
}: PageHeroProps) {
  return (
    <div
      className={`${getTheme(theme).hero} rounded-xl shadow-lg p-6 text-white`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-white/20 rounded-lg flex items-center justify-center text-2xl leading-none">
          {icon}
        </div>
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <p className="text-white/90 text-sm">{description}</p>
      {badge && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="px-2 py-1 bg-white/20 rounded-full">
            {badge.label}
          </span>
          {badge.note && <span className="text-white/80">{badge.note}</span>}
        </div>
      )}
    </div>
  );
}
