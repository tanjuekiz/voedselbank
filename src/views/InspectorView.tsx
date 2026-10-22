import React, { useState } from 'react';
import { DistributionSession, InspectionAudit, ProductItem, Location, ParcelPlan } from '../types';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  KeyRound, 
  Lock, 
  EyeOff, 
  LogOut, 
  Plus, 
  Calendar, 
  Users, 
  Thermometer, 
  FileCheck, 
  Award, 
  ChevronRight,
  HelpCircle,
  Hash
} from 'lucide-react';

interface InspectorViewProps {
  distributionSessions: DistributionSession[];
  inspections: InspectionAudit[];
  products: ProductItem[];
  locations: Location[];
  parcels: ParcelPlan[];
  onAddInspection: (
    audit: Omit<InspectionAudit, 'id' | 'inspectionDate' | 'inspectionTime' | 'anonymousVerificationHash'>
  ) => void;
  onOpenScanner: () => void;
}

const DEMO_INSPECTOR_BADGES = [
  { code: 'INSP-8402', role: 'Toezichthouder Voedselveiligheid & NVWA Kwaliteit' },
  { code: 'INSP-7701', role: 'Auditor Halal & Dieet Integriteit' },
  { code: 'INSP-9115', role: 'Mystery Inspector Koepel Voedselbanken NL' },
];

