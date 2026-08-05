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
    slug: "raceroom-super-touring-ford-mondeo-peugeot-406-roadmap",
    category: "Industry",
    title: "Ten Super Tourers and a Backend Rebuild: What RaceRoom's Roadmap Actually Commits To",
    excerpt: "RaceRoom has confirmed the Ford Mondeo and Peugeot 406 for its Super Touring roster, taking it to ten cars. The more consequential disclosures sit further down the list: automated championships, a new backend, and a December Nürburgring pack.",
    date: "2026-07-31",
    readTime: "4 min",
    image: "/images/news/raceroom-super-touring-ford-mondeo-peugeot-406-roadmap/publisher-news.webp",
    imageAlt: "Ten Super Tourers and a Backend Rebuild: What RaceRoom's Roadmap Actually Commits To",
    imageCredit: "Illustration: RACESPOT",
    author: "Lauren Hughes",
    sources: [
      { label: "traxion.gg", url: "https://traxion.gg/raceroom-confirms-ford-and-peugeot-super-touring-legends-in-development/" },
    ],
    content: [
      { kind: "p", text: "*RaceRoom* has confirmed that two more Super Touring cars are in development: the **Ford** Mondeo and the **Peugeot** 406. Work-in-progress renders of both have been shown, the release window is \"in the near future\", and no date has been attached. That takes the platform's officially licensed Super Touring roster to ten cars, alongside the **Alfa Romeo** 156, **Opel** Vectra and Volvo S40 — a lead over rival sims that is now large enough to look deliberate rather than incidental." },
      { kind: "p", text: "The two cars are the least interesting part of what KW Studios said. The same announcements also cover a new car class, a rebuild of the software the platform runs on and a December content pack — and those say more about where RaceRoom is going." },
      { kind: "h2", text: "The cars, and the one that isn't coming" },
      { kind: "p", text: "The Mondeo being modelled is a late-generation car, identified as either 1999 or 2000 specification by its swooping headlights, wider track and tighter front wings. That detail matters for anyone buying it: the later Mondeo is the car that took a British Touring Car Championship title in 2000, and its V6 required engineering work from Prodrive to bring the centre of gravity down and rebalance the weight distribution." },
      { kind: "p", text: "The 406's record is thinner in Britain — it never won a BTCC race — but it was a genuine force in Germany. **Laurent Aïello** took the 1997 STW title with it, finished runner-up in 1998 and third in 1996, which makes him comfortably the car's most successful driver and gives the model a championship-winning livery worth licensing." },
      { kind: "p", text: "One notable absence has now been explained. The **Nissan** Primera, a car most Super Touring rosters would want, is not happening." },
      { kind: "quote", text: "\"The only car we are not touching at the moment is the Nissan Primera as there was no chance to get a license done with Nissan.\"", attribution: "**Christian Wacker-Baur**, Director of Strategy and Sales, RaceRoom" },
      { kind: "p", text: "That is a straightforward licensing wall, and worth noting because it is the kind of gap that never gets filled retroactively." },
      { kind: "p", text: "The Mondeo also arrives on the back of a broader Ford agreement — the same deal that brought the Mustang GT3 to the platform in the 4 August summer update RaceSpot covered separately. One licence, two very different cars, several years apart in the schedule: that is what a platform-level deal buys." },
      { kind: "h2", text: "Classes, not cars" },
      { kind: "p", text: "The more revealing line concerns the NSU TT, the 1960s runabout that has an unusually loyal following in RaceRoom and no one to race against." },
      { kind: "quote", text: "\"The NSU TT is a small race car, very popular in RaceRoom, but it is a stand-alone car.\"", attribution: "Christian Wacker-Baur" },
      { kind: "quote", text: "\"We are working on two little 'brothers' for this car so it's not alone. In the near future, we will be able to create a car class around the NSU TT.\"", attribution: "Christian Wacker-Baur" },
      { kind: "p", text: "No models were named. The principle is the point: RaceRoom is describing content planning organised around fillable grids rather than standalone showpieces. The same logic shows up in the promise of one-make \"Cup\" cars carrying a French flag — not the **Alpine** A110 Cup, which was added free earlier this year, so something else from the same market." },
      { kind: "p", text: "Two further commitments were made. Automated multiplayer series and championships, tracking points across multiple ranked races, are in development. So is a new backend system, which **Jean-Francois Chardon**, Head of KW Studios, frames as the enabler for what players will actually see: \"having a driving school or single-player events with presets that you can click and already have a race setup that we think will be a fun combo.\"" },
      { kind: "p", text: "A backend rebuild is not a marketing asset, which is usually a sign that it is real work rather than a slide. It is also the piece that would have to land before automated championships could function at any scale." },
      { kind: "h2", text: "The F1 line, in its actual form" },
      { kind: "p", text: "Wacker-Baur was asked about Formula 1 and did not confirm anything:" },
      { kind: "quote", text: "\"There is a little chance that we can touch the Formula 1 topic in RaceRoom.\"" },
      { kind: "quote", text: "\"I cannot say too much about it, but there is maybe a chance we get a car. That would be really awesome and I think a Formula 1 experience on RaceRoom would be really great.\"" },
      { kind: "p", text: "\"A little chance\" and \"maybe\" are the operative words. This is an expressed interest, not a licence, and it should be read as one." },
      { kind: "h2", text: "What to watch" },
      { kind: "p", text: "The dated item is December: a \"big\" Nürburgring-themed update including liveries from this year's 24-hour race and \"two or three\" new cars from the event. That gives roughly four months to see whether the automated championship system and the backend it depends on arrive alongside it or slip past it. The Super Touring count going from eight to ten is the announcement. Whether RaceRoom can turn a deep car roster into populated, self-running grids is the question the roadmap is quietly asking itself." },
    ],
  },
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
