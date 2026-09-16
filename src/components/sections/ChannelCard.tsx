import { getT, LOCALES, type Lang } from '@/lib/i18n'
import { getSiteStats, roundedDown } from '@/lib/stats'
import { SOCIAL, YOUTUBE_SUBSCRIBE_URL, YOUTUBE_URL, YouTubeIcon } from '@/lib/socials'

/**
 * The third tile in "Latest broadcasts": the channel itself.
 *
 * Two recordings and, in the same grid cell the third would have taken, the
 * place they come from — handle, subscriber count, one subscribe button and
 * the other five channels as icons. It reads as a card among cards, which is
 * the point: an ask for a follow that takes no room of its own and sits
 * exactly where someone has just seen what following gets them.
 *
 * Plain links throughout. `sub_confirmation=1` makes YouTube itself ask
 * "Subscribe?" on arrival, so no script of Google's runs here.
 */
export async function ChannelCard({ lang }: { lang: Lang }) {
  const t = getT(lang)
  const stats = await getSiteStats()
  const subscribers = roundedDown(stats.youtubeSubscribers, LOCALES[lang], 100)
  const others = SOCIAL.filter((s) => s.key !== 'youtube')

  return (
    <div className="card-dark flex flex-col overflow-hidden">
      {/* Same proportions as a video thumbnail, so the row stays level */}
      <a
        href={YOUTUBE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex aspect-video flex-col items-center justify-center gap-3 bg-linear-to-br from-rs-gray via-rs-dark to-rs-black px-6 text-center"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rs-yellow text-rs-black shadow-lg transition-transform group-hover:scale-105">
          <YouTubeIcon size={26} />
        </span>
        <span className="font-display text-lg font-bold uppercase tracking-wide text-white">@RaceSpotTV</span>
        <span className="text-xs text-rs-muted">{t('social.subscribers').replace('{n}', subscribers)}</span>
      </a>

      {/* No sentence here: the video cards beside it carry a title and a
          line of meta, so the tile stays at button plus channel icons. */}
      <div className="flex flex-1 flex-col justify-between gap-4 p-4">
        <a
          href={YOUTUBE_SUBSCRIBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary btn-sm w-full"
        >
          <YouTubeIcon size={15} />
          {/* The card already says YouTube twice; one word is enough here and keeps the button on one line on a phone. */}
          {t('social.subscribe')}
        </a>
        <div className="mt-auto flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-rs-muted">{t('social.alsoOn')}</span>
          <div className="flex gap-1">
            {others.map((s) => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                title={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-rs text-rs-muted transition-colors hover:bg-rs-gray hover:text-rs-yellow"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