export const InspectorView: React.FC<InspectorViewProps> = ({
  distributionSessions,
  inspections,
  products,
  locations,
  parcels,
  onAddInspection,
  onOpenScanner,
}) => {
  // Authentication state for Inspector Number
  const [activeInspectorNumber, setActiveInspectorNumber] = useState<string | null>(() => {
    return localStorage.getItem('voedselbank_active_inspector_num') || null;
  });
  const [badgeInput, setBadgeInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Audit Form state
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [temperatureMeasured, setTemperatureMeasured] = useState<number>(4.2);
  const [coldChainCompliance, setColdChainCompliance] = useState<boolean>(true);
  const [halalStrict, setHalalStrict] = useState<boolean>(true);
  const [allergenClear, setAllergenClear] = useState<boolean>(true);
  const [expiryZero, setExpiryZero] = useState<boolean>(true);
  const [dignityScore, setDignityScore] = useState<number>(5);
  const [queueScore, setQueueScore] = useState<number>(4);
  const [hygieneScore, setHygieneScore] = useState<number>(5);
  const [findingsNotes, setFindingsNotes] = useState<string>('');
  const [praisesNotes, setPraisesNotes] = useState<string>('');
  const [selectedSampledProducts, setSelectedSampledProducts] = useState<string[]>([products[0]?.code || 'VB-2026-001']);
  const [selectedSampledParcels, setSelectedSampledParcels] = useState<string[]>([parcels[0]?.familyCode || 'GEZ-1042']);
  const [criticalDeficiencies, setCriticalDeficiencies] = useState<string[]>([]);
  const [submittedAuditFeedback, setSubmittedAuditFeedback] = useState<InspectionAudit | null>(null);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = badgeInput.trim().toUpperCase();
    if (!clean || clean.length < 4) {
      setLoginError('Voer een geldig inspecteursnummer in (bijv. INSP-8402).');
      return;
    }
    const finalCode = clean.startsWith('INSP-') ? clean : `INSP-${clean}`;
    setActiveInspectorNumber(finalCode);
    localStorage.setItem('voedselbank_active_inspector_num', finalCode);
    setLoginError(null);
  };

  const handleSelectDemoBadge = (code: string) => {
    setActiveInspectorNumber(code);
    localStorage.setItem('voedselbank_active_inspector_num', code);
    setLoginError(null);
  };

  const handleLogout = () => {
    setActiveInspectorNumber(null);
    localStorage.removeItem('voedselbank_active_inspector_num');
    setSelectedSessionId(null);
    setSubmittedAuditFeedback(null);
  };

  // Calculate score
  const calculateOverallScore = () => {
    let score = 0;
    if (coldChainCompliance) score += 20;
    if (halalStrict) score += 25;
    if (allergenClear) score += 20;
    if (expiryZero) score += 15;
    score += (dignityScore / 5) * 10;
    score += (hygieneScore / 5) * 5;
    score += (queueScore / 5) * 5;
    return Math.min(100, Math.round(score));
  };

  const getStatusFromScore = (score: number): InspectionAudit['status'] => {
    if (score >= 90) return 'uitmuntend';
    if (score >= 75) return 'voldoende';
    if (score >= 60) return 'aandachtspunt';
    return 'onvoldoende';
  };

  const handleStartAudit = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setSubmittedAuditFeedback(null);
    // prefill default sampled products
    if (products.length > 0) {
      setSelectedSampledProducts([products[0].code, products[1]?.code || '']);
    }
  };

  const handleSubmitAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !activeInspectorNumber) return;

    const session = distributionSessions.find((s) => s.id === selectedSessionId);
    if (!session) return;

    const overallScore = calculateOverallScore();
    const status = getStatusFromScore(overallScore);

    const audit = onAddInspection({
      inspectorNumber: activeInspectorNumber,
      sessionId: session.id,
      locationId: session.locationId,
      overallScore,
      status,
      checks: {
        coldChainCompliance,
        temperatureMeasuredC: Number(temperatureMeasured),
        halalSeparationStrict: halalStrict,
        allergenClearLabeling: allergenClear,
        expiryDatesZeroExpired: expiryZero,
        recipientDignityScore: dignityScore,
        queueFlowEfficiency: queueScore,
        haccpHygieneScore: hygieneScore,
      },
      sampledParcels: selectedSampledParcels.filter(Boolean),
      sampledProducts: selectedSampledProducts.filter(Boolean),
      findingsNotes: findingsNotes.trim() || 'Strikte steekproef uitgevoerd tijdens actieve uitdeelsessie.',
      criticalDeficiencies,
      praisesNotes: praisesNotes.trim() || 'Uitgifteteam werkt geordend en met respect.',
    });

    setSubmittedAuditFeedback(audit as unknown as InspectionAudit);
    setSelectedSessionId(null);
  };

  // Toggle Deficiencies
  const toggleDeficiency = (def: string) => {
    if (criticalDeficiencies.includes(def)) {
      setCriticalDeficiencies(criticalDeficiencies.filter((d) => d !== def));
    } else {
      setCriticalDeficiencies([...criticalDeficiencies, def]);
    }
  };

  // -------------------------------------------------------------
  // SCREEN 1: LOGIN WITH INSPECTOR NUMBER (NO PERSONAL NAMES)
  // -------------------------------------------------------------
  if (!activeInspectorNumber) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-neutral-200 rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-neutral-900 text-white p-8 sm:p-10 relative">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-neutral-800/80 border border-neutral-700 px-3 py-1 rounded-md mb-4">
              <EyeOff className="w-3.5 h-3.5" />
              <span>Anonieme Toezichtmodus</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Onafhankelijk Inspecteursportaal
            </h1>
            <p className="mt-2 text-sm text-neutral-300 max-w-2xl leading-relaxed">
              Dit portaal is bestemd voor onafhankelijke toezichthouders, NVWA-inspecteurs en auditoren.
              Om objectiviteit en integriteit te waarborgen, logt u uitsluitend in met uw{' '}
              <strong className="text-white">geanonimiseerde inspecteursnummer</strong>. Uw identiteit blijft
              volledig onbekend voor vrijwilligers en medewerkers.
            </p>
          </div>

          <div className="p-8 sm:p-10 space-y-8">
            {/* Inspector Login Form */}
            <form onSubmit={handleLogin} className="max-w-md mx-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2">
                  Inspecteursnummer / Badge Code:
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                  <input
                    type="text"
                    required
                    placeholder="Bijv. INSP-8402"
                    value={badgeInput}
                    onChange={(e) => setBadgeInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm font-mono border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 tracking-wider"
                  />
                </div>
                <span className="text-[11px] text-neutral-500 mt-1.5 block">
                  Elk geautoriseerd inspecteursnummer (formaat INSP-XXXX) verleent veilige toegang.
                </span>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md transition-colors"
              >
                Inloggen als Anonieme Inspecteur
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="max-w-xl mx-auto pt-6 border-t border-neutral-100">
              <span className="text-xs font-bold text-neutral-700 block mb-3 text-center">
                Of kies direct een geautoriseerd voorbeeld inspecteursnummer om te testen:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DEMO_INSPECTOR_BADGES.map((b) => (
                  <button
                    key={b.code}
                    onClick={() => handleSelectDemoBadge(b.code)}
                    className="p-3 bg-neutral-50 hover:bg-emerald-50 border border-neutral-200 hover:border-emerald-300 rounded-xl text-left transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-neutral-900 group-hover:text-emerald-800">
                        {b.code}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-emerald-600" />
                    </div>
                    <span className="text-[11px] text-neutral-500 block mt-1 leading-snug">
                      {b.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy Reassurance Guarantee */}
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-start gap-3 text-xs text-neutral-600">
              <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900 block mb-0.5">Anonimiteit gegarandeerd</strong>
                Niemand in het distributiepunt weet wie u bent. Uw rapportages worden gelogd onder uw badge-code
                en cryptografische inspectiehash, zodat feedback strikt feitelijk, objectief en veilig blijft.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 2: ACTIVE INSPECTOR DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Inspector Status Banner */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neutral-900 text-emerald-400 rounded-2xl shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
                Inspecteurs Toezicht & Uitdeelsessies
              </h1>
              <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                {activeInspectorNumber}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Controleer live wanneer er uitgedeeld wordt, verifieer koelketen, halal-integriteit en allergenen, en leg anonieme auditrapportages vast.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onOpenScanner}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
          >
            <Search className="w-4 h-4 text-emerald-700" />
            Product QR Scannen
          </button>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium text-neutral-600 hover:text-red-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-xl transition-colors"
            title="Uitloggen als inspecteur"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Badge Wisselen</span>
          </button>
        </div>
      </div>

      {/* Audit Feedback Confirmation Banner */}
      {submittedAuditFeedback && (
        <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-emerald-950">
                Inspectie Succesvol Vastgelegd met Anonieme Hash
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Rapport geregistreerd onder badge <strong className="font-mono">{submittedAuditFeedback.inspectorNumber}</strong>.
                Eindscore: <strong>{submittedAuditFeedback.overallScore}%</strong> ({submittedAuditFeedback.status}).
                Verificatiecode: <span className="font-mono">{submittedAuditFeedback.anonymousVerificationHash}</span>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSubmittedAuditFeedback(null)}
            className="text-xs font-medium text-emerald-800 hover:text-emerald-950 underline"
          >
            Sluiten
          </button>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 1: ROOSTER UITDEELSESSIES (CHECK WHEN FOOD IS DISTRIBUTED) */}
      {/* ----------------------------------------------------------------- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              Uitdeelsessies & Uitgifteschema per Locatie
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Overzicht van wanneer de voedselpakketten worden uitgereikt aan hulpvragers. Inspecties kunnen live tijdens uitgifte worden uitgevoerd.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-md">
            {distributionSessions.length} sessies in rooster
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {distributionSessions.map((session) => {
            const loc = locations.find((l) => l.id === session.locationId);
            const isLiveNow = session.status === 'nu_actief';
            const isSelected = selectedSessionId === session.id;

            return (
              <div
                key={session.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isLiveNow
                    ? 'bg-white border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'bg-white border-neutral-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                        {loc?.code || 'HUB'}
                      </span>
                      {isLiveNow ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          Nu Actief (Uitgifte bezig)
                        </span>
                      ) : session.status === 'afgerond' ? (
                        <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                          Afgerond
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          Gepland
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-neutral-900 mt-2">{session.locationName}</h3>
                    <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      {loc?.address}, {loc?.city}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-neutral-500 block font-medium">Tijdslot:</span>
                    <span className="font-mono text-sm font-bold text-neutral-900 block">
                      {session.timeSlot}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono">{session.date}</span>
                  </div>
                </div>

                {/* Session breakdown numbers */}
                <div className="mt-4 pt-3 border-t border-neutral-100 grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-neutral-50 p-2 rounded-lg">
                    <span className="text-neutral-500 block text-[11px]">Verwachte Gezinnen</span>
                    <span className="font-bold text-neutral-900 font-mono tabular-nums">
                      {session.expectedFamiliesCount}
                    </span>
                  </div>

                  <div className="bg-neutral-50 p-2 rounded-lg">
                    <span className="text-neutral-500 block text-[11px]">Halal Pakketten</span>
                    <span className="font-bold text-emerald-800 font-mono tabular-nums">
                      {session.halalPacksReserved}
                    </span>
                  </div>

                  <div className="bg-neutral-50 p-2 rounded-lg">
                    <span className="text-neutral-500 block text-[11px]">Dieet/Allergeen</span>
                    <span className="font-bold text-neutral-900 font-mono tabular-nums">
                      {session.dietaryAllergenPacksReserved}
                    </span>
                  </div>
                </div>

                {/* Audit Action Trigger */}
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-xs text-neutral-500">
                    Status: <strong className="text-neutral-800 capitalize">{session.inspectionStatus.replace('_', ' ')}</strong>
                  </span>

                  <button
                    onClick={() => handleStartAudit(session.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-neutral-900 text-white'
                        : isLiveNow
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                    }`}
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    {isSelected ? 'Formulier Geopend' : isLiveNow ? 'Inspecteer Deze Uitgifte' : 'Inspectie Starten'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 2: LIVE INSPECTION AUDIT FORM (TRIGGERED FOR A SESSION) */}
      {/* ----------------------------------------------------------------- */}
      {selectedSessionId && (
        <div className="bg-white border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Anoniem Kwaliteitsrapport · Badge: {activeInspectorNumber}</span>
              </div>
              <h3 className="text-lg font-bold text-neutral-900">
                Uitgifte Inspectieformulier: {distributionSessions.find((s) => s.id === selectedSessionId)?.locationName}
              </h3>
              <p className="text-xs text-neutral-500">
                Loop de veiligheidsnormen na tijdens de uitreiking van pakketten aan cliënten.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-neutral-500 block">Berekende Score</span>
                <span className="text-2xl font-bold font-mono text-emerald-800 tabular-nums">
                  {calculateOverallScore()}%
                </span>
              </div>
              <button
                onClick={() => setSelectedSessionId(null)}
                className="text-xs font-medium text-neutral-500 hover:text-neutral-800 px-3 py-1.5 border border-neutral-300 rounded-lg"
              >
                Sluiten
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmitAudit} className="space-y-6 text-xs">
            {/* Checklist Category 1: Koelketen & Temperatuur */}
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-emerald-700" />
                  1. Koelketen & HACCP Temperatuurmeting
                </h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={coldChainCompliance}
                    onChange={(e) => setColdChainCompliance(e.target.checked)}
                    className="rounded text-emerald-700 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-neutral-800">Voldoet aan HACCP norm (&lt; 7°C)</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="text-neutral-600 block mb-1">Gemeten kerntemperatuur koelruimte / uitgiftebak (°C):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperatureMeasured}
                    onChange={(e) => setTemperatureMeasured(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono text-xs bg-white"
                  />
                </div>
                <div className="text-neutral-500 text-[11px] flex items-center">
                  Gekoelde zuivel, vleeswaren en maaltijden moeten tot het moment van uitreiking strikt onder 7°C bewaard blijven.
                </div>
              </div>
            </div>

            {/* Checklist Category 2: Halal Borging & Allergenen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  2. Halal Borging & Scheiding
                </h4>
                <p className="text-neutral-600 text-[11px]">
                  Strikte scheiding tussen halal-gecertificeerde goederen en niet-halal producten (geen varkensvleesbesmetting).
                </p>
                <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-lg border border-emerald-200">
                  <input
                    type="checkbox"
                    checked={halalStrict}
                    onChange={(e) => setHalalStrict(e.target.checked)}
                    className="rounded text-emerald-700"
                  />
                  <span className="font-semibold text-emerald-950">
                    100% Correct gescheiden & correct verpakt
                  </span>
                </label>
              </div>

              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  3. Allergeneninformatie & THT Vervaldata
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-lg border border-neutral-200">
                    <input
                      type="checkbox"
                      checked={allergenClear}
                      onChange={(e) => setAllergenClear(e.target.checked)}
                      className="rounded text-emerald-700"
                    />
                    <span className="font-semibold text-neutral-900">
                      Allergenenlabels (gluten, noten, etc.) kloppen
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 bg-white rounded-lg border border-neutral-200">
                    <input
                      type="checkbox"
                      checked={expiryZero}
                      onChange={(e) => setExpiryZero(e.target.checked)}
                      className="rounded text-emerald-700"
                    />
                    <span className="font-semibold text-neutral-900">
                      Geen verlopen producten in pakketten aangetroffen
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Checklist Category 3: Waardigheid & Privacy van Hulpvragers */}
            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-4">
              <h4 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                4. Bejegening, Privacy en Doorstroom (1 - 5 sterren)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-semibold text-neutral-800 block mb-1">
                    Waardigheid & Respect:
                  </label>
                  <select
                    value={dignityScore}
                    onChange={(e) => setDignityScore(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value={5}>5 - Zeer warm, discreet en respectvol</option>
                    <option value={4}>4 - Goed, privacy gewaarborgd</option>
                    <option value={3}>3 - Voldoende, lichte verbeterpunten</option>
                    <option value={2}>2 - Onvoldoende discretie</option>
                    <option value={1}>1 - Zorgelijk gebrek aan respect</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-800 block mb-1">
                    Wachttijd & Doorstroom:
                  </label>
                  <select
                    value={queueScore}
                    onChange={(e) => setQueueScore(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value={5}>5 - Geen wachttijd, direct geholpen</option>
                    <option value={4}>4 - Vlotte doorstroom (&lt; 10 min)</option>
                    <option value={3}>3 - Acceptabele wachttijd</option>
                    <option value={2}>2 - Lange rij buiten</option>
                    <option value={1}>1 - Chaotische wachttijd</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-800 block mb-1">
                    HACCP Hygiëne Vrijwilligers:
                  </label>
                  <select
                    value={hygieneScore}
                    onChange={(e) => setHygieneScore(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value={5}>5 - Vlekkeloos, handschoenen, schoon</option>
                    <option value={4}>4 - Goede hygiëne</option>
                    <option value={3}>3 - Voldoende</option>
                    <option value={2}>2 - Aandachtspunt schoonmaak</option>
                    <option value={1}>1 - Onhygiënische uitgifte</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Steekproef Registratie */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-neutral-800 block mb-1">
                  Gecontroleerde Steekproef Producten (QR-Codes):
                </label>
                <input
                  type="text"
                  placeholder="Bijv. VB-2026-001, VB-2026-008"
                  value={selectedSampledProducts.join(', ')}
                  onChange={(e) =>
                    setSelectedSampledProducts(
                      e.target.value.split(',').map((s) => s.trim())
                    )
                  }
                  className="w-full p-2 border border-neutral-300 rounded-lg font-mono bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-800 block mb-1">
                  Gecontroleerde Gezinspakketten:
                </label>
                <input
                  type="text"
                  placeholder="Bijv. GEZ-1042, GEZ-1088"
                  value={selectedSampledParcels.join(', ')}
                  onChange={(e) =>
                    setSelectedSampledParcels(
                      e.target.value.split(',').map((s) => s.trim())
                    )
                  }
                  className="w-full p-2 border border-neutral-300 rounded-lg font-mono bg-white"
                />
              </div>
            </div>

            {/* Notes & Praises */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-neutral-800 block mb-1">
                  Bevindingen & Aandachtspunten:
                </label>
                <textarea
                  rows={2}
                  placeholder="Beschrijf eventuele waarnemingen tijdens de uitgifte..."
                  value={findingsNotes}
                  onChange={(e) => setFindingsNotes(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-800 block mb-1">
                  Complimenten & Goede Praktijken:
                </label>
                <textarea
                  rows={2}
                  placeholder="Positieve punten ter stimulering van de vrijwilligers..."
                  value={praisesNotes}
                  onChange={(e) => setPraisesNotes(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-neutral-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                <Hash className="w-3.5 h-3.5 text-emerald-700" />
                <span>Wordt anoniem ondertekend met cryptografische hash</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSessionId(null)}
                  className="px-4 py-2 font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md transition-colors"
                >
                  Anoniem Auditrapport Indienen
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 3: RECENTE INSPECTIERAPPORTAGES & TOEZICHT HISTORIE */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-700" />
              Geregistreerde Auditrapportages ({inspections.length})
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Historische inspecties uitgevoerd door bevoegde anonieme inspecteurs.
            </p>
          </div>
        </div>

        <div className="divide-y divide-neutral-100">
          {inspections.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              Nog geen inspecties geregistreerd.
            </div>
          ) : (
            inspections.map((audit) => {
              const loc = locations.find((l) => l.id === audit.locationId);
              return (
                <div key={audit.id} className="py-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded">
                        {audit.inspectorNumber}
                      </span>
                      <span className="text-xs font-semibold text-neutral-900">
                        {loc?.name || audit.locationId}
                      </span>
                      <span className="text-xs text-neutral-400">·</span>
                      <span className="text-xs text-neutral-500 font-mono">
                        {audit.inspectionDate} om {audit.inspectionTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          audit.status === 'uitmuntend'
                            ? 'bg-emerald-100 text-emerald-800'
                            : audit.status === 'voldoende'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {audit.status} ({audit.overallScore}%)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                    <div className="p-2 bg-neutral-50 rounded-lg">
                      <span className="text-neutral-500 block text-[11px]">Koeltemp:</span>
                      <span className="font-mono font-bold text-neutral-800">
                        {audit.checks.temperatureMeasuredC}°C (HACCP {audit.checks.coldChainCompliance ? '✓' : '✗'})
                      </span>
                    </div>

                    <div className="p-2 bg-neutral-50 rounded-lg">
                      <span className="text-neutral-500 block text-[11px]">Halal Scheiding:</span>
                      <span className="font-bold text-emerald-800">
                        {audit.checks.halalSeparationStrict ? '100% Geborgd' : 'Aandachtspunt'}
                      </span>
                    </div>

                    <div className="p-2 bg-neutral-50 rounded-lg">
                      <span className="text-neutral-500 block text-[11px]">Allergenen & THT:</span>
                      <span className="font-bold text-neutral-800">
                        {audit.checks.expiryDatesZeroExpired ? '0 Verlopen' : 'Alert'}
                      </span>
                    </div>

                    <div className="p-2 bg-neutral-50 rounded-lg">
                      <span className="text-neutral-500 block text-[11px]">Waardigheidscore:</span>
                      <span className="font-bold text-neutral-800">
                        {audit.checks.recipientDignityScore} / 5 sterren
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 bg-neutral-50/70 p-2.5 rounded-lg border border-neutral-100 mt-1">
                    <strong className="text-neutral-800">Bevindingen:</strong> {audit.findingsNotes}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono pt-1">
                    <span>Verificatiecode: {audit.anonymousVerificationHash}</span>
                    <span>Steekproef: {audit.sampledParcels.join(', ')}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
