/**
 * A block of article body. Articles used to be a flat `string[]` of paragraphs,
 * which meant an editor could not set a sub-heading or pull out a quote — both
 * were silently flattened on the way in. Blocks fix that.
 *
 * `text` may carry inline markup: `**bold**`, `*italic*` and
 * `[label](https://…)`. It is parsed into React elements by `renderInline()` in
 * ./articleContent — never injected as HTML.
 */
export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h2'; text: string }
  | { kind: 'quote'; text: string; attribution?: string }
  | { kind: 'image'; src: string; alt: string; credit?: string }

export interface Source {
  label: string
  url: string
}

export interface Article {
  slug: string
  category: string
  title: string
  excerpt: string
  date: string
  readTime: string
  image: string
  imageAlt: string
  /** Who to credit for the hero image. Shown under it when present. */
  imageCredit?: string
  /** Byline. Articles written before bylines existed simply have none. */
  author?: string
  /**
   * Where the story came from. Deliberately NOT rendered in the article body —
   * it is an editorial record, kept with the article so it stays available for
   * structured data and for anyone checking the origin later.
   */
  sources?: Source[]
  /**
   * `string[]` is still valid and means "these are plain paragraphs", so every
   * article written before blocks existed keeps working untouched. Read it
   * through `toBlocks()` from ./articleContent rather than directly.
   */
  content: string[] | Block[]
}

