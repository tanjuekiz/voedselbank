import React, { useState } from 'react';
import { ProductItem, Location, UserRole } from '../types';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  HeartHandshake,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  Truck,
  Package,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Users,
  ShieldAlert,
  Leaf,
  Check,
  Coffee,
  Heart,
  Phone,
  Info,
  CalendarCheck,
} from 'lucide-react';

interface HomeViewProps {
  products: ProductItem[];
  locations: Location[];
  onSelectRole: (role: UserRole) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  locations,
  onSelectRole,
}) => {
  // Urgent items derived from live inventory
  const lowStockProducts = products.filter((p) => p.quantity <= 35);

  // Total available stats
  const totalStockItems = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalHalalItems = products.filter(
    (p) => p.halalStatus === 'halal_gecertificeerd' || p.halalStatus === 'natuurlijk_halal'
  ).length;
  const certifiedHalalItems = products.filter((p) => p.halalStatus === 'halal_gecertificeerd').length;
  const totalWeightStockKg = products.reduce((sum, p) => sum + p.weightKg, 0);

  // FAQ Interactive Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const FAQ_ITEMS = [
    {
      q: 'Wat doet Voedselbank Puur Borg precies?',
      a: 'Voedselbank Puur Borg verzamelt overschotten van goed voedsel bij supermarkten, boeren, bakkers en groothandels en deelt dit wekelijks uit aan gezinnen die tijdelijk niet rond kunnen komen. We waarborgen dat voedsel puur, vers en gezond is en bieden een gegarandeerde halal-lijn en allergenenbescherming.',
    },
    {
      q: 'Kost een voedselpakket geld of moet ik iets betalen?',
      a: 'Nee, een voedselpakket bij Voedselbank Puur Borg is altijd 100% kosteloos. Ons doel is pure noodhulp bieden en zorgen dat niemand met honger naar bed gaat.',
    },
    {
      q: 'Hoe zit het met Halal-borging? Is dit gegarandeerd?',
      a: 'Ja! Bij Voedselbank Puur Borg is halal geen bijzaak, maar een fundamenteel geborgd proces. Vleeswaren en kant-en-klaar maaltijden zijn afkomstig van erkende halal-certificeerders (o.a. Halal Correct, HQC). Halal producten worden in onze magazijnen en koelcellen strikt gescheiden gehouden van varkensvlees.',
    },
    {
      q: 'Wat als ik of mijn kind een voedselallergie heeft (zoals gluten of noten)?',
      a: 'Bij de inschrijving registreren we al je allergenen. Onze vrijwilligers controleren met geautomatiseerde software en QR-stickers dat er geen kruisbesmetting plaatsvindt en stellen specifieke allergenenvrije pakketten samen.',
    },
    {
      q: 'Hoe kan ik als hulpvrager een pakket aanvragen?',
      a: 'Je kunt direct contact opnemen via het inloopspreekuur op een van onze 4 locaties, of je laten doorverwijzen via het gemeentelijk wijkteam, je huisarts, maatschappelijk werk of schuldhulpverlening. Bij acute nood verstrekken we direct een proef-noodpakket.',
    },
    {
      q: 'Hoe kan ik als bedrijf of particulier voedsel doneren?',
      a: 'Bedrijven en supermarkten kunnen restpartijen en overschotten aanmelden via ons medewerkersportaal of telefonisch contact opnemen met Centraal Depot. Wij beschikken over gekoeld transport om partijen direct op te halen.',
    },
  ];

  return (
    <div className="space-y-16 pb-24">
      {/* ========================================================= */}
      {/* 1. HERO SECTION: BRANDING & KERNBOODSCHAP                 */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden bg-neutral-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 border border-neutral-800 shadow-xl">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/hero_foodbank_community_1792664913914.jpg"
            alt="Voedselbank Puur Borg gemeenschap"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-900/40" />
        </div>

        <div className="relative max-w-5xl px-6 py-16 sm:px-12 sm:py-24 lg:py-28 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 tracking-wider uppercase bg-emerald-950/80 border border-emerald-700/80 px-3.5 py-1.5 rounded-full shadow-2xs backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Voedselbank Puur Borg · Eerlijk Voedsel & Geborgde Zorg
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-balance">
            Voedsel redden, gezinnen voeden.{' '}
            <span className="text-emerald-400 block sm:inline">Met respect voor ieders cultuur en dieet.</span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-200 max-w-3xl leading-relaxed">
            Voedselbank Puur Borg slaat de brug tussen voedseloverschotten en armoedebestrijding.
            Wij voorzien wekelijks honderden gezinnen van verse, gezonde en volwaardige voedselpakketten —
            met 100% gegarandeerde halal-borging, allergenenbescherming en een warme, respectvolle benadering.
          </p>

          {/* Core Trust Indicators */}
          <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-neutral-300 font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> 100% Kosteloos voor hulpvragers
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Strikte Halal-vleeslijn met keurmerk
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> 4 Toegankelijke wijkpunten
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Zero Waste & Lokale Opslag
            </span>
          </div>

          {/* Primary Quick Navigation Buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('hoe-werkt-het');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-xs sm:text-sm font-bold text-neutral-900 bg-white hover:bg-neutral-100 rounded-xl shadow-lg transition-all"
            >
              <span>Wat doen wij & Hoe werkt het?</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectRole('vrijwilliger')}
              className="inline-flex items-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl shadow-lg transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Vrijwilligers & Rooster</span>
            </button>

            <button
              onClick={() => onSelectRole('medewerker')}
              className="inline-flex items-center gap-2 px-5 py-3.5 text-xs sm:text-sm font-semibold text-neutral-200 hover:text-white bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 rounded-xl transition-all"
            >
              <Package className="w-4 h-4" />
              <span>Medewerkers & Magazijn</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. REALTIME IMPACT NUMERICALS STRIP                        */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-white border border-neutral-200 rounded-2xl shadow-2xs">
          <div>
            <span className="text-xs text-neutral-500 font-medium block">Actuele Voorraad in Beheer</span>
            <span className="text-2xl sm:text-3xl font-bold text-neutral-900 font-mono tabular-nums">
              {totalStockItems.toLocaleString('nl-NL')}
            </span>
            <span className="text-xs text-neutral-400 block mt-0.5">
              colli ({totalWeightStockKg.toFixed(0)} kg gered voedsel)
            </span>
          </div>

          <div>
            <span className="text-xs text-neutral-500 font-medium block">Halal Voedselvoorraad</span>
            <span className="text-2xl sm:text-3xl font-bold text-emerald-700 font-mono tabular-nums">
              {totalHalalItems} items
            </span>
            <span className="text-xs text-emerald-800 font-semibold block mt-0.5">
              {certifiedHalalItems} gecertificeerd met keurmerk
            </span>
          </div>

          <div>
            <span className="text-xs text-neutral-500 font-medium block">Actieve Uitdeellocaties</span>
            <span className="text-2xl sm:text-3xl font-bold text-neutral-900 font-mono tabular-nums">
              {locations.length} locaties
            </span>
            <span className="text-xs text-neutral-400 block mt-0.5">Centraal, West, Oost & Haven</span>
          </div>

          <div>
            <span className="text-xs text-neutral-500 font-medium block">Voedselveiligheid & Audits</span>
            <span className="text-2xl sm:text-3xl font-bold text-neutral-900 font-mono tabular-nums">
              100%
            </span>
            <span className="text-xs text-neutral-400 block mt-0.5">
              NVWA & HACCP gecontroleerd
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. DUIDELIJKE UITLEG: WAT DOET VOEDSELBANK PUUR BORG?      */}
      {/* ========================================================= */}
      <section id="hoe-werkt-het" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Heldere Uitleg over Ons Werk
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
            Wat doet Voedselbank Puur Borg precies?
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            Iedere dag belandt er in Nederland tonnen perfect eetbaar voedsel in de vuilnisbak, terwijl
            steeds meer gezinnen moeite hebben om de eindjes aan elkaar te knopen. Voedselbank Puur Borg
            overbrugt deze kloof via een zorgvuldig, respectvol 4-stappen proces:
          </p>
        </div>

        {/* 4-Stappen Roadmap Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stap 1 */}
          <div className="p-6 bg-white border border-neutral-200 rounded-2xl space-y-4 hover:border-emerald-300 hover:shadow-xs transition-all relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-mono font-bold text-sm">
              01
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                Ophalen & Redden
              </span>
              <h3 className="text-base font-bold text-neutral-900 mt-1">
                Verse Inzameling bij Partners
              </h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Onze chauffeurs rijden dagelijks langs supermarkten, biologische tuinders, ambachtelijke bakkers en groothandels om overschotten op te halen die anders vernietigd zouden worden.
            </p>
            <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-500 flex items-center gap-1 font-mono">
              <Truck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Gekoeld transport &gt; 4°C</span>
            </div>
          </div>

          {/* Stap 2 */}
          <div className="p-6 bg-white border border-neutral-200 rounded-2xl space-y-4 hover:border-emerald-300 hover:shadow-xs transition-all relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-mono font-bold text-sm">
              02
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                Controle & Borging
              </span>
              <h3 className="text-base font-bold text-neutral-900 mt-1">
                AI Terugroep- & Halal Inspectie
              </h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Bij binnenkomst in ons magazijn checkt onze AI-kwaliteitsmodule direct NVWA terugroepacties, vervaldata en de officiële halal-certificering. Besmet voedsel wordt direct geblokkeerd.
            </p>
            <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-500 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>NVWA & Halal gecontroleerd</span>
            </div>
          </div>

          {/* Stap 3 */}
          <div className="p-6 bg-white border border-neutral-200 rounded-2xl space-y-4 hover:border-emerald-300 hover:shadow-xs transition-all relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-mono font-bold text-sm">
              03
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                Zorgvuldig Inpakken
              </span>
              <h3 className="text-base font-bold text-neutral-900 mt-1">
                Gezinspakketten op Maat
              </h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Onze vrijwilligers stellen de pakketten samen afgestemd op gezinssamenstelling. Wie strikt halal eet krijgt gecertificeerd halal; allergenen (zoals noten en gluten) worden 100% gefilterd.
            </p>
            <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-500 flex items-center gap-1 font-mono">
              <Package className="w-3.5 h-3.5 text-emerald-700" />
              <span>Gepersonaliseerde dieetlijst</span>
            </div>
          </div>

          {/* Stap 4 */}
          <div className="p-6 bg-white border border-neutral-200 rounded-2xl space-y-4 hover:border-emerald-300 hover:shadow-xs transition-all relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-mono font-bold text-sm">
              04
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                Warmte & Discretie
              </span>
              <h3 className="text-base font-bold text-neutral-900 mt-1">
                Respectvolle Wijkdistributie
              </h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Wekelijks halen gezinnen hun pakket op bij een van onze 4 uitdeelpunten in de buurt. In een veilige sfeer, met een kop koffie, luisterend oor en respect voor ieders menselijke waardigheid.
            </p>
            <div className="pt-2 border-t border-neutral-100 text-[11px] text-neutral-500 flex items-center gap-1 font-mono">
              <Heart className="w-3.5 h-3.5 text-emerald-700" />
              <span>Waardig & discreet</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. ONZE 4 PIJLERS: WAAROM "PUUR BORG"?                     */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-950 text-white rounded-3xl p-8 sm:p-12 border border-emerald-900 shadow-xl space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
              Onze Grondbeginselen
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Waarom heten wij &ldquo;Voedselbank Puur Borg&rdquo;?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              De naam <em>Puur Borg</em> staat voor twee onwrikbare beloften: puur, gezond en voedzaam
              voedsel voor elk mens, en een 100% betrouwbare borging van voedselveiligheid, halal-eisen en waardigheid.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
            <div className="bg-neutral-900/60 p-6 rounded-2xl border border-emerald-800/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800/80 text-emerald-300 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-emerald-300" />
              </div>
              <h3 className="text-base font-bold text-white">1. Puur Vers & Gezond</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Geen overjarige restjes of ongezonde snacks. Wij geven prioriteit aan verse groenten, seizoensfruit, eieren, volkorenbrood en zuivere peulvruchten voor een gebalanceerd dieet.
              </p>
            </div>

            <div className="bg-neutral-900/60 p-6 rounded-2xl border border-emerald-800/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800/80 text-emerald-300 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <h3 className="text-base font-bold text-white">2. Geborgde Halal Zekerheid</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Elk halal product is officieel gecertificeerd met erkende rituele slachting en borging. In onze koelcellen en bij de uitgifte is er een strikte scheiding van varkensvlees.
              </p>
            </div>

            <div className="bg-neutral-900/60 p-6 rounded-2xl border border-emerald-800/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800/80 text-emerald-300 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-emerald-300" />
              </div>
              <h3 className="text-base font-bold text-white">3. Allergenen Bescherming</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Wij registreren alle Europese allergenen (gluten, noten, pinda, lactose, soja). Wie coeliakie of een allergie heeft, krijgt een gegarandeerd veilig voedselpakket.
              </p>
            </div>

            <div className="bg-neutral-900/60 p-6 rounded-2xl border border-emerald-800/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800/80 text-emerald-300 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 text-emerald-300" />
              </div>
              <h3 className="text-base font-bold text-white">4. Waardigheid & Geen Oordeel</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Ieder mens kan in financiële tegenspoed raken. Bij ons word je warm en zonder schaamte ontvangen. Onze anonieme inspecteurs bewaken de respectvolle behandeling van cliënten.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. VOOR WIE IS HET? & HOE AANVRAGEN (VOOR HULPVRAGERS)    */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white border border-neutral-200 rounded-2xl p-8 sm:p-10 shadow-2xs">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md">
              <Info className="w-4 h-4 text-emerald-700" />
              Voor wie zijn wij er?
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
              Heb je zelf steun nodig of ken je iemand in nood?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              Het leven kan onverwacht duur worden door stijgende vaste lasten, ziekte, scheiding of baanverlies.
              Voedselbank Puur Borg hanteert de landelijke NIBUD-richtlijnen: houd je na aftrek van huur,
              energie en zorgverzekering minder dan een vastgesteld leefbedrag over? Dan heb je recht op
              een wekelijks voedselpakket.
            </p>

            <div className="space-y-3 pt-2 text-xs sm:text-sm text-neutral-700">
              <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block font-semibold">1. Direct Noodpakket (Geen wachttijd)</strong>
                  <span className="text-xs text-neutral-500">
                    Bij acute nood voorzien we je dezelfde week nog van een noodpakket.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block font-semibold">2. Discrete Intake</strong>
                  <span className="text-xs text-neutral-500">
                    Samen met een intakemedewerker kijken we rustig naar je gezinssamenstelling en dieetwensen (zoals Halal of glutenvrij).
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block font-semibold">3. Wekelijks ophalen in je eigen wijk</strong>
                  <span className="text-xs text-neutral-500">
                    Elke donderdag of vrijdag staat je pakket klaar op een vast tijdslot bij je dichtstbijzijnde hub.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const locEl = document.getElementById('uitdeellocaties');
                  locEl?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-2xs transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>Bekijk Openingstijden & Uitdeelpunten</span>
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-neutral-100 border border-neutral-200 shadow-xs">
            <img
              src="/src/assets/images/food_supplies_crates_1792664914429.jpg"
              alt="Georganiseerde schappen met gelabelde kratten en allergeneninformatie"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. WAT HEBBEN WE DRINGEND NODIG? (LIVE VOORRAADTEKORTEN)   */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              Live Magazijninzicht
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1">
              Wat hebben we nu dringend nodig van donateurs?
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Automatisch berekend op basis van de actuele magazijnbalans en geplande gezinspakketten.
            </p>
          </div>

          <span className="text-xs font-mono text-neutral-500 bg-neutral-100 px-3 py-1 rounded-lg shrink-0">
            Peildatum: 22 oktober 2026
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {lowStockProducts.map((p) => (
            <div
              key={p.id}
              className="p-5 bg-white border border-amber-200/90 rounded-2xl hover:border-amber-300 transition-colors shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                  Lage voorraad
                </span>
                <span className="font-mono text-xs font-bold text-neutral-900 tabular-nums">
                  {p.quantity} {p.unit}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-neutral-900 leading-snug">{p.name}</h3>
                <p className="text-xs text-neutral-500 mt-0.5">{p.category}</p>
              </div>

              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600">
                <span className="font-medium">
                  {p.halalStatus === 'halal_gecertificeerd' ? '✓ Halal Keurmerk' : 'Essentiële voeding'}
                </span>
                <span className="font-mono text-neutral-400">{p.shelf}</span>
              </div>
            </div>
          ))}

          {/* Call to donate tile */}
          <div className="p-5 bg-emerald-50/70 border border-emerald-300 rounded-2xl flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                Zelf Doneren?
              </span>
              <h3 className="text-base font-bold text-neutral-900 mt-1">
                Levensmiddelen aanmelden
              </h3>
              <p className="text-xs text-neutral-600 mt-1">
                Wij nemen houdbare basisproducten, verse partijen en babyvoeding graag in ontvangst.
              </p>
            </div>

            <button
              onClick={() => onSelectRole('medewerker')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 hover:text-emerald-700"
            >
              <span>Aanmelden bij logistiek team</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. ONZE 4 UITDEELLOCATIES & INLOOP                        */}
      {/* ========================================================= */}
      <section id="uitdeellocaties" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-24">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
            Onze 4 Uitdeellocaties & Openingstijden
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Komt u een voedselpakket ophalen of een partij doneren? Raadpleeg de actuele openingstijden per vestiging.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="p-5 bg-white border border-neutral-200 rounded-2xl hover:border-neutral-300 transition-colors shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-neutral-700 bg-neutral-100 px-2.5 py-0.5 rounded-md">
                  {loc.code}
                </span>
                {loc.isCentralHub && (
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                    Centraal Depot
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-neutral-900 text-sm">{loc.name}</h3>
                <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{loc.address}, {loc.city}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-neutral-100 text-xs space-y-1.5 text-neutral-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>Uitgifte: Do & Vrij 13:30 - 17:00</span>
                </div>
                <div className="flex items-center gap-1.5 text-neutral-500 font-mono">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{loc.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. VEELGESTELDE VRAGEN (FAQ INTERACTIEVE ACCORDION)       */}
      {/* ========================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 px-3 py-1 rounded-full">
            <HelpCircle className="w-3.5 h-3.5 text-neutral-600" />
            Vragen & Antwoorden
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">
            Veelgestelde Vragen over Voedselbank Puur Borg
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={faq.q}
                className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-neutral-900 hover:text-emerald-800 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-700' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. ALLES-IN-ÉÉN PORTAAL OVERZICHT (SNELLE TOEGANG)        */}
      {/* ========================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
            Directe Toegang tot Alle Interne Portalen
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Alle medewerkers, vrijwilligers, beheerders en inspecteurs beheren hun taken via de alles-in-één navigatie.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div
            onClick={() => onSelectRole('vrijwilliger')}
            className="p-5 bg-white border border-neutral-200 hover:border-emerald-400 rounded-2xl shadow-2xs cursor-pointer transition-all space-y-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-neutral-900 text-sm group-hover:text-emerald-800">
              Vrijwilligers Portaal
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Interactief shiftrooster, inpakken van gezinspakketten en dagelijkse checklists.
            </p>
          </div>

          <div
            onClick={() => onSelectRole('medewerker')}
            className="p-5 bg-white border border-neutral-200 hover:border-emerald-400 rounded-2xl shadow-2xs cursor-pointer transition-all space-y-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-neutral-900 text-sm group-hover:text-emerald-800">
              Medewerkers Portaal
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              AI Terugroepcontrole, goederenintake, voorraad per stelling en QR-labels afdrukken.
            </p>
          </div>

          <div
            onClick={() => onSelectRole('beheerder')}
            className="p-5 bg-white border border-neutral-200 hover:border-emerald-400 rounded-2xl shadow-2xs cursor-pointer transition-all space-y-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-neutral-900 text-sm group-hover:text-emerald-800">
              Beheerders Dashboard
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Maandrapportages gedoneerde goederen, CSV export en lokale database back-ups.
            </p>
          </div>

          <div
            onClick={() => onSelectRole('inspecteur')}
            className="p-5 bg-white border border-neutral-200 hover:border-emerald-400 rounded-2xl shadow-2xs cursor-pointer transition-all space-y-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-neutral-900 text-sm group-hover:text-emerald-800">
              Anoniem Inspecteurs
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Inloggen met inspectienummer voor toezicht op HACCP, halal-scheiding en bejegening.
            </p>
          </div>

          <div
            onClick={() => onSelectRole('chat')}
            className="p-5 bg-white border border-neutral-200 hover:border-emerald-400 rounded-2xl shadow-2xs cursor-pointer transition-all space-y-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-neutral-900 text-sm group-hover:text-emerald-800">
              Team Chatbox
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Interne groepen met mobiele nummer verificatie via veilige lokale mailservice.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
