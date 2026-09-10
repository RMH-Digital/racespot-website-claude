import type { Lang } from './i18n'

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

/**
 * One translated version of an article. English stays in the article's own
 * fields; the other five languages live in `Article.translations`, keyed by
 * language. This is the contract with the Press Tool (docs/TODO.md, item 1):
 * the slug is English and shared, everything language-neutral (`category`,
 * `date`, `image`, `imageCredit`, `author`, `sources`, image `credit`s in
 * blocks) is stored once on the article.
 */
export interface ArticleTranslation {
  title: string
  excerpt: string
  imageAlt: string
  /** Same block kinds, same inline syntax as the English `content`. */
  content: Block[]
  /** Omitted = the English value. */
  readTime?: string
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
  /**
   * The other five languages. A missing language renders the English text
   * and gets no `hreflang` — a half-translated page is never indexed.
   */
  translations?: Partial<Record<Exclude<Lang, 'en'>, ArticleTranslation>>
}

export const ARTICLES: Article[] = [
  {
    slug: "moza-racing-title-sponsor-fia-f4-global-esports-2026",
    category: "Industry",
    title: "MOZA Racing Renews as Title Sponsor of the FIA F4 Global Esports Championship",
    excerpt: "MOZA Racing is back as title sponsor of the FIA F4 Global Esports Championship for a second season, with a $35,000 prize pool and a three-region qualifying structure feeding an eight-round Global Championship on iRacing from October.",
    date: "2026-08-04",
    readTime: "1 min",
    image: "/images/news/moza-racing-title-sponsor-fia-f4-global-esports-2026/iracing-fia-f4-esports-championship-2026-2.webp",
    imageAlt: "MOZA Racing Renews as Title Sponsor of the FIA F4 Global Esports Championship",
    imageCredit: "MOZA Racing",
    author: "Lauren Hughes",
    sources: [
      { label: "MOZA Racing", url: "https://www.mozaracing.com" },
      { label: "iracing.com", url: "https://www.iracing.com/fia-f4-esports/" },
    ],
    content: [
      { kind: "p", text: "**MOZA Racing** is renewing as title sponsor of the FIA F4 Global Esports Championship for a second consecutive season, keeping its name on one of the more established pathways from a controller or wheel into single-seater racing. The 2026 edition runs on **iRacing** and carries a $35,000 prize pool — the same structure as last year, repeated rather than expanded." },
      { kind: "image", src: "/images/news/moza-racing-title-sponsor-fia-f4-global-esports-2026/iracing-fia-f4-esports-championship-2026-1.webp", alt: "MOZA and iRacing key visual: a MOZA sim rig with triple screens under blue studio lighting, captioned Feel Every Detail — 360Hz FFB Signal and LFE Haptics Effect", credit: "MOZA Racing" },
      { kind: "h2", text: "The structure hasn't changed, and that's the point" },
      { kind: "p", text: "The format is a straightforward funnel: drivers compete in a Regional Tour across the Americas, Europe and Asia-Pacific, all on iRacing, with the top 10 from each region advancing to the Global Championship." },
      { kind: "p", text: "The Global Championship itself starts October 31 and runs eight rounds across four doubleheader events, spaced weekly through October 31, November 7, November 14 and November 21. Races are broadcast live on iRacing's own social channels, which keeps distribution in-house rather than routed through a broadcast partner." },
      { kind: "image", src: "/images/news/moza-racing-title-sponsor-fia-f4-global-esports-2026/iracing-fia-f4-esports-championship-2026-3.webp", alt: "MOZA F4 FIA Esports Global Championship 2026 race schedule graphic listing four dates in October and November", credit: "MOZA Racing" },
      { kind: "h2", text: "Last season's momentum" },
      { kind: "p", text: "MOZA sums up last season as delivering \"unforgettable moments on track, with intense wheel-to-wheel battles and the rise of standout talents who proved themselves on the global stage.\" The renewal, the company says, continues \"this evolving chapter of esports racing, building on a partnership that helps push the boundaries of competitive sim racing.\"" },
      { kind: "p", text: "*Based on a press release from MOZA Racing · [www.mozaracing.com](https://www.mozaracing.com) · [www.iracing.com](https://www.iracing.com/fia-f4-esports/)*" },
    ],
    translations: {
      de: {
        title: "MOZA Racing verlängert Titelsponsoring der FIA F4 Global Esports Championship",
        excerpt: "MOZA Racing ist für eine zweite Saison als Titelsponsor der FIA F4 Global Esports Championship zurück, mit einem Preisgeld von 35.000 $ und einer dreiregionalen Qualifikationsstruktur, die in eine achtrunden Global Championship auf iRacing ab Oktober mündet.",
        imageAlt: "MOZA Racing verlängert Titelsponsoring der FIA F4 Global Esports Championship",
        readTime: "1 min",
        content: [
          { kind: "p", text: "**MOZA Racing** verlängert das Titelsponsoring der FIA F4 Global Esports Championship für eine zweite Saison in Folge und bleibt damit einer der etablierteren Wege vom Controller oder Lenkrad in den Einsitzer-Rennsport treu. Die Ausgabe 2026 läuft auf **iRacing** und ist mit einem Preisgeld von 35.000 $ dotiert – dieselbe Struktur wie im Vorjahr, wiederholt statt erweitert." },
          { kind: "image", src: "/images/news/moza-racing-title-sponsor-fia-f4-global-esports-2026/iracing-fia-f4-esports-championship-2026-1.webp", alt: "MOZA und iRacing Key Visual: ein MOZA Sim-Rig mit Triple-Screen-Aufbau unter blauem Studiolicht, mit der Bildunterschrift „Feel Every Detail — 360Hz FFB Signal and LFE Haptics Effect\"", credit: "MOZA Racing" },
          { kind: "h2", text: "Die Struktur hat sich nicht geändert – und genau das ist der Punkt" },
          { kind: "p", text: "Das Format ist ein klarer Trichter: Die Fahrer treten in einer Regional Tour in den Amerikas, Europa und Asien-Pazifik gegeneinander an, jeweils auf iRacing, wobei die Top 10 jeder Region in die Global Championship aufsteigen." },
          { kind: "p", text: "Die Global Championship selbst beginnt am 31. Oktober und umfasst acht Rennen über vier Doppelveranstaltungen, die wöchentlich am 31. Oktober, 7. November, 14. November und 21. November stattfinden. Die Rennen werden live auf iRacings eigenen Social-Media-Kanälen übertragen, wodurch die Distribution intern bleibt statt über einen Übertragungspartner zu laufen." },
          { kind: "image", src: "/images/news/moza-racing-title-sponsor-fia-f4-global-esports-2026/iracing-fia-f4-esports-championship-2026-3.webp", alt: "MOZA F4 FIA Esports Global Championship 2026 Rennkalender-Grafik mit vier Terminen im Oktober und November", credit: "MOZA Racing" },
          { kind: "h2", text: "Der Schwung der vergangenen Saison" },
          { kind: "p", text: "MOZA fasst die vergangene Saison als eine Saison zusammen, die „unvergessliche Momente auf der Strecke, mit intensiven Rad-an-Rad-Duellen und dem Aufstieg herausragender Talente, die sich auf der Weltbühne bewiesen haben\" lieferte. Die Verlängerung, so das Unternehmen, setze „dieses sich weiterentwickelnde Kapitel des Esports-Rennsports fort und baue auf einer Partnerschaft auf, die hilft, die Grenzen des kompetitiven Sim Racing zu verschieben\"." },
          { kind: "p", text: "*Basierend auf einer Pressemitteilung von MOZA Racing · [www.mozaracing.com](https://www.mozaracing.com) · [www.iracing.com](https://www.iracing.com/fia-f4-esports/)*" },
        ],
      },
      es: {
        title: "MOZA Racing renueva como patrocinador principal del FIA F4 Global Esports Championship",
        excerpt: "MOZA Racing vuelve como patrocinador principal del FIA F4 Global Esports Championship por segunda temporada, con una bolsa de premios de 35.000 $ y una estructura clasificatoria de tres regiones que desemboca en un Global Championship de ocho rondas en iRacing a partir de octubre.",
        imageAlt: "MOZA Racing renueva como patrocinador principal del FIA F4 Global Esports Championship",
        readTime: "1 min",
        content: [
          { kind: "p", text: "**MOZA Racing** renueva su patrocinio principal del FIA F4 Global Esports Championship por segunda temporada consecutiva, manteniendo su nombre en uno de los caminos más consolidados desde un mando o volante hasta las carreras de monoplazas. La edición 2026 se disputa en **iRacing** y cuenta con una bolsa de premios de 35.000 $ — la misma estructura que el año pasado, repetida en lugar de ampliada." },
          { kind: "image", src: "/images/news/moza-racing-title-sponsor-fia-f4-global-esports-2026/iracing-fia-f4-esports-championship-2026-1.webp", alt: "Imagen principal de MOZA e iRacing: un simulador MOZA con triple pantalla bajo iluminación de estudio azul, con el pie «Feel Every Detail — 360Hz FFB Signal and LFE Haptics Effect»", credit: "MOZA Racing" },
          { kind: "h2", text: "La estructura no ha cambiado, y esa es la cuestión" },
          { kind: "p", text: "El formato es un embudo sencillo: los pilotos compiten en un Regional Tour por América, Europa y Asia-Pacífico, todo en iRacing, y los 10 primeros de cada región avanzan al Global Championship." },
          { kind: "p", text: "El propio Global Championship arranca el 31 de octubre y consta de ocho rondas repartidas en cuatro eventos dobles, espaciados semanalmente el 31 de octubre, el 7 de noviembre, el 14 de noviembre y el 21 de noviembre. Las carreras se retransmiten en directo por los propios canales sociales de iRacing, lo que mantiene la distribución interna en lugar de pasar por un socio de emisión." },
          { kind: "image", src: "/images/news/moza-racing-title-sponsor-fia-f4-global-esports-2026/iracing-fia-f4-esports-championship-2026-3.webp", alt: "Gráfico del calendario de carreras del MOZA F4 FIA Esports Global Championship 2026 con cuatro fechas en octubre y noviembre", credit: "MOZA Racing" },
          { kind: "h2", text: "El impulso de la temporada pasada" },
          { kind: "p", text: "MOZA resume la temporada pasada como generadora de «momentos inolvidables en pista, con intensas batallas rueda a rueda y el ascenso de talentos destacados que se demostraron a sí mismos en el escenario global». La renovación, según la compañía, continúa «este capítulo en evolución de las carreras de esports, construyendo sobre una asociación que ayuda a superar los límites del sim racing competitivo»." },
          { kind: "p", text: "*Basado en un comunicado de prensa de MOZA Racing · [www.mozaracing.com](https://www.mozaracing.com) · [www.iracing.com](https://www.iracing.com/fia-f4-esports/)*" },
        ],
      },
      fr: {
        title: "MOZA Racing renouvelle son sponsoring titre du FIA F4 Global Esports Championship",
        excerpt: "MOZA Racing revient comme sponsor titre du FIA F4 Global Esports Championship pour une deuxième saison, avec une cagnotte de 35 000 $ et une structure qualificative en trois régions menant à un Global Championship de huit manches sur iRacing à partir d'octobre.",
        imageAlt: "MOZA Racing renouvelle son sponsoring titre du FIA F4 Global Esports Championship",
        readTime: "1 min",
        content: [
          { kind: "p", text: "**MOZA Racing** renouvelle son sponsoring titre du FIA F4 Global Esports Championship pour une deuxième saison consécutive, conservant son nom sur l'une des voies les plus établies menant d'une manette ou d'un volant aux monoplaces. L'édition 2026 se déroule sur **iRacing** et propose une cagnotte de 35 000 $ — la même structure que l'an dernier, reconduite plutôt qu'étendue." },
          { kind: "image", src: "/images/news/moza-racing-title-sponsor-fia-f4-global-esports-2026/iracing-fia-f4-esports-championship-2026-1.webp", alt: "Visuel clé MOZA et iRacing : un poste de simulation MOZA à triple écran sous un éclairage de studio bleu, avec la légende « Feel Every Detail — 360Hz FFB Signal and LFE Haptics Effect »", credit: "MOZA Racing" },
          { kind: "h2", text: "La structure n'a pas changé, et c'est bien là l'idée" },
          { kind: "p", text: "Le format est un entonnoir simple : les pilotes s'affrontent lors d'un Regional Tour dans les Amériques, en Europe et en Asie-Pacifique, tous sur iRacing, les 10 premiers de chaque région se qualifiant pour le Global Championship." },
          { kind: "p", text: "Le Global Championship démarre le 31 octobre et se déroule sur huit manches réparties en quatre réunions à double manche, espacées chaque semaine les 31 octobre, 7 novembre, 14 novembre et 21 novembre. Les courses sont diffusées en direct sur les propres réseaux sociaux d'iRacing, ce qui garde la diffusion en interne plutôt que via un partenaire de diffusion." },
          { kind: "image", src: "/images/news/moza-racing-title-sponsor-fia-f4-global-esports-2026/iracing-fia-f4-esports-championship-2026-3.webp", alt: "Graphique du calendrier de courses du MOZA F4 FIA Esports Global Championship 2026 listant quatre dates en octobre et novembre", credit: "MOZA Racing" },
          { kind: "h2", text: "L'élan de la saison dernière" },
          { kind: "p", text: "MOZA résume la saison dernière comme ayant offert « des moments inoubliables sur la piste, avec des duels roue contre roue intenses et l'émergence de talents qui ont fait leurs preuves sur la scène mondiale ». Ce renouvellement, selon l'entreprise, prolonge « ce chapitre en constante évolution de l'esports racing, en s'appuyant sur un partenariat qui aide à repousser les limites du sim racing compétitif »." },
          { kind: "p", text: "*D'après un communiqué de presse de MOZA Racing · [www.mozaracing.com](https://www.mozaracing.com) · [www.iracing.com](https://www.iracing.com/fia-f4-esports/)*" },
        ],
      },
      it: {
        title: "MOZA Racing rinnova come title sponsor del FIA F4 Global Esports Championship",
        excerpt: "MOZA Racing torna come title sponsor del FIA F4 Global Esports Championship per una seconda stagione, con un montepremi di 35.000 $ e una struttura di qualificazione in tre regioni che porta a un Global Championship di otto round su iRacing da ottobre.",
        imageAlt: "MOZA Racing rinnova come title sponsor del FIA F4 Global Esports Championship",
        readTime: "1 min",
        content: [
          { kind: "p", text: "**MOZA Racing** rinnova come title sponsor del FIA F4 Global Esports Championship per una seconda stagione consecutiva, mantenendo il proprio nome su uno dei percorsi più consolidati da un controller o un volante fino alle monoposto. L'edizione 2026 si svolge su **iRacing** e mette in palio un montepremi di 35.000 $ — la stessa struttura dello scorso anno, ripetuta anziché ampliata." },
          { kind: "image", src: "/images/news/moza-racing-title-sponsor-fia-f4-global-esports-2026/iracing-fia-f4-esports-championship-2026-1.webp", alt: "Immagine chiave MOZA e iRacing: una postazione sim MOZA con tripla schermata sotto luce blu da studio, con la didascalia «Feel Every Detail — 360Hz FFB Signal and LFE Haptics Effect»", credit: "MOZA Racing" },
          { kind: "h2", text: "La struttura non è cambiata, ed è proprio questo il punto" },
          { kind: "p", text: "Il formato è un imbuto semplice: i piloti gareggiano in un Regional Tour tra Americhe, Europa e Asia-Pacifico, tutto su iRacing, con i primi 10 di ogni regione che avanzano al Global Championship." },
          { kind: "p", text: "Il Global Championship vero e proprio inizia il 31 ottobre e si articola in otto round su quattro eventi doppi, distanziati settimanalmente il 31 ottobre, il 7 novembre, il 14 novembre e il 21 novembre. Le gare sono trasmesse in diretta sui canali social dello stesso iRacing, il che mantiene la distribuzione interna anziché passare da un partner di trasmissione." },
          { kind: "image", src: "/images/news/moza-racing-title-sponsor-fia-f4-global-esports-2026/iracing-fia-f4-esports-championship-2026-3.webp", alt: "Grafica del calendario gare del MOZA F4 FIA Esports Global Championship 2026 con quattro date tra ottobre e novembre", credit: "MOZA Racing" },
          { kind: "h2", text: "Lo slancio della scorsa stagione" },
          { kind: "p", text: "MOZA riassume la scorsa stagione come portatrice di «momenti indimenticabili in pista, con intense battaglie ruota a ruota e l'emergere di talenti che si sono messi in mostra sul palcoscenico globale». Il rinnovo, afferma l'azienda, prosegue «questo capitolo in evoluzione delle corse esports, costruendo su una partnership che aiuta a spingere i confini del sim racing competitivo»." },
          { kind: "p", text: "*Sulla base di un comunicato stampa di MOZA Racing · [www.mozaracing.com](https://www.mozaracing.com) · [www.iracing.com](https://www.iracing.com/fia-f4-esports/)*" },
        ],
      },
      pt: {
        title: "MOZA Racing renova como patrocinadora principal do FIA F4 Global Esports Championship",
        excerpt: "A MOZA Racing está de volta como patrocinadora principal do FIA F4 Global Esports Championship por uma segunda temporada, com uma premiação de US$ 35.000 e uma estrutura classificatória de três regiões que leva a um Global Championship de oito rodadas no iRacing a partir de outubro.",
        imageAlt: "MOZA Racing renova como patrocinadora principal do FIA F4 Global Esports Championship",
        readTime: "1 min",
        content: [
          { kind: "p", text: "A **MOZA Racing** está renovando o patrocínio principal do FIA F4 Global Esports Championship pela segunda temporada consecutiva, mantendo seu nome em um dos caminhos mais consolidados de um controle ou volante até as corridas de monopostos. A edição de 2026 acontece no **iRacing** e traz uma premiação de US$ 35.000 — a mesma estrutura do ano passado, repetida em vez de ampliada." },
          { kind: "image", src: "/images/news/moza-racing-title-sponsor-fia-f4-global-esports-2026/iracing-fia-f4-esports-championship-2026-1.webp", alt: "Imagem principal MOZA e iRacing: um rig de simulador MOZA com três telas sob luz de estúdio azul, com a legenda «Feel Every Detail — 360Hz FFB Signal and LFE Haptics Effect»", credit: "MOZA Racing" },
          { kind: "h2", text: "A estrutura não mudou, e esse é o ponto" },
          { kind: "p", text: "O formato é um funil direto: os pilotos competem em um Regional Tour pelas Américas, Europa e Ásia-Pacífico, todos no iRacing, com os 10 primeiros de cada região avançando para o Global Championship." },
          { kind: "p", text: "O Global Championship em si começa em 31 de outubro e tem oito rodadas em quatro eventos duplos, espaçados semanalmente em 31 de outubro, 7 de novembro, 14 de novembro e 21 de novembro. As corridas são transmitidas ao vivo nos próprios canais sociais do iRacing, o que mantém a distribuição interna em vez de passar por um parceiro de transmissão." },
          { kind: "image", src: "/images/news/moza-racing-title-sponsor-fia-f4-global-esports-2026/iracing-fia-f4-esports-championship-2026-3.webp", alt: "Gráfico do calendário de corridas do MOZA F4 FIA Esports Global Championship 2026 listando quatro datas em outubro e novembro", credit: "MOZA Racing" },
          { kind: "h2", text: "O embalo da temporada passada" },
          { kind: "p", text: "A MOZA resume a temporada passada como geradora de «momentos inesquecíveis na pista, com batalhas roda a roda intensas e a ascensão de talentos de destaque que se provaram no palco global». A renovação, diz a empresa, dá continuidade a «este capítulo em evolução das corridas de esports, construindo sobre uma parceria que ajuda a expandir os limites do sim racing competitivo»." },
          { kind: "p", text: "*Baseado em um comunicado de imprensa da MOZA Racing · [www.mozaracing.com](https://www.mozaracing.com) · [www.iracing.com](https://www.iracing.com/fia-f4-esports/)*" },
        ],
      },
    },
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
    translations: {
      de: {
        title: "RENNSPORT Summit 2026: Der Re-Launch kommt nach München",
        excerpt: "Die Rennsimulation der Competition Company kehrt mit einer klaren Ansage zurück — „Doppelter Inhalt, halber Preis“. Der RENNSPORT Summit 2026 in München bringt Le Mans, Modding-Werkzeuge und die ESL R1 League zusammen.",
        imageAlt: "RENNSPORT Re-Launch 2026 mit Racespot-Branding",
        content: [
          { kind: "p", text: "RENNSPORT ist zurück — und größer als je zuvor. Die Competition Company hat ihre Pläne für den RENNSPORT Summit 2026 vorgestellt, der im Laufe des Jahres in München stattfindet. Das Event markiert einen Wendepunkt für die Rennsimulation, die das Genre mit einer offensiven Content-Roadmap und einem Community-first-Ansatz aufmischen will." },
          { kind: "p", text: "Unter dem Motto „Doppelter Inhalt — halber Preis“ verspricht RENNSPORT ein überarbeitetes Geschäftsmodell und große Content-Updates. Zu den Highlights: der legendäre Circuit de la Sarthe (Le Mans) und der Sebring International Raceway kommen ins Streckenangebot, und volle Modding-Unterstützung öffnet der Community die Tür, die Zukunft des Spiels mitzugestalten." },
          { kind: "p", text: "Die ESL R1 League — der Esports-Wettbewerb an der Spitze von RENNSPORT — wächst weiter, mit Teams und Fahrern aus aller Welt im Kampf um die Titel. Der Summit in München ist Schaufenster für kommende Features und Treffpunkt der Simracing-Community zugleich." },
          { kind: "p", text: "Racespot ist eng mit dem RENNSPORT-Ökosystem verbunden und produziert die Broadcasts der ESL R1 Events. Mit der Plattform wächst auch der Umfang der Produktion — von Online-Streams bis zu Live-Shows in der Arena." },
          { kind: "p", text: "Der Summit bietet Hands-on-Demos, Entwickler-Panels und Showmatches. Details zu Termin und Veranstaltungsort folgen in den kommenden Wochen." },
        ],
      },
      es: {
        title: "RENNSPORT Summit 2026: el relanzamiento llega a Múnich",
        excerpt: "El simulador de carreras de Competition Company vuelve con una visión ambiciosa: «el doble de contenido a la mitad de precio». El RENNSPORT Summit 2026 en Múnich reúne Le Mans, herramientas de modding y la liga ESL R1.",
        imageAlt: "Evento de relanzamiento de RENNSPORT 2026 con la marca Racespot",
        content: [
          { kind: "p", text: "RENNSPORT ha vuelto, y más grande que nunca. Competition Company ha presentado sus planes para el RENNSPORT Summit 2026, que se celebrará en Múnich a lo largo de este año. El evento marca un punto de inflexión para la simulación de carreras, que pretende sacudir el género con una hoja de ruta de contenidos agresiva y un enfoque centrado en la comunidad." },
          { kind: "p", text: "Bajo el lema «el doble de contenido, la mitad de precio», RENNSPORT promete un modelo de negocio renovado junto con grandes lanzamientos de contenido. Entre lo más destacado: el legendario Circuit de la Sarthe (Le Mans) y el Sebring International Raceway se suman a la lista de circuitos, mientras que el soporte completo de modding abre la puerta a que la comunidad dé forma al futuro del juego." },
          { kind: "p", text: "La ESL R1 League, la competición de esports insignia construida sobre RENNSPORT, sigue creciendo, con equipos y pilotos de todo el mundo luchando por los máximos honores. El Summit de Múnich servirá tanto de escaparate para las próximas funciones como de punto de encuentro para la comunidad del simracing." },
          { kind: "p", text: "Racespot ha estado estrechamente vinculada al ecosistema RENNSPORT, produciendo la cobertura en directo de los eventos de la ESL R1. A medida que evoluciona la plataforma, también lo hace el alcance de la producción: de los streams online a los espectáculos en vivo en arenas." },
          { kind: "p", text: "El Summit contará con demostraciones prácticas, mesas redondas con desarrolladores y partidos de exhibición. En las próximas semanas se darán más detalles sobre las fechas exactas y el lugar." },
        ],
      },
      pt: {
        title: "RENNSPORT Summit 2026: o relançamento chega a Munique",
        excerpt: "O simulador de corridas da Competition Company volta com uma visão ousada — \"o dobro de conteúdo pela metade do preço\". O RENNSPORT Summit 2026, em Munique, reúne Le Mans, ferramentas de modding e a liga ESL R1.",
        imageAlt: "Evento de relançamento do RENNSPORT 2026 com a marca Racespot",
        content: [
          { kind: "p", text: "O RENNSPORT está de volta — e maior do que nunca. A Competition Company revelou seus planos para o RENNSPORT Summit 2026, que acontece em Munique ainda este ano. O evento marca uma virada para o simulador de corridas, que quer sacudir o gênero com um roadmap de conteúdo agressivo e uma abordagem que coloca a comunidade em primeiro lugar." },
          { kind: "p", text: "Sob o lema \"o dobro de conteúdo — metade do preço\", o RENNSPORT promete um modelo de negócio renovado e grandes lançamentos de conteúdo. Entre os destaques: o lendário Circuit de la Sarthe (Le Mans) e o Sebring International Raceway entram na lista de pistas, e o suporte completo a mods abre a porta para a comunidade moldar o futuro do jogo." },
          { kind: "p", text: "A ESL R1 League — a principal competição de esports construída sobre o RENNSPORT — continua crescendo, com equipes e pilotos do mundo todo disputando os títulos. O Summit em Munique será vitrine dos próximos recursos e ponto de encontro da comunidade de simracing." },
          { kind: "p", text: "A Racespot está profundamente envolvida no ecossistema RENNSPORT e produz as transmissões dos eventos da ESL R1. Com a evolução da plataforma cresce também o escopo da produção — dos streams on-line aos shows ao vivo em arenas." },
          { kind: "p", text: "O Summit terá demonstrações práticas, painéis com desenvolvedores e showmatches competitivos. Mais detalhes sobre datas e local serão divulgados nas próximas semanas." },
        ],
      },
      fr: {
        title: "RENNSPORT Summit 2026 : le relancement met le cap sur Munich",
        excerpt: "La simulation de course de Competition Company revient avec une ambition affichée — « deux fois plus de contenu, moitié prix ». Le RENNSPORT Summit 2026 à Munich réunit Le Mans, les outils de modding et la ligue ESL R1.",
        imageAlt: "Événement de relancement RENNSPORT 2026 aux couleurs de Racespot",
        content: [
          { kind: "p", text: "RENNSPORT est de retour — et plus grand que jamais. Competition Company a dévoilé ses plans pour le RENNSPORT Summit 2026, qui se tiendra à Munich dans le courant de l’année. L’événement marque un tournant pour la simulation de course, qui entend bousculer le genre avec une feuille de route de contenus offensive et une approche qui place la communauté au premier plan." },
          { kind: "p", text: "Sous la devise « deux fois plus de contenu — moitié prix », RENNSPORT promet un modèle économique revu ainsi que des ajouts de contenu majeurs. Parmi les temps forts : le légendaire Circuit de la Sarthe (Le Mans) et le Sebring International Raceway rejoignent la liste des circuits, tandis qu’un support complet du modding ouvre la porte à la communauté pour façonner l’avenir du jeu." },
          { kind: "p", text: "La ESL R1 League — la compétition esport phare bâtie sur RENNSPORT — continue de grandir, avec des équipes et des pilotes du monde entier qui se disputent les titres. Le Summit de Munich servira à la fois de vitrine pour les fonctionnalités à venir et de point de rencontre pour la communauté du simracing." },
          { kind: "p", text: "Racespot est étroitement impliqué dans l’écosystème RENNSPORT et assure la diffusion des événements de la ESL R1. À mesure que la plateforme évolue, la production prend de l’ampleur — des streams en ligne aux shows live en arène." },
          { kind: "p", text: "Le Summit proposera des démonstrations pratiques, des tables rondes avec les développeurs et des matchs d’exhibition. Les dates exactes et le lieu seront précisés dans les prochaines semaines." },
        ],
      },
      it: {
        title: "RENNSPORT Summit 2026: il rilancio fa tappa a Monaco di Baviera",
        excerpt: "Il simulatore di guida di Competition Company torna con una visione ambiziosa — «il doppio dei contenuti a metà prezzo». Il RENNSPORT Summit 2026 a Monaco di Baviera riunisce Le Mans, gli strumenti di modding e la lega ESL R1.",
        imageAlt: "Evento di rilancio RENNSPORT 2026 con il marchio Racespot",
        content: [
          { kind: "p", text: "RENNSPORT è tornato — ed è più grande che mai. Competition Company ha svelato i piani per il RENNSPORT Summit 2026, in programma a Monaco di Baviera nel corso dell’anno. L’evento segna una svolta per il simulatore di guida, che vuole scuotere il genere con una roadmap di contenuti aggressiva e un approccio che mette la community al primo posto." },
          { kind: "p", text: "Con il motto «il doppio dei contenuti — metà prezzo», RENNSPORT promette un modello di business rinnovato insieme a grandi aggiornamenti di contenuti. Tra i punti salienti: il leggendario Circuit de la Sarthe (Le Mans) e il Sebring International Raceway entrano nella lista dei tracciati, mentre il supporto completo al modding apre la porta alla community per plasmare il futuro del gioco." },
          { kind: "p", text: "La ESL R1 League — la competizione esports di punta costruita su RENNSPORT — continua a crescere, con team e piloti da tutto il mondo in lotta per i titoli. Il Summit di Monaco sarà al tempo stesso vetrina delle prossime funzionalità e punto d’incontro per la community del simracing." },
          { kind: "p", text: "Racespot è profondamente coinvolta nell’ecosistema RENNSPORT e produce le trasmissioni degli eventi ESL R1. Con l’evoluzione della piattaforma cresce anche la portata della produzione — dagli stream online agli show dal vivo nelle arene." },
          { kind: "p", text: "Il Summit offrirà demo hands-on, panel con gli sviluppatori e showmatch competitivi. Maggiori dettagli su date e sede seguiranno nelle prossime settimane." },
        ],
      },
    },
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
    translations: {
      de: {
        title: "VCO Infinity: 24 Stunden Simracing ohne Pause",
        excerpt: "40 Teams, über 250 Fahrer, 24 Rennen in 24 Stunden — VCO Infinity treibt das Langstreckenformat auf iRacing an seine Grenze. So lief das Marathon-Event.",
        imageAlt: "VCO Infinity: Prototypen-Langstreckenrennen auf iRacing",
        content: [
          { kind: "p", text: "Die Virtual Competition Organisation (VCO) hat sich einen Namen mit innovativen Simracing-Formaten gemacht, und VCO Infinity ist vielleicht ihr ambitioniertestes Konzept bisher. Die Idee: 24 Rennen in 24 Stunden, jedes 45 Minuten lang, im Wechsel auf 5 verschiedenen Autos und 5 verschiedenen Strecken auf iRacing." },
          { kind: "p", text: "Mit über 40 Teams und 250 gemeldeten Fahrern verlangte das Event Konstanz auf höchstem Niveau. Anders als ein klassisches 24-Stunden-Rennen prüfte VCO Infinity die Anpassungsfähigkeit — die Fahrer mussten innerhalb eines einzigen Wettkampftags mehrere Fahrzeugklassen und Strecken beherrschen." },
          { kind: "p", text: "Der Preispool von über 5.000 US-Dollar sorgte für zusätzlichen Wettbewerb, doch der eigentliche Reiz war das Format selbst. Die Teams mussten Fahrerwechsel managen, Strategien spontan anpassen und die Konzentration über völlig unterschiedliche Rennbedingungen halten — vom GT3-Sprint bis zum Prototypen-Stint." },
          { kind: "p", text: "Racespot lieferte durchgehend Broadcast-Berichterstattung über das gesamte 24-Stunden-Fenster, mit wechselnden Kommentatorenteams, die die Zuschauer durch jede Session begleiteten. Die Produktion umfasste Live-Timing, Onboard-Kameras und Echtzeit-Stände über alle Rennsessions hinweg." },
          { kind: "p", text: "VCO Infinity steht für einen wachsenden Trend im Simracing: Events, die speziell für das digitale Medium entworfen sind, statt reale Formate nachzubilden. Genau diese Art von Innovation hält die Community bei der Stange und erweitert, was Esports-Wettbewerbe sein können." },
        ],
      },
      es: {
        title: "VCO Infinity: 24 horas de simracing sin descanso",
        excerpt: "40 equipos, más de 250 pilotos, 24 carreras en 24 horas: VCO Infinity lleva el formato de resistencia a su límite absoluto en iRacing. Así se desarrolló el maratón.",
        imageAlt: "Carrera de resistencia de prototipos VCO Infinity en iRacing",
        content: [
          { kind: "p", text: "La Virtual Competition Organisation (VCO) se ha ganado una reputación por sus formatos innovadores de simracing, y VCO Infinity puede ser su concepto más ambicioso hasta la fecha. La premisa: 24 carreras en 24 horas, de 45 minutos cada una, rotando entre 5 coches y 5 circuitos distintos en iRacing." },
          { kind: "p", text: "Con más de 40 equipos y 250 pilotos inscritos, el evento exigía una regularidad de élite. A diferencia de una carrera de resistencia tradicional de 24 horas, VCO Infinity ponía a prueba la adaptabilidad: los pilotos tenían que dominar varias categorías de coches y varios circuitos en un solo día de competición." },
          { kind: "p", text: "La bolsa de premios de más de 5.000 dólares añadía un punto competitivo, pero el verdadero atractivo era el propio formato. Los equipos tenían que gestionar las rotaciones de pilotos, adaptar la estrategia sobre la marcha y mantener la concentración en condiciones de carrera muy distintas, de los sprints GT3 a los relevos de resistencia con prototipos." },
          { kind: "p", text: "Racespot ofreció cobertura continua durante las 24 horas, con equipos de comentaristas rotando para mantener a los espectadores enganchados en cada sesión. La producción incluyó integración de tiempos en directo, cámaras a bordo y clasificaciones en tiempo real de todas las sesiones." },
          { kind: "p", text: "VCO Infinity refleja una tendencia creciente en el simracing: eventos diseñados específicamente para el medio digital, en lugar de intentar replicar formatos del mundo real. Es este tipo de innovación la que mantiene viva a la comunidad y amplía lo que pueden llegar a ser las competiciones de esports." },
        ],
      },
      pt: {
        title: "VCO Infinity: 24 horas de simracing sem parar",
        excerpt: "40 equipes, mais de 250 pilotos, 24 corridas em 24 horas — o VCO Infinity leva o formato de endurance ao limite absoluto no iRacing. Veja como foi a maratona.",
        imageAlt: "Corrida de endurance de protótipos VCO Infinity no iRacing",
        content: [
          { kind: "p", text: "A Virtual Competition Organisation (VCO) construiu uma reputação com formatos inovadores de simracing, e o VCO Infinity talvez seja seu conceito mais ambicioso até agora. A premissa: 24 corridas em 24 horas, cada uma com 45 minutos, alternando entre 5 carros e 5 pistas diferentes no iRacing." },
          { kind: "p", text: "Com mais de 40 equipes e 250 pilotos inscritos, o evento exigia consistência de elite. Ao contrário de uma corrida de 24 horas tradicional, o VCO Infinity testava a adaptabilidade — os pilotos precisavam dominar várias categorias de carros e vários circuitos em um único dia de competição." },
          { kind: "p", text: "A premiação de mais de US$ 5.000 acrescentou um tempero competitivo, mas o grande atrativo era o próprio formato. As equipes tinham que administrar as trocas de pilotos, adaptar a estratégia em tempo real e manter a concentração em condições de corrida bem diferentes — de sprints de GT3 a stints de endurance com protótipos." },
          { kind: "p", text: "A Racespot fez a cobertura contínua durante toda a janela de 24 horas, com equipes de comentaristas se revezando para manter os espectadores envolvidos em cada sessão. A produção contou com integração de cronometragem ao vivo, câmeras onboard e classificação em tempo real de todas as sessões." },
          { kind: "p", text: "O VCO Infinity representa uma tendência crescente no simracing: eventos criados especificamente para o meio digital, em vez de tentar replicar formatos do mundo real. É esse tipo de inovação que mantém a comunidade engajada e expande o que as competições de esports podem ser." },
        ],
      },
      fr: {
        title: "VCO Infinity : 24 heures de simracing sans interruption",
        excerpt: "40 équipes, plus de 250 pilotes, 24 courses en 24 heures — VCO Infinity pousse le format endurance à sa limite absolue sur iRacing. Retour sur ce marathon.",
        imageAlt: "Course d’endurance de prototypes VCO Infinity sur iRacing",
        content: [
          { kind: "p", text: "La Virtual Competition Organisation (VCO) s’est forgé une réputation avec des formats de simracing innovants, et VCO Infinity est peut-être son concept le plus ambitieux à ce jour. Le principe : 24 courses en 24 heures, de 45 minutes chacune, en alternant 5 voitures et 5 circuits différents sur iRacing." },
          { kind: "p", text: "Avec plus de 40 équipes et 250 pilotes engagés, l’événement exigeait une régularité de très haut niveau. Contrairement à une course d’endurance classique de 24 heures, VCO Infinity mettait à l’épreuve la capacité d’adaptation — les pilotes devaient maîtriser plusieurs catégories de voitures et plusieurs circuits en une seule journée de compétition." },
          { kind: "p", text: "La dotation de plus de 5 000 dollars ajoutait du piment, mais le véritable attrait résidait dans le format lui-même. Les équipes devaient gérer les relais de pilotes, adapter leur stratégie en direct et garder leur concentration dans des conditions de course très variées — des sprints GT3 aux relais d’endurance en prototype." },
          { kind: "p", text: "Racespot a assuré une diffusion continue pendant toute la fenêtre de 24 heures, avec des équipes de commentateurs en rotation pour tenir les spectateurs en haleine à chaque session. La production intégrait le chronométrage en direct, des caméras embarquées et des classements en temps réel sur l’ensemble des sessions." },
          { kind: "p", text: "VCO Infinity illustre une tendance croissante du simracing : des événements conçus spécifiquement pour le support numérique, plutôt que de reproduire les formats du monde réel. C’est ce type d’innovation qui garde la communauté mobilisée et repousse les limites de ce que peuvent être les compétitions esport." },
        ],
      },
      it: {
        title: "VCO Infinity: 24 ore di simracing senza sosta",
        excerpt: "40 team, oltre 250 piloti, 24 gare in 24 ore — VCO Infinity porta il formato endurance al limite assoluto su iRacing. Ecco com’è andata la maratona.",
        imageAlt: "Gara endurance di prototipi VCO Infinity su iRacing",
        content: [
          { kind: "p", text: "La Virtual Competition Organisation (VCO) si è costruita una reputazione con formati di simracing innovativi, e VCO Infinity è forse il suo concetto più ambizioso finora. La premessa: 24 gare in 24 ore, ciascuna di 45 minuti, alternando 5 auto e 5 tracciati diversi su iRacing." },
          { kind: "p", text: "Con oltre 40 team e 250 piloti iscritti, l’evento richiedeva una costanza da élite. A differenza di una classica gara endurance di 24 ore, VCO Infinity metteva alla prova l’adattabilità — i piloti dovevano padroneggiare più categorie di auto e più circuiti in un solo giorno di competizione." },
          { kind: "p", text: "Il montepremi di oltre 5.000 dollari aggiungeva un tocco competitivo, ma la vera attrazione era il formato in sé. I team dovevano gestire le rotazioni dei piloti, adattare le strategie al volo e mantenere la concentrazione in condizioni di gara molto diverse — dagli sprint GT3 agli stint endurance con i prototipi." },
          { kind: "p", text: "Racespot ha garantito una copertura continua per tutte le 24 ore, con team di commentatori a rotazione per tenere gli spettatori coinvolti in ogni sessione. La produzione comprendeva l’integrazione del cronometraggio live, camere onboard e classifiche in tempo reale su tutte le sessioni di gara." },
          { kind: "p", text: "VCO Infinity rappresenta una tendenza in crescita nel simracing: eventi pensati appositamente per il mezzo digitale, anziché tentare di replicare i formati del mondo reale. È questo tipo di innovazione a tenere viva la community e ad ampliare ciò che le competizioni esports possono essere." },
        ],
      },
    },
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
    translations: {
      de: {
        title: "ERL Saison 5: 23 Teams kämpfen in 6 Spielen um den Europatitel",
        excerpt: "Die bislang ambitionierteste Saison der European Racing League umfasst ACC, LMU, Gran Turismo 7, iRacing, RENNSPORT und mehr — mit dem großen Finale live bei der Sim Formula Europe in Maastricht.",
        imageAlt: "ERL-Finale mit Simracing-Rigs und VCO-Branding",
        content: [
          { kind: "p", text: "Die European Racing League (ERL) hat sich als einer der ungewöhnlichsten Wettbewerbe im Simracing etabliert. Während sich die meisten Ligen auf eine Plattform konzentrieren, fordert die ERL die Teams heraus, in sechs verschiedenen Rennspielen anzutreten — ein echter Test fahrerischer Vielseitigkeit." },
          { kind: "p", text: "Saison 5, von September 2025 bis Januar 2026, umfasste 23 Teams mit je 5 Fahrern. Auf dem Programm standen Assetto Corsa Competizione, Le Mans Ultimate, Gran Turismo 7, iRacing und RENNSPORT — jedes mit eigener Physik, eigenem Fahrverhalten und eigener Wettbewerbsdynamik." },
          { kind: "p", text: "Höhepunkt der Saison war das Final4, live ausgetragen bei der Sim Formula Europe in Maastricht. Vier verbliebene Teams trafen in einem Format unter Hochdruck aufeinander, mit Publikum vor Ort und Broadcast-Kameras, die jedes Überholmanöver und jedes strategische Risiko einfingen." },
          { kind: "p", text: "Racespot ist seit dem ersten Tag Broadcast-Partner der ERL und produziert eine Berichterstattung, die mehrere Sim-Titel in einer einzigen Übertragung vereint. Eine Produktionsaufgabe wie keine andere — verschiedene Engines, verschiedene Grafikqualität, verschiedene Replay-Systeme — zusammengefügt zu einem stimmigen Zuschauererlebnis." },
          { kind: "p", text: "Die ERL wächst weiter, und ihr Multi-Titel-Ansatz könnte die Zukunft des Simracing-Esports sein. Je mehr die Grenzen zwischen den Plattformen verschwimmen, desto relevanter werden Wettbewerbe, die Allround-Können belohnen." },
        ],
      },
      es: {
        title: "ERL Temporada 5: 23 equipos luchan en 6 juegos por el título europeo",
        excerpt: "La temporada más ambiciosa de la European Racing League abarca ACC, LMU, Gran Turismo 7, iRacing, RENNSPORT y más, con la Gran Final celebrada en directo en la Sim Formula Europe de Maastricht.",
        imageAlt: "Final de la ERL con rigs de simracing y la marca VCO",
        content: [
          { kind: "p", text: "La European Racing League (ERL) se ha consolidado como una de las competiciones más singulares del simracing. Mientras la mayoría de las ligas se centran en una sola plataforma, la ERL reta a los equipos a competir en seis juegos de carreras distintos: una verdadera prueba de versatilidad al volante." },
          { kind: "p", text: "La Temporada 5, disputada de septiembre de 2025 a enero de 2026, reunió a 23 equipos de 5 pilotos cada uno. La lista de títulos incluía Assetto Corsa Competizione, Le Mans Ultimate, Gran Turismo 7, iRacing y RENNSPORT, cada uno con su propio modelo físico, comportamiento de los coches y dinámica competitiva." },
          { kind: "p", text: "La temporada culminó en la Final4, celebrada en directo en el evento Sim Formula Europe de Maastricht. Los cuatro equipos supervivientes se enfrentaron en un formato de máxima presión, con público en vivo y cámaras de retransmisión captando cada adelantamiento y cada apuesta estratégica." },
          { kind: "p", text: "Racespot ha sido el socio de retransmisión de la ERL desde sus inicios, produciendo una cobertura que abarca varios simuladores dentro de una misma emisión. Es un reto de producción sin igual: distintos motores gráficos, distinta fidelidad visual, distintos sistemas de repetición, todo integrado en una experiencia coherente para el espectador." },
          { kind: "p", text: "La ERL sigue creciendo, y su enfoque multititulo bien podría ser el futuro de los esports de simracing. A medida que se difuminan las fronteras entre plataformas, las competiciones que premian la habilidad integral serán cada vez más relevantes." },
        ],
      },
      pt: {
        title: "ERL Temporada 5: 23 equipes disputam o título europeu em 6 jogos",
        excerpt: "A temporada mais ambiciosa da European Racing League abrange ACC, LMU, Gran Turismo 7, iRacing, RENNSPORT e mais — com a grande final realizada ao vivo na Sim Formula Europe, em Maastricht.",
        imageAlt: "Final da ERL com rigs de simracing e a marca VCO",
        content: [
          { kind: "p", text: "A European Racing League (ERL) se firmou como uma das competições mais singulares do simracing. Enquanto a maioria das ligas se concentra em uma única plataforma, a ERL desafia as equipes a competir em seis jogos de corrida diferentes — um verdadeiro teste de versatilidade ao volante." },
          { kind: "p", text: "A Temporada 5, disputada de setembro de 2025 a janeiro de 2026, reuniu 23 equipes de 5 pilotos cada. A lista de títulos incluiu Assetto Corsa Competizione, Le Mans Ultimate, Gran Turismo 7, iRacing e RENNSPORT — cada um com seu próprio modelo de física, comportamento dos carros e dinâmica competitiva." },
          { kind: "p", text: "A temporada culminou no Final4, realizado ao vivo no evento Sim Formula Europe, em Maastricht. As quatro equipes sobreviventes se enfrentaram em um formato de altíssima pressão, com público presente e câmeras de transmissão capturando cada ultrapassagem e cada aposta estratégica." },
          { kind: "p", text: "A Racespot é parceira de transmissão da ERL desde o início, produzindo uma cobertura que reúne vários simuladores em uma única transmissão. É um desafio de produção único — motores gráficos diferentes, fidelidade visual diferente, sistemas de replay diferentes — tudo costurado em uma experiência coesa para o espectador." },
          { kind: "p", text: "A ERL continua crescendo, e sua abordagem multi-título pode muito bem ser o futuro dos esports de simracing. À medida que as fronteiras entre as plataformas se diluem, competições que premiam a habilidade completa só vão ganhar relevância." },
        ],
      },
      fr: {
        title: "ERL Saison 5 : 23 équipes s’affrontent sur 6 jeux pour le titre européen",
        excerpt: "La saison la plus ambitieuse de la European Racing League couvre ACC, LMU, Gran Turismo 7, iRacing, RENNSPORT et plus encore — avec une grande finale disputée en direct au Sim Formula Europe de Maastricht.",
        imageAlt: "Finales de l’ERL avec des rigs de simracing et l’identité VCO",
        content: [
          { kind: "p", text: "La European Racing League (ERL) s’est imposée comme l’une des compétitions les plus singulières du simracing. Là où la plupart des ligues se concentrent sur une seule plateforme, l’ERL met les équipes au défi de courir sur six jeux de course différents — un véritable test de polyvalence au volant." },
          { kind: "p", text: "La Saison 5, disputée de septembre 2025 à janvier 2026, a réuni 23 équipes de 5 pilotes chacune. Au programme : Assetto Corsa Competizione, Le Mans Ultimate, Gran Turismo 7, iRacing et RENNSPORT — chacun avec son propre modèle physique, son comportement de voiture et sa dynamique de compétition." },
          { kind: "p", text: "La saison s’est conclue par le Final4, disputé en direct lors du Sim Formula Europe à Maastricht. Les quatre équipes rescapées se sont affrontées dans un format sous haute pression, avec un public sur place et des caméras de diffusion captant chaque dépassement et chaque pari stratégique." },
          { kind: "p", text: "Racespot est le partenaire de diffusion de l’ERL depuis ses débuts et produit une couverture qui réunit plusieurs simulations au sein d’une même émission. Un défi de production sans équivalent — moteurs différents, fidélité graphique différente, systèmes de replay différents — le tout fondu en une expérience cohérente pour le spectateur." },
          { kind: "p", text: "L’ERL continue de grandir, et son approche multi-titres pourrait bien être l’avenir de l’esport simracing. À mesure que les frontières entre plateformes s’estompent, les compétitions qui récompensent la polyvalence n’en seront que plus pertinentes." },
        ],
      },
      it: {
        title: "ERL Stagione 5: 23 team si sfidano su 6 giochi per il titolo europeo",
        excerpt: "La stagione più ambiziosa della European Racing League abbraccia ACC, LMU, Gran Turismo 7, iRacing, RENNSPORT e altro — con la grande finale disputata dal vivo alla Sim Formula Europe di Maastricht.",
        imageAlt: "Finali ERL con postazioni simracing e marchio VCO",
        content: [
          { kind: "p", text: "La European Racing League (ERL) si è affermata come una delle competizioni più particolari del simracing. Mentre la maggior parte delle leghe si concentra su una sola piattaforma, la ERL sfida i team a gareggiare su sei giochi di corse diversi — un vero test di versatilità alla guida." },
          { kind: "p", text: "La Stagione 5, disputata da settembre 2025 a gennaio 2026, ha visto 23 team di 5 piloti ciascuno. L’elenco dei titoli comprendeva Assetto Corsa Competizione, Le Mans Ultimate, Gran Turismo 7, iRacing e RENNSPORT — ognuno con il proprio modello fisico, il proprio comportamento delle auto e le proprie dinamiche competitive." },
          { kind: "p", text: "La stagione è culminata nel Final4, disputato dal vivo alla Sim Formula Europe di Maastricht. I quattro team sopravvissuti si sono affrontati in un formato ad altissima pressione, con pubblico presente e telecamere che catturavano ogni sorpasso e ogni azzardo strategico." },
          { kind: "p", text: "Racespot è partner di trasmissione della ERL fin dalla nascita e produce una copertura che unisce più simulatori in un’unica diretta. Una sfida produttiva senza pari — motori diversi, fedeltà grafica diversa, sistemi di replay diversi — fusi in un’esperienza di visione coerente." },
          { kind: "p", text: "La ERL continua a crescere, e il suo approccio multi-titolo potrebbe essere il futuro degli esports di simracing. Man mano che i confini tra le piattaforme si assottigliano, le competizioni che premiano la completezza diventeranno sempre più rilevanti." },
        ],
      },
    },
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
    translations: {
      de: {
        title: "Sim Racing Expo 2025: Über 24.000 Besucher setzen neuen Rekord",
        excerpt: "Die größte Simracing-Messe der Welt zog 24.371 Besucher an den Nürburgring — mit der Weltpremiere von Assetto Corsa Rally, 155 Millionen Social-Media-Impressions und der Super-GT-Experience.",
        imageAlt: "Sim Racing Expo 2025 — Hardware-Präsentationen und Event-Highlights",
        content: [
          { kind: "p", text: "Die Sim Racing Expo 2025, vom 17. bis 19. Oktober am Nürburgring, hat einmal mehr bewiesen, dass Simracing kein Nischenhobby mehr ist. Mit 24.371 Besuchern stellte das Event einen neuen Besucherrekord auf und festigte seine Stellung als wichtigste Simracing-Messe der Welt." },
          { kind: "p", text: "Die zentrale Ankündigung war die Weltpremiere von Assetto Corsa Rally — der lang erwartete Einstieg von Kunos Simulazioni ins Rallye-Genre. Die Besucher gehörten zu den Ersten, die den Titel selbst ausprobieren konnten, und die Reaktionen waren überwältigend positiv. Allein die Enthüllung sorgte für enormen Wirbel in den sozialen Medien und trug zu den insgesamt 155 Millionen Social-Media-Impressions des Events bei." },
          { kind: "p", text: "Neben der Ausstellungsfläche gab es Live-Wettbewerbe, Hardware-Präsentationen der großen Peripheriehersteller und Meet-and-Greets mit Simracing-Persönlichkeiten wie Content Creator Misha Charoudin. Die Super-GT-Experience — die Besucher die japanische Tourenwagenserie in einem Full-Motion-Simulator fahren ließ — war ein weiterer Publikumsliebling." },
          { kind: "p", text: "Racespot war vor Ort und produzierte die Broadcasts der Wettbewerbssegmente der Messe, um die Energie des Live-Simracings vor begeistertem Publikum einzufangen. Die Kombination aus Messe, Wettbewerb und Community-Treffen macht die Sim Racing Expo zu einem einzigartigen Fixpunkt im Kalender." },
          { kind: "p", text: "Da die Simracing-Branche weiter rasant wächst, dürfte die Ausgabe 2026 noch größer werden. Für Hardware-Hersteller, Software-Entwickler und Esports-Organisationen gleichermaßen ist das Nürburgring-Wochenende im Oktober zum Pflichttermin geworden." },
        ],
      },
      es: {
        title: "Sim Racing Expo 2025: más de 24.000 visitantes marcan un nuevo récord",
        excerpt: "La mayor feria de simracing del mundo atrajo a 24.371 visitantes a Nürburgring, con el estreno mundial de Assetto Corsa Rally, 155 millones de impresiones en redes sociales y la experiencia Super GT.",
        imageAlt: "Sim Racing Expo 2025: exposiciones de hardware y momentos destacados del evento",
        content: [
          { kind: "p", text: "La Sim Racing Expo 2025, celebrada del 17 al 19 de octubre en Nürburgring, ha demostrado una vez más que el simracing ya no es un hobby de nicho. Con 24.371 visitantes, el evento batió su récord de asistencia y consolidó su posición como la principal feria de simracing del mundo." },
          { kind: "p", text: "El anuncio estrella fue el estreno mundial de Assetto Corsa Rally, la esperada entrada de Kunos Simulazioni en el género de los rallies. Los asistentes fueron de los primeros en probar el título, y la reacción fue abrumadoramente positiva. Solo la presentación generó un enorme revuelo en redes sociales, contribuyendo al total de 155 millones de impresiones del evento." },
          { kind: "p", text: "Más allá de la zona de exposición, el evento ofreció competiciones en directo, exhibiciones de hardware de los grandes fabricantes de periféricos y encuentros con personalidades del simracing, entre ellas el creador de contenido Misha Charoudin. La experiencia Super GT, que permitía a los visitantes pilotar la serie japonesa de turismos en un simulador de movimiento completo, fue otra de las favoritas del público." },
          { kind: "p", text: "Racespot estuvo in situ produciendo la retransmisión de los segmentos competitivos de la feria, captando la energía del simracing en vivo ante un público entusiasta. La combinación de feria, competición y encuentro de la comunidad convierte a la Sim Racing Expo en una cita única en el calendario." },
          { kind: "p", text: "Con la industria del simracing creciendo a gran velocidad, se espera que la edición de 2026 sea aún mayor. Para fabricantes de hardware, desarrolladores de software y organizaciones de esports por igual, el fin de semana de octubre en Nürburgring se ha convertido en una cita ineludible." },
        ],
      },
      pt: {
        title: "Sim Racing Expo 2025: mais de 24.000 visitantes estabelecem novo recorde",
        excerpt: "A maior feira de simracing do mundo levou 24.371 visitantes a Nürburgring — com a estreia mundial de Assetto Corsa Rally, 155 milhões de impressões nas redes sociais e a experiência Super GT.",
        imageAlt: "Sim Racing Expo 2025 — exposições de hardware e destaques do evento",
        content: [
          { kind: "p", text: "A Sim Racing Expo 2025, realizada de 17 a 19 de outubro em Nürburgring, provou mais uma vez que o simracing deixou de ser um hobby de nicho. Com 24.371 visitantes passando pelos portões, o evento estabeleceu um novo recorde de público e consolidou sua posição como a principal feira de simracing do mundo." },
          { kind: "p", text: "O grande anúncio foi a estreia mundial de Assetto Corsa Rally — a tão aguardada entrada da Kunos Simulazioni no gênero rali. Os visitantes estiveram entre os primeiros a experimentar o título, e a reação foi extremamente positiva. Só a revelação gerou enorme repercussão nas redes sociais, contribuindo para o total de 155 milhões de impressões do evento." },
          { kind: "p", text: "Além da área de exposição, o evento teve competições ao vivo, mostras de hardware dos grandes fabricantes de periféricos e encontros com personalidades do simracing, incluindo o criador de conteúdo Misha Charoudin. A experiência Super GT — que permitia aos visitantes pilotar a série japonesa de turismo em um simulador de movimento completo — foi outro favorito do público." },
          { kind: "p", text: "A Racespot esteve no local produzindo a transmissão dos segmentos competitivos da feira, capturando a energia do simracing ao vivo diante de um público entusiasmado. A combinação de feira, competição e encontro da comunidade faz da Sim Racing Expo um marco único no calendário." },
          { kind: "p", text: "Com a indústria do simracing crescendo rapidamente, a edição de 2026 deve ser ainda maior. Para fabricantes de hardware, desenvolvedores de software e organizações de esports, o fim de semana de outubro em Nürburgring tornou-se imperdível." },
        ],
      },
      fr: {
        title: "Sim Racing Expo 2025 : plus de 24 000 visiteurs, un nouveau record",
        excerpt: "Le plus grand salon de simracing au monde a attiré 24 371 visiteurs au Nürburgring — avec la première mondiale d’Assetto Corsa Rally, 155 millions d’impressions sur les réseaux sociaux et l’expérience Super GT.",
        imageAlt: "Sim Racing Expo 2025 — présentations de matériel et temps forts de l’événement",
        content: [
          { kind: "p", text: "La Sim Racing Expo 2025, organisée du 17 au 19 octobre au Nürburgring, a prouvé une fois de plus que le simracing n’est plus un loisir de niche. Avec 24 371 visiteurs, l’événement a établi un nouveau record de fréquentation et consolidé sa place de premier salon de simracing au monde." },
          { kind: "p", text: "L’annonce phare a été la première mondiale d’Assetto Corsa Rally — l’entrée tant attendue de Kunos Simulazioni dans le genre du rallye. Les visiteurs ont été parmi les premiers à prendre le titre en main, et l’accueil a été extrêmement positif. La révélation à elle seule a fait grand bruit sur les réseaux sociaux, contribuant aux 155 millions d’impressions totalisées par l’événement." },
          { kind: "p", text: "Au-delà des allées du salon, l’événement proposait des compétitions en direct, des présentations de matériel des grands fabricants de périphériques et des rencontres avec des personnalités du simracing, dont le créateur de contenu Misha Charoudin. L’expérience Super GT — qui permettait aux visiteurs de piloter la série japonaise de voitures de tourisme dans un simulateur dynamique — a été un autre grand succès." },
          { kind: "p", text: "Racespot était sur place pour produire la diffusion des segments compétitifs du salon et capter l’énergie du simracing en direct devant un public enthousiaste. La combinaison salon, compétition et rassemblement de la communauté fait de la Sim Racing Expo un rendez-vous unique du calendrier." },
          { kind: "p", text: "Avec une industrie du simracing en forte croissance, l’édition 2026 devrait être encore plus grande. Pour les fabricants de matériel, les développeurs de logiciels comme les organisations esport, le week-end d’octobre au Nürburgring est devenu incontournable." },
        ],
      },
      it: {
        title: "Sim Racing Expo 2025: oltre 24.000 visitatori, nuovo record",
        excerpt: "La più grande fiera del simracing al mondo ha portato 24.371 visitatori al Nürburgring — con l’anteprima mondiale di Assetto Corsa Rally, 155 milioni di impression sui social e l’esperienza Super GT.",
        imageAlt: "Sim Racing Expo 2025 — esposizioni hardware e momenti salienti dell’evento",
        content: [
          { kind: "p", text: "La Sim Racing Expo 2025, dal 17 al 19 ottobre al Nürburgring, ha dimostrato ancora una volta che il simracing non è più un hobby di nicchia. Con 24.371 visitatori, l’evento ha stabilito un nuovo record di presenze e consolidato la sua posizione di principale fiera del simracing al mondo." },
          { kind: "p", text: "L’annuncio di punta è stata l’anteprima mondiale di Assetto Corsa Rally — l’attesissimo ingresso di Kunos Simulazioni nel genere rally. I visitatori sono stati tra i primi a provare il titolo, e la reazione è stata estremamente positiva. La sola presentazione ha generato un enorme clamore sui social, contribuendo ai 155 milioni di impression totali dell’evento." },
          { kind: "p", text: "Oltre all’area espositiva, l’evento ha proposto competizioni dal vivo, esposizioni hardware dei grandi produttori di periferiche e incontri con personalità del simracing, tra cui il content creator Misha Charoudin. L’esperienza Super GT — che permetteva ai visitatori di guidare la serie turismo giapponese in un simulatore full-motion — è stata un altro grande successo di pubblico." },
          { kind: "p", text: "Racespot era sul posto per produrre la trasmissione dei segmenti competitivi della fiera, catturando l’energia del simracing dal vivo davanti a un pubblico entusiasta. L’unione di fiera, competizione e ritrovo della community rende la Sim Racing Expo un appuntamento unico nel calendario." },
          { kind: "p", text: "Con l’industria del simracing in rapida crescita, l’edizione 2026 si preannuncia ancora più grande. Per produttori di hardware, sviluppatori di software e organizzazioni esports, il weekend di ottobre al Nürburgring è diventato imperdibile." },
        ],
      },
    },
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
    translations: {
      de: {
        title: "IMSA Esports: Wo virtuelle Prototypen auf echte Rennhistorie treffen",
        excerpt: "Die IMSA-Esports-Serie bringt legendären Langstreckensport in die digitale Welt — und Racespot bringt ihn mit Broadcast-Qualität über die gesamte Saison auf deinen Bildschirm.",
        imageAlt: "IMSA-Esports-Prototypen unter Flutlicht in Daytona",
        content: [
          { kind: "p", text: "Wenn IMSA — der Verband hinter den Rolex 24 in Daytona und dem Petit Le Mans — sein legendäres Langstreckenerbe in die virtuelle Welt bringt, entsteht etwas Besonderes. Die IMSA-Esports-Serie auf iRacing fängt den Geist des Mehrklassen-Rennsports mit Prototypen und GT-Fahrzeugen mit einer Authentizität ein, die nur eine direkte Partnerschaft zwischen IMSA und iRacing liefern kann." },
          { kind: "p", text: "Die Saison 2025 führte über ikonische Strecken wie Daytona, Sebring und Watkins Glen, mit GTP-Prototypen und GT3-Fahrzeugen gemeinsam auf der Strecke, ganz im Stil der IMSA. Die Mehrklassen-Dynamik — schnellere Prototypen, die sich durch den GT-Verkehr fädeln — erzeugt Broadcast-Momente, die so packend sind wie ihre realen Vorbilder." },
          { kind: "p", text: "Racespot produziert den kompletten Broadcast der IMSA-Esports-Serie, mit Multi-Kamera-Regie, fachkundigem Kommentar und Live-Timing-Integration. Nachtrennen in Daytona, wenn Scheinwerfer die Dunkelheit durchschneiden und Prototypen-Duelle unter Flutlicht ausgetragen werden, sind ein besonderes visuelles Highlight." },
          { kind: "p", text: "Die Serie zieht Fahrer professioneller Esports-Teams ebenso an wie Rennfahrer aus dem realen Motorsport, die zwischen den Rennwochenenden ihre Fähigkeiten schärfen wollen. Genau dieses Zusammenspiel von virtuellem und realem Motorsport hebt IMSA Esports aus der dichten Esports-Landschaft heraus." },
          { kind: "p", text: "Während IMSA seine digitale Präsenz ausbaut, bleibt die Esports-Serie sowohl Wettkampfplattform als auch Einstieg für neue Fans in den Langstreckensport. Die Kombination aus Prestige, Authentizität und Broadcast-Produktion auf Weltklasseniveau macht sie zu einem der ausgereiftesten Esports-Produkte im Simracing." },
        ],
      },
      es: {
        title: "IMSA Esports: donde los prototipos virtuales se encuentran con la herencia real",
        excerpt: "La serie IMSA Esports lleva la legendaria resistencia al mundo digital, y Racespot la lleva a tu pantalla con una producción de calidad televisiva durante toda la temporada.",
        imageAlt: "Prototipos de IMSA Esports bajo los focos en Daytona",
        content: [
          { kind: "p", text: "Cuando IMSA, el organismo detrás de las Rolex 24 de Daytona y el Petit Le Mans, traslada su legendaria herencia de resistencia al mundo virtual, el resultado es algo especial. La serie IMSA Esports en iRacing captura el espíritu de las carreras multiclase de prototipos y GT con un nivel de autenticidad que solo una colaboración directa entre IMSA e iRacing puede ofrecer." },
          { kind: "p", text: "La temporada 2025 incluyó carreras en circuitos icónicos como Daytona, Sebring y Watkins Glen, con prototipos GTP y coches GT3 compartiendo pista al más puro estilo IMSA. La dinámica multiclase, con los prototipos más rápidos abriéndose paso entre el tráfico GT, genera momentos de retransmisión tan apasionantes como los de sus homólogos reales." },
          { kind: "p", text: "Racespot produce la retransmisión completa de la serie IMSA Esports, con cobertura multicámara, comentarios expertos e integración de tiempos en directo. Las carreras nocturnas en Daytona, con los faros atravesando la oscuridad y las batallas entre prototipos bajo los focos, son un momento visual especialmente destacado." },
          { kind: "p", text: "La serie atrae tanto a pilotos de equipos profesionales de esports como a pilotos reales que buscan afinar sus habilidades entre fines de semana de carrera. Este cruce entre el automovilismo virtual y el real es precisamente lo que hace que IMSA Esports destaque en el saturado panorama de los esports." },
          { kind: "p", text: "Mientras IMSA amplía su presencia digital, la serie de esports sigue siendo tanto una plataforma de competición como una puerta de entrada para que nuevos aficionados descubran las carreras de resistencia. La combinación de prestigio, autenticidad y producción de primer nivel la convierte en uno de los productos de esports más pulidos del simracing." },
        ],
      },
      pt: {
        title: "IMSA Esports: onde os protótipos virtuais encontram a herança do mundo real",
        excerpt: "A série IMSA Esports leva o lendário endurance ao mundo digital — e a Racespot leva tudo isso à sua tela com produção de qualidade broadcast durante toda a temporada.",
        imageAlt: "Protótipos do IMSA Esports sob os holofotes em Daytona",
        content: [
          { kind: "p", text: "Quando a IMSA — a entidade por trás das Rolex 24 em Daytona e do Petit Le Mans — leva sua lendária herança de endurance ao mundo virtual, o resultado é algo especial. A série IMSA Esports no iRacing captura o espírito das corridas multiclasse de protótipos e GT com um nível de autenticidade que só uma parceria direta entre IMSA e iRacing pode oferecer." },
          { kind: "p", text: "A temporada 2025 teve corridas em circuitos icônicos como Daytona, Sebring e Watkins Glen, com protótipos GTP e carros GT3 dividindo a pista no melhor estilo IMSA. A dinâmica multiclasse — protótipos mais rápidos costurando o tráfego de GTs — cria momentos de transmissão tão envolventes quanto os do mundo real." },
          { kind: "p", text: "A Racespot produz a transmissão completa da série IMSA Esports, com cobertura multicâmera, comentários especializados e integração de cronometragem em tempo real. As corridas noturnas em Daytona, com faróis cortando a escuridão e duelos de protótipos sob os holofotes, são um destaque visual especial." },
          { kind: "p", text: "A série atrai pilotos de equipes profissionais de esports e também pilotos do automobilismo real que querem afiar as habilidades entre os fins de semana de corrida. É justamente esse cruzamento entre o virtual e o real que faz o IMSA Esports se destacar no concorrido cenário dos esports." },
          { kind: "p", text: "Enquanto a IMSA expande sua presença digital, a série de esports segue sendo plataforma de competição e porta de entrada para novos fãs descobrirem o endurance. A combinação de prestígio, autenticidade e produção de nível mundial faz dela um dos produtos de esports mais refinados do simracing." },
        ],
      },
      fr: {
        title: "IMSA Esports : quand les prototypes virtuels rencontrent l’héritage du réel",
        excerpt: "La série IMSA Esports transpose la légendaire endurance dans le monde numérique — et Racespot la porte sur votre écran avec une production de qualité broadcast sur toute la saison.",
        imageAlt: "Prototypes IMSA Esports sous les projecteurs à Daytona",
        content: [
          { kind: "p", text: "Quand l’IMSA — l’organisme derrière les Rolex 24 de Daytona et le Petit Le Mans — transpose son légendaire héritage d’endurance dans le monde virtuel, le résultat est à part. La série IMSA Esports sur iRacing capture l’esprit des courses multi-catégories de prototypes et de GT avec un niveau d’authenticité que seul un partenariat direct entre l’IMSA et iRacing peut offrir." },
          { kind: "p", text: "La saison 2025 s’est disputée sur des circuits emblématiques comme Daytona, Sebring et Watkins Glen, avec des prototypes GTP et des GT3 partageant la piste dans la plus pure tradition IMSA. La dynamique multi-catégories — des prototypes plus rapides se frayant un chemin dans le trafic GT — crée des moments de diffusion aussi captivants que leurs équivalents réels." },
          { kind: "p", text: "Racespot produit l’intégralité de la diffusion de la série IMSA Esports, avec une réalisation multicaméras, des commentaires d’experts et l’intégration du chronométrage en direct. Les courses de nuit à Daytona, avec les phares qui percent l’obscurité et les duels de prototypes sous les projecteurs, constituent un temps fort visuel." },
          { kind: "p", text: "La série attire aussi bien des pilotes d’équipes esport professionnelles que des pilotes du sport automobile réel venus affûter leurs compétences entre deux week-ends de course. C’est précisément ce croisement entre virtuel et réel qui distingue IMSA Esports dans un paysage esport très dense." },
          { kind: "p", text: "Alors que l’IMSA développe sa présence numérique, la série esport reste à la fois une plateforme de compétition et une porte d’entrée pour que de nouveaux fans découvrent l’endurance. L’alliance de prestige, d’authenticité et d’une production de niveau mondial en fait l’un des produits esport les plus aboutis du simracing." },
        ],
      },
      it: {
        title: "IMSA Esports: dove i prototipi virtuali incontrano l’eredità del mondo reale",
        excerpt: "La serie IMSA Esports porta il leggendario endurance nel mondo digitale — e Racespot lo porta sul tuo schermo con una produzione di qualità broadcast per tutta la stagione.",
        imageAlt: "Prototipi IMSA Esports sotto i riflettori a Daytona",
        content: [
          { kind: "p", text: "Quando IMSA — l’ente dietro le Rolex 24 di Daytona e la Petit Le Mans — porta la sua leggendaria eredità endurance nel mondo virtuale, il risultato è qualcosa di speciale. La serie IMSA Esports su iRacing cattura lo spirito delle gare multiclasse di prototipi e GT con un livello di autenticità che solo una partnership diretta tra IMSA e iRacing può offrire." },
          { kind: "p", text: "La stagione 2025 ha visto gare su circuiti iconici come Daytona, Sebring e Watkins Glen, con prototipi GTP e vetture GT3 in pista insieme, nel più puro stile IMSA. La dinamica multiclasse — prototipi più veloci che si infilano nel traffico delle GT — crea momenti di trasmissione avvincenti quanto quelli reali." },
          { kind: "p", text: "Racespot produce l’intera trasmissione della serie IMSA Esports, con regia multicamera, commento esperto e integrazione del cronometraggio in tempo reale. Le gare notturne a Daytona, con i fari che tagliano l’oscurità e i duelli tra prototipi sotto i riflettori, sono un momento visivo di particolare impatto." },
          { kind: "p", text: "La serie attira piloti di team esports professionistici così come piloti del motorsport reale che vogliono affinare le proprie abilità tra un weekend di gara e l’altro. È proprio questo incrocio tra motorsport virtuale e reale a far spiccare IMSA Esports nell’affollato panorama degli esports." },
          { kind: "p", text: "Mentre IMSA espande la propria presenza digitale, la serie esports resta sia piattaforma competitiva sia porta d’ingresso per nuovi fan alla scoperta dell’endurance. La combinazione di prestigio, autenticità e produzione broadcast di livello mondiale la rende uno dei prodotti esports più raffinati del simracing." },
        ],
      },
    },
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