export const ARTICLES: Article[] = [
  {
    slug: 'rennsport-summit-2026-munich',
    category: 'Events',
    title: 'RENNSPORT Summit 2026: The Re-Launch Heads to Munich',
    excerpt:
      'Competition Company\'s racing sim returns with a bold new vision — "Double the Content, Half the Price." The RENNSPORT Summit 2026 in Munich brings Le Mans, modding tools, and the ESL R1 league together.',
    date: '2026-03-10',
    readTime: '4 min',
    image: '/images/events/rennsport-relaunch-2026/DSC00329.jpg',
    imageAlt: 'RENNSPORT Re-Launch 2026 event with Racespot branding',
    content: [
      'RENNSPORT is back — and bigger than ever. Competition Company has unveiled its plans for the RENNSPORT Summit 2026, taking place in Munich later this year. The event marks a turning point for the racing simulation that aims to shake up the genre with an aggressive content roadmap and community-first approach.',
      'Under the motto "Double the Content — Half the Price," RENNSPORT promises a revamped business model alongside major content drops. Among the highlights: the legendary Circuit de la Sarthe (Le Mans) and Sebring International Raceway join the track roster, while full modding support opens the door for the community to shape the game\'s future.',
      'The ESL R1 League — the flagship esports competition built on RENNSPORT — continues to grow, with teams and drivers from around the world competing for top honors. The Summit in Munich will serve as both a showcase for upcoming features and a gathering point for the sim racing community.',
      'Racespot has been closely involved with the RENNSPORT ecosystem, providing broadcast coverage for ESL R1 events. As the platform evolves, so does the scope of production — from online streams to live arena shows.',
      'The Summit will feature hands-on demos, developer panels, and competitive showmatches. More details on the exact dates and venue will follow in the coming weeks.',
    ],
  },
  {
    slug: 'vco-infinity-24h-endurance',
    category: 'Esports',
    title: 'VCO Infinity: 24 Hours of Non-Stop Sim Racing',
    excerpt:
      '40 teams, 250+ drivers, 24 races in 24 hours — VCO Infinity pushes the endurance format to its absolute limit on iRacing. Here\'s how the marathon event unfolded.',
    date: '2026-02-20',
    readTime: '5 min',
    image: '/images/gallery/VCO_Infinity_HiRes.jpg',
    imageAlt: 'VCO Infinity prototype endurance racing on iRacing',
    content: [
      'Virtual Competition Organisation (VCO) has built a reputation for innovative sim racing formats, and VCO Infinity might be their most ambitious concept yet. The premise: 24 races in 24 hours, each lasting 45 minutes, rotating through 5 different cars and 5 different tracks on iRacing.',
      'With over 40 teams and 250 drivers signed up, the event demanded elite-level consistency. Unlike a traditional 24-hour endurance race, VCO Infinity tested adaptability — drivers had to master multiple car classes and circuits within a single day of competition.',
      'The prize pool of over $5,000 added a competitive edge, but the real draw was the format itself. Teams had to manage driver rotations, adapt strategies on the fly, and maintain concentration across diverse racing conditions — from GT3 sprints to prototype endurance stints.',
      'Racespot provided continuous broadcast coverage throughout the 24-hour window, with rotating commentary teams keeping viewers engaged through every session. The production featured live timing integration, onboard cameras, and real-time standings across all race sessions.',
      'VCO Infinity represents a growing trend in sim racing: events designed specifically for the digital medium, rather than trying to replicate real-world formats. It\'s this kind of innovation that keeps the community engaged and pushes the boundaries of what esports competitions can be.',
    ],
  },
  {
    slug: 'erl-2025-season-finals-maastricht',
    category: 'Esports',
    title: 'ERL Season 5: 23 Teams Battle Across 6 Games for the European Title',
    excerpt:
      'The European Racing League\'s most ambitious season yet spans ACC, LMU, Gran Turismo 7, iRacing, RENNSPORT, and more — with the Grand Finals held live at Sim Formula Europe in Maastricht.',
    date: '2026-01-28',
    readTime: '4 min',
    image: '/images/gallery/ERLFinals-Heat1-38.jpeg',
    imageAlt: 'ERL Finals with sim racing rigs and VCO branding',
    content: [
      'The European Racing League (ERL) has established itself as one of the most unique competitions in sim racing. While most leagues focus on a single platform, the ERL challenges teams to compete across six different racing games — a true test of versatile driving skill.',
      'Season 5, running from September 2025 through January 2026, featured 23 teams of 5 drivers each. The title roster included Assetto Corsa Competizione, Le Mans Ultimate, Gran Turismo 7, iRacing, and RENNSPORT — each bringing its own physics model, car behavior, and competitive dynamics.',
      'The season culminated in the Final4, held live at the Sim Formula Europe event in Maastricht. Four surviving teams went head-to-head in a pressure-cooker format, with live crowds and broadcast cameras capturing every overtake and strategic gamble.',
      'Racespot has been the broadcast partner for the ERL since its inception, producing coverage that spans multiple sim titles within a single broadcast. It\'s a production challenge unlike any other — different game engines, different graphical fidelity, different replay systems — all woven into a cohesive viewing experience.',
      'The ERL continues to grow, and its multi-title approach may well be the future of sim racing esports. As the lines between platforms blur, competitions that reward all-round skill will only become more relevant.',
    ],
  },
  {
    slug: 'sim-racing-expo-2025-record-attendance',
    category: 'Events',
    title: 'Sim Racing Expo 2025: Over 24,000 Visitors Set New Record',
    excerpt:
      'The world\'s largest sim racing trade show drew 24,371 visitors to the Nürburgring — featuring the Assetto Corsa Rally world premiere, 155 million social media impressions, and the Super GT experience.',
    date: '2025-11-02',
    readTime: '4 min',
    image: '/images/gallery/SRE_2025_Hardware.jpg',
    imageAlt: 'Sim Racing Expo 2025 Dortmund — hardware showcases and event highlights',
    content: [
      'The Sim Racing Expo 2025, held from October 17 to 19 at the Nürburgring, has once again proven that sim racing is no longer a niche hobby. With 24,371 visitors passing through the gates, the event set a new attendance record and solidified its position as the world\'s premier sim racing trade show.',
      'The headline announcement was the world premiere of Assetto Corsa Rally — Kunos Simulazioni\'s long-awaited entry into the rally genre. Attendees were among the first to go hands-on with the title, and the reaction was overwhelmingly positive. The reveal alone generated massive social media buzz, contributing to the event\'s total of 155 million social media impressions.',
      'Beyond the expo floor, the event featured live competitions, hardware showcases from major peripheral manufacturers, and meet-and-greets with sim racing personalities including content creator Misha Charoudin. The Super GT experience — letting visitors drive the Japanese touring car series in a full-motion simulator — was another crowd favorite.',
      'Racespot was on-site providing broadcast production for the competitive segments of the expo, capturing the energy of live sim racing in front of enthusiastic crowds. The combination of trade show, competition, and community gathering makes the Sim Racing Expo a unique fixture on the calendar.',
      'With the sim racing industry continuing to grow rapidly, the 2026 edition is expected to be even bigger. For hardware makers, software developers, and esports organizations alike, the Nürburgring weekend in October has become unmissable.',
    ],
  },
  {
    slug: 'imsa-esports-2025-virtual-meets-real',
    category: 'Broadcast',
    title: 'IMSA Esports: Where Virtual Prototypes Meet Real-World Heritage',
    excerpt:
      'The IMSA Esports series brings legendary endurance racing to the digital world — and Racespot brings it to your screen with broadcast-grade production across the full season.',
    date: '2025-10-15',
    readTime: '4 min',
    image: '/images/gallery/IMSAEsports_R4_EMM-1.jpg',
    imageAlt: 'IMSA Esports prototype racing under floodlights at Daytona',
    content: [
      'When IMSA — the sanctioning body behind the Rolex 24 at Daytona and Petit Le Mans — brings its legendary endurance racing heritage to the virtual world, the result is something special. The IMSA Esports series on iRacing captures the spirit of multi-class prototype and GT racing with a level of authenticity that only a direct partnership between IMSA and iRacing can deliver.',
      'The 2025 season featured races at iconic circuits including Daytona, Sebring, and Watkins Glen, with GTP prototypes and GT3 machinery sharing the track in true IMSA fashion. The multi-class dynamic — faster prototypes threading through GT traffic — creates broadcast moments that are as compelling to watch as their real-world counterparts.',
      'Racespot produces the complete broadcast for the IMSA Esports series, with multi-camera coverage, expert commentary, and real-time timing integration. Night races at Daytona, with headlights cutting through the darkness and prototype battles unfolding under the floodlights, are a particular visual highlight.',
      'The series attracts drivers from professional esports teams as well as real-world racers looking to hone their skills between physical race weekends. This crossover between virtual and real motorsport is exactly what makes IMSA Esports stand out in the crowded esports landscape.',
      'As IMSA expands its digital presence, the esports series continues to serve as both a competition platform and a gateway for new fans to discover endurance racing. The combination of prestige, authenticity, and world-class broadcast production makes it one of the most polished esports products in sim racing.',
    ],
  },
]

export const CATEGORY_COLORS: Record<string, string> = {
  Events: 'text-rs-yellow',
  Broadcast: 'text-green-400',
  Esports: 'text-blue-400',
  Motorsport: 'text-orange-400',
  Industry: 'text-purple-400',
  Company: 'text-purple-400',
}
