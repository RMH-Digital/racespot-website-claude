'use client'

/**
 * The tab row above a player when there is more than one stream to choose
 * from: two broadcasts live at once (LiveEmbed), or the parts of one
 * recording in an article (ArticleBroadcast). One look for both (Jürgen,
 * 2026-10-28). The box underneath joins it without a top border — pass the
 * player `attached`.
 */
export interface StreamTab {
  id: string
  label: string
  /** Small text after the label, e.g. the viewer count */
  extra?: string
}

export function StreamTabs({ tabs, activeId, onSelect, live = false, fit = false }: { tabs: StreamTab[]; activeId: string; onSelect: (id: string) => void; /** Red pulsing dot on the active tab, for streams on air */ live?: boolean; /** Short labels ("Part 2"): never cut them, let the row scroll instead */ fit?: boolean }) {
  return (
    <div className="flex gap-0 border-b border-rs-border mb-0 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(tab.id)}
            className={`relative flex items-center gap-2 py-3 text-xs font-display font-bold
              transition-colors flex-1 ${fit ? 'min-w-max justify-center px-2 sm:px-4' : 'min-w-0 px-4'}
              ${isActive ? 'text-white' : 'text-rs-muted hover:text-white/80'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? (live ? 'bg-rs-live animate-pulse-live' : 'bg-rs-yellow') : 'bg-rs-muted/50'}`} />
            <span className="truncate">{tab.label}</span>
            {tab.extra && <span className="text-[11px] text-rs-muted font-normal shrink-0">{tab.extra}</span>}
            {/* Active indicator bar */}
            {isActive && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-rs-yellow" />}
          </button>
        )
      })}
    </div>
  )
}
