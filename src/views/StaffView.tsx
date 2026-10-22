import React, { useState } from 'react';
import { ProductItem, Location, AllergenType, HalalStatus } from '../types';
import { ExportService } from '../services/exportService';
import { verifyProductWithAI, ProductAIVerificationResult } from '../services/aiVerificationService';
import {
  Plus,
  Search,
  Filter,
  QrCode,
  Printer,
  Download,
  MapPin,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Check,
  RefreshCw,
  Trash2,
  Edit,
  Sparkles,
  ShieldAlert,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface StaffViewProps {
  products: ProductItem[];
  locations: Location[];
  onAddProduct: (prod: Omit<ProductItem, 'id'>) => ProductItem;
  onUpdateProduct: (id: string, updates: Partial<ProductItem>) => void;
  onDeleteProduct: (id: string) => void;
  onOpenScanner: () => void;
  onPrintLabel: (product: ProductItem) => void;
  onTriggerEmergencyDelivery: () => void;
}

const ALLERGEN_OPTIONS: { id: AllergenType; label: string }[] = [
  { id: 'gluten', label: 'Gluten (Tarwe/Rogge/Haver)' },
  { id: 'lactose', label: 'Lactose / Melk' },
  { id: 'noten', label: 'Noten (Amandelen/Walnoten)' },
  { id: 'pinda', label: 'Pinda / Aardnoten' },
  { id: 'ei', label: 'Ei' },
  { id: 'soja', label: 'Soja' },
  { id: 'vis', label: 'Vis' },
  { id: 'schaaldieren', label: 'Schaaldieren / Garnalen' },
  { id: 'selderij', label: 'Selderij' },
  { id: 'sesam', label: 'Sesamzaad' },
];

export const StaffView: React.FC<StaffViewProps> = ({
  products,
  locations,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onOpenScanner,
  onPrintLabel,
  onTriggerEmergencyDelivery,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [halalFilter, setHalalFilter] = useState<'all' | 'halal_gecertificeerd' | 'natuurlijk_halal' | 'niet_halal'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyUrgentExpiry, setShowOnlyUrgentExpiry] = useState<boolean>(false);

  // Intake Modal State
  const [showIntakeModal, setShowIntakeModal] = useState<boolean>(false);
  const [intakeCode, setIntakeCode] = useState<string>(`VB-2026-${String(products.length + 1).padStart(3, '0')}`);
  const [intakeName, setIntakeName] = useState<string>('');
  const [intakeCategory, setIntakeCategory] = useState<ProductItem['category']>('Droogwaren & Pasta');
  const [intakeQuantity, setIntakeQuantity] = useState<number>(50);
  const [intakeUnit, setIntakeUnit] = useState<ProductItem['unit']>('pakken');
  const [intakeLocationId, setIntakeLocationId] = useState<string>(locations[0]?.id || 'loc-centraal');
  const [intakeShelf, setIntakeShelf] = useState<string>('Stelling A-01');
  const [intakeExpDate, setIntakeExpDate] = useState<string>('2026-11-15');
  const [intakeExpType, setIntakeExpType] = useState<'THT' | 'TGT'>('THT');
  const [intakeHalalStatus, setIntakeHalalStatus] = useState<HalalStatus>('natuurlijk_halal');
  const [intakeHalalCertifier, setIntakeHalalCertifier] = useState<string>('');
  const [intakeAllergens, setIntakeAllergens] = useState<AllergenType[]>([]);
  const [intakeDonorName, setIntakeDonorName] = useState<string>('Albert Heijn');
  const [intakeDonorType, setIntakeDonorType] = useState<ProductItem['donorType']>('Supermarkt');
  const [intakeWeightKg, setIntakeWeightKg] = useState<number>(45);
  const [intakeBatch, setIntakeBatch] = useState<string>('BATCH-2610');
  const [intakeNotes, setIntakeNotes] = useState<string>('');

  // AI Verification State
  const [isAiChecking, setIsAiChecking] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<ProductAIVerificationResult | null>(null);

  const toggleAllergen = (all: AllergenType) => {
    if (intakeAllergens.includes(all)) {
      setIntakeAllergens(intakeAllergens.filter((a) => a !== all));
    } else {
      setIntakeAllergens([...intakeAllergens, all]);
    }
  };

  // Run AI Verification for product intake (checks recalls + halal + allergens)
  const handleRunAiInspection = async (customName?: string, customBatch?: string, customCat?: ProductItem['category']) => {
    const nameToCheck = customName || intakeName;
    if (!nameToCheck.trim()) return;

    setIsAiChecking(true);
    try {
      const result = await verifyProductWithAI({
        productName: nameToCheck.trim(),
        category: customCat || intakeCategory,
        batchNumber: customBatch || intakeBatch,
        ingredients: intakeNotes,
      });

      setAiResult(result);
      setIntakeHalalStatus(result.halalStatus);
      if (result.halalCertifierSuggestion) {
        setIntakeHalalCertifier(result.halalCertifierSuggestion);
      }
      if (result.detectedAllergens && result.detectedAllergens.length > 0) {
        // Merge detected allergens
        const merged = Array.from(new Set([...intakeAllergens, ...result.detectedAllergens]));
        setIntakeAllergens(merged);
      }
    } catch (err) {
      console.error('AI check failed:', err);
    } finally {
      setIsAiChecking(false);
    }
  };

  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeName.trim()) return;

    const newProd = onAddProduct({
      code: intakeCode.trim() || `VB-${Date.now()}`,
      name: intakeName.trim(),
      category: intakeCategory,
      quantity: Number(intakeQuantity) || 0,
      unit: intakeUnit,
      locationId: intakeLocationId,
      shelf: intakeShelf.trim(),
      expirationDate: intakeExpDate,
      expirationType: intakeExpType,
      halalStatus: intakeHalalStatus,
      halalCertifier: intakeHalalCertifier.trim() ? intakeHalalCertifier.trim() : undefined,
      allergens: intakeAllergens,
      donorName: intakeDonorName.trim(),
      donorType: intakeDonorType,
      donationDate: '2026-10-22',
      weightKg: Number(intakeWeightKg) || 0,
      batchNumber: intakeBatch.trim(),
      status: aiResult?.hasActiveRecallAlert ? 'afgekeurd' : 'beschikbaar',
      notes: intakeNotes.trim() ? intakeNotes.trim() : undefined,
    });

    setShowIntakeModal(false);
    // Reset form for next
    setIntakeName('');
    setIntakeAllergens([]);
    setAiResult(null);
    setIntakeCode(`VB-2026-${String(products.length + 2).padStart(3, '0')}`);
    // Offer quick print
    onPrintLabel(newProd);
  };

  // Expiration helper
  const getDaysUntilExpiration = (dateStr: string) => {
    const today = new Date('2026-10-22');
    const exp = new Date(dateStr);
    const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diff;
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (selectedLocation !== 'all' && p.locationId !== selectedLocation) return false;
    if (halalFilter !== 'all' && p.halalStatus !== halalFilter) return false;
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (showOnlyUrgentExpiry) {
      const days = getDaysUntilExpiration(p.expirationDate);
      if (days > 5) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      const matchDonor = p.donorName.toLowerCase().includes(q);
      const matchShelf = p.shelf.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchDonor && !matchShelf) return false;
    }
    return true;
  });

  // Calculate location stats
  const totalVolumeKg = filteredProducts.reduce((sum, p) => sum + p.weightKg, 0);
  const totalItemsCount = filteredProducts.reduce((sum, p) => sum + p.quantity, 0);
  const totalHalalCount = filteredProducts.filter(
    (p) => p.halalStatus === 'halal_gecertificeerd' || p.halalStatus === 'natuurlijk_halal'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Staff Bar */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
              Medewerker Portaal & Voorraadbeheer
            </h1>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              AI Kwaliteit & Halal Borging
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Realtime voorraad per hub, goederenintake met AI-terugroepactiecheck (NVWA), halal-borging en THT-tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => {
              setAiResult(null);
              setShowIntakeModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Product Intake (+ AI Check)
          </button>

          <button
            onClick={onOpenScanner}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
          >
            <QrCode className="w-4 h-4 text-emerald-700" />
            QR Scanner
          </button>

          <button
            onClick={onTriggerEmergencyDelivery}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors"
            title="Meld een binnengekomen spoedlevering direct aan alle medewerkers"
          >
            <AlertTriangle className="w-4 h-4" />
            Spoedlevering Melden
          </button>

          <button
            onClick={() => ExportService.exportInventoryToCSV(products)}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-xl transition-colors"
            title="Download actuele voorraad als CSV"
          >
            <Download className="w-4 h-4" />
            Voorraad CSV
          </button>
        </div>
      </div>

      {/* Visual Discipline Guide Banner: Halal Groen & Anders Normaal */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-neutral-700">Visuele Kleurcodering:</span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              Halal Voedingsmiddelen (Groen Gekleurd)
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-white text-neutral-700 border border-neutral-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-400"></span>
              Niet-Halal / Regulier (Normale neutrale stijl)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-neutral-500 font-mono">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>AI Terugroepcontrole: Gemini 3.8 Flash + NVWA Veiligheidskoppeling</span>
        </div>
      </div>

      {/* Realtime KPI Strip per Locatie */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs text-neutral-500 font-medium block">Getoonde Artikelen</span>
          <span className="text-2xl font-bold text-neutral-900 font-mono tabular-nums">
            {filteredProducts.length}
          </span>
          <span className="text-xs text-neutral-400 block mt-0.5">unieke batchcodes</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs text-neutral-500 font-medium block">Halal Voorraadlijn</span>
          <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {totalHalalCount} / {filteredProducts.length}
          </span>
          <span className="text-xs text-emerald-600 font-medium block mt-0.5">
            groen gemarkeerd in magazijn
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs text-neutral-500 font-medium block">Totaal Gewicht</span>
          <span className="text-2xl font-bold text-emerald-800 font-mono tabular-nums">
            {totalVolumeKg.toFixed(1)} kg
          </span>
          <span className="text-xs text-neutral-400 block mt-0.5">fysieke voedselvoorraad</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs">
          <span className="text-xs text-neutral-500 font-medium block">THT Vervalrisico (&le;5 dgn)</span>
          <span className="text-2xl font-bold text-amber-700 font-mono tabular-nums">
            {products.filter((p) => getDaysUntilExpiration(p.expirationDate) <= 5).length}
          </span>
          <span className="text-xs text-neutral-400 block mt-0.5">vereist directe FIFO actie</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
            <input
              type="text"
              placeholder="Zoek op productnaam, QR code (VB-2026-...), donateur of schap..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Location Selector */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="text-xs py-2 px-3 border border-neutral-300 rounded-lg bg-white"
            >
              <option value="all">Alle Locaties</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.code})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-2 px-3 border border-neutral-300 rounded-lg bg-white"
          >
            <option value="all">Alle Categorieën</option>
            <option value="Groente & Fruit">Groente & Fruit</option>
            <option value="Brood & Bakkerij">Brood & Bakkerij</option>
            <option value="Zuivel & Eieren">Zuivel & Eieren</option>
            <option value="Droogwaren & Pasta">Droogwaren & Pasta</option>
            <option value="Vlees, Vis & Plantaardig">Vlees, Vis & Plantaardig</option>
            <option value="Conserven & Peulvruchten">Conserven & Peulvruchten</option>
            <option value="Babyvoeding & Verzorging">Babyvoeding & Verzorging</option>
            <option value="Dranken & Sappen">Dranken & Sappen</option>
          </select>
        </div>

        {/* Halal and Expiry Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-700">Halal Filter:</span>
            <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-lg">
              <button
                onClick={() => setHalalFilter('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                  halalFilter === 'all' ? 'bg-white shadow-xs text-neutral-900 font-semibold' : 'text-neutral-600'
                }`}
              >
                Alles
              </button>
              <button
                onClick={() => setHalalFilter('halal_gecertificeerd')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                  halalFilter === 'halal_gecertificeerd'
                    ? 'bg-emerald-600 shadow-xs text-white font-semibold'
                    : 'text-emerald-800'
                }`}
              >
                Gecertificeerd Halal (Groen)
              </button>
              <button
                onClick={() => setHalalFilter('natuurlijk_halal')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                  halalFilter === 'natuurlijk_halal'
                    ? 'bg-emerald-100 text-emerald-950 font-semibold shadow-xs'
                    : 'text-neutral-600'
                }`}
              >
                Natuurlijk Halal (Groen)
              </button>
              <button
                onClick={() => setHalalFilter('niet_halal')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                  halalFilter === 'niet_halal' ? 'bg-white shadow-xs text-neutral-900 font-semibold' : 'text-neutral-600'
                }`}
              >
                Niet Halal (Normaal)
              </button>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-neutral-700 font-medium">
            <input
              type="checkbox"
              checked={showOnlyUrgentExpiry}
              onChange={(e) => setShowOnlyUrgentExpiry(e.target.checked)}
              className="rounded text-emerald-700 focus:ring-emerald-500"
            />
            <span className={showOnlyUrgentExpiry ? 'text-amber-800 font-bold' : ''}>
              Toon alleen items die bijna verlopen (&le; 5 dagen)
            </span>
          </label>
        </div>
      </div>

      {/* Product Inventory Table (Halal Groen Gekleurd, Anders Normaal) */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Product & Categorie</th>
                <th className="py-3 px-4">Voorraad</th>
                <th className="py-3 px-4">Locatie & Schap</th>
                <th className="py-3 px-4">Houdbaarheid & Status</th>
                <th className="py-3 px-4">Halal Status (Groen = Halal, Wit = Normaal)</th>
                <th className="py-3 px-4">Allergenen</th>
                <th className="py-3 px-4">Donateur</th>
                <th className="py-3 px-4 text-right">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-neutral-400">
                    Geen producten gevonden die voldoen aan de geselecteerde filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const daysLeft = getDaysUntilExpiration(p.expirationDate);
                  const isUrgent = daysLeft <= 3;
                  const loc = locations.find((l) => l.id === p.locationId);
                  const isHalal = p.halalStatus === 'halal_gecertificeerd' || p.halalStatus === 'natuurlijk_halal';

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors border-l-4 ${
                        isHalal
                          ? 'bg-emerald-50/50 hover:bg-emerald-100/60 border-l-emerald-600 text-emerald-950'
                          : 'bg-white hover:bg-neutral-50/80 border-l-neutral-200 text-neutral-800'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                        <span className={isHalal ? 'text-emerald-900' : 'text-neutral-800'}>
                          {p.code}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {isHalal && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" title="Halal product" />
                          )}
                          <span className={`font-bold block leading-tight ${isHalal ? 'text-emerald-950' : 'text-neutral-900'}`}>
                            {p.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-500">{p.category}</span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold tabular-nums whitespace-nowrap">
                        {p.quantity} {p.unit}
                        <span className="text-[11px] text-neutral-400 block font-normal">
                          {p.weightKg} kg
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="block font-medium text-neutral-800">{loc?.name || p.locationId}</span>
                        <span className="text-[11px] font-mono text-neutral-500">{p.shelf}</span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded font-semibold ${
                              daysLeft <= 0
                                ? 'bg-red-100 text-red-800'
                                : isUrgent
                                ? 'bg-amber-100 text-amber-900'
                                : isHalal
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-neutral-100 text-neutral-700'
                            }`}
                          >
                            {p.expirationType} {p.expirationDate}
                          </span>
                        </div>
                        <span className="text-[10px] text-neutral-500 block mt-0.5">
                          {daysLeft <= 0
                            ? 'Vervallen!'
                            : daysLeft === 1
                            ? 'Verloopt morgen!'
                            : `Nog ${daysLeft} dagen`}
                        </span>
                      </td>

                      {/* Halal Status Column - Halal GROEN GEKLEURD, anders NORMAAL */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {p.halalStatus === 'halal_gecertificeerd' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-900 bg-emerald-200/80 px-2.5 py-1 rounded-md border border-emerald-400 shadow-2xs">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                              Gecertificeerd Halal
                            </span>
                            {p.halalCertifier && (
                              <span className="text-[10px] text-emerald-700 block mt-0.5 truncate max-w-[150px] font-medium">
                                {p.halalCertifier}
                              </span>
                            )}
                          </div>
                        ) : p.halalStatus === 'natuurlijk_halal' ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-300">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Natuurlijk Halal (Vega)
                          </span>
                        ) : (
                          /* ANDERS NORMAAL: Neutral white/gray styling */
                          <span className="inline-flex items-center gap-1 text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200 font-normal">
                            Niet Halal / Regulier
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {p.allergens.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {p.allergens.map((all) => (
                              <span
                                key={all}
                                className="text-[10px] font-semibold text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded"
                              >
                                {all}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-[11px]">Geen</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-neutral-800 block">{p.donorName}</span>
                        <span className="text-[10px] text-neutral-400 font-mono">Batch: {p.batchNumber}</span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onPrintLabel(p)}
                            className="p-1.5 text-neutral-600 hover:text-emerald-800 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="QR-Label Afdrukken"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const newQty = prompt(`Nieuwe voorraad voor ${p.name}:`, String(p.quantity));
                              if (newQty !== null) {
                                const parsed = parseInt(newQty, 10);
                                if (!isNaN(parsed) && parsed >= 0) {
                                  onUpdateProduct(p.id, { quantity: parsed });
                                }
                              }
                            }}
                            className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Voorraad aanpassen"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Weet u zeker dat u "${p.name}" wilt verwijderen?`)) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 text-neutral-400 hover:text-red-700 hover:bg-neutral-100 rounded-lg transition-colors"
                            title="Verwijderen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Product Intake & Halal/Allergen Registration + AI Recall & Halal Scanner */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-neutral-200 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-neutral-900">
                    Product Inboeken & AI Veiligheidscontrole
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                    AI Gemini + NVWA
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  Voer het product in. De AI controleert automatisch op terugroepacties (NVWA) en halal-conformiteit.
                </p>
              </div>
              <button
                onClick={() => setShowIntakeModal(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Test Demo Presets */}
            <div className="mb-4 p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
              <span className="font-semibold text-neutral-700 block mb-1.5">
                ⚡ Snelle Testvoorbeelden (Klik om in te laden):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIntakeName('Gerookte Zalmplakken 200g (Batch L-26)');
                    setIntakeCategory('Vlees, Vis & Plantaardig');
                    setIntakeBatch('L-26-ZM');
                    setIntakeNotes('Listeria vermoeden gerapporteerd');
                    handleRunAiInspection(
                      'Gerookte Zalmplakken 200g (Batch L-26)',
                      'L-26-ZM',
                      'Vlees, Vis & Plantaardig'
                    );
                  }}
                  className="px-2.5 py-1 text-[11px] bg-red-50 text-red-800 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  ⚠️ Test NVWA Terugroepactie (Gerookte Zalm)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIntakeName('Halal Gecertificeerde Kipsaté 400g');
                    setIntakeCategory('Vlees, Vis & Plantaardig');
                    setIntakeBatch('HQC-26-88');
                    setIntakeNotes('Met officieel Halal Correct keurmerk');
                    handleRunAiInspection(
                      'Halal Gecertificeerde Kipsaté 400g',
                      'HQC-26-88',
                      'Vlees, Vis & Plantaardig'
                    );
                  }}
                  className="px-2.5 py-1 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
                >
                  🟢 Test Gecertificeerd Halal (Kip)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIntakeName('Gelderse Boeren Rookworst & Spek');
                    setIntakeCategory('Vlees, Vis & Plantaardig');
                    setIntakeBatch('BW-990');
                    setIntakeNotes('Bevat varkensvlees en dierlijk vet');
                    handleRunAiInspection(
                      'Gelderse Boeren Rookworst & Spek',
                      'BW-990',
                      'Vlees, Vis & Plantaardig'
                    );
                  }}
                  className="px-2.5 py-1 text-[11px] bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-lg hover:bg-neutral-200 transition-colors font-medium"
                >
                  ⚪ Test Niet Halal (Varkensvlees / Spek)
                </button>
              </div>
            </div>

            <form onSubmit={handleIntakeSubmit} className="space-y-4 text-xs">
              {/* Product Name & AI Inspect Trigger Button */}
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Productnaam *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Bijv. Halal Kipfiletblokjes 500g of Verse Appels"
                    value={intakeName}
                    onChange={(e) => setIntakeName(e.target.value)}
                    className="flex-1 p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handleRunAiInspection()}
                    disabled={isAiChecking || !intakeName.trim()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors disabled:opacity-50 shrink-0"
                  >
                    {isAiChecking ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    {isAiChecking ? 'AI Analyseert...' : 'AI Controle (Terugroep & Halal)'}
                  </button>
                </div>
              </div>

              {/* AI VERIFICATION RESULTS DISPLAY BOX */}
              {aiResult && (
                <div className="space-y-3 p-4 rounded-xl border transition-all animate-in fade-in">
                  {/* Recall Alert (NVWA) */}
                  {aiResult.hasActiveRecallAlert ? (
                    <div className="p-3.5 bg-red-50 border-2 border-red-500 rounded-xl text-red-950 space-y-2">
                      <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                        <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce" />
                        <span>NVWA VEILIGHEIDSWAARSCHUWING / TERUGROEPACTIE GEDETECTEERD!</span>
                      </div>
                      <p className="font-semibold text-xs text-red-900">
                        {aiResult.recallAlertTitle || 'Terugroepactie van toepassing op dit artikel'}
                      </p>
                      <p className="text-xs text-red-800">
                        {aiResult.recallExplanation}
                      </p>
                      <div className="p-2 bg-red-100/80 rounded-lg text-xs font-medium text-red-900">
                        <strong>Advies voor voedselbank:</strong> {aiResult.safetyAdvice}
                      </div>
                      <div className="pt-1 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            alert('Product wordt als AFGEKEURD geregistreerd ter bescherming van cliënten.');
                          }}
                          className="px-3 py-1.5 bg-red-700 text-white rounded-lg text-xs font-bold hover:bg-red-800"
                        >
                          Afkeuren & Niet Toelaten in Magazijn
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-2 text-emerald-900 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>NVWA Controle:</strong> Geen actieve terugroepacties gemeld voor dit type product of batch.
                      </span>
                    </div>
                  )}

                  {/* Halal Classification Result Display (HALAL GROEN, ANDERS NORMAAL) */}
                  {aiResult.halalStatus === 'halal_gecertificeerd' || aiResult.halalStatus === 'natuurlijk_halal' ? (
                    /* HALAL = GROEN */
                    <div className="p-3 bg-emerald-50 border-2 border-emerald-500 rounded-xl text-emerald-950 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                          <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                          HALAL GEVALLIDEERD (Groen Gemarkeerd)
                        </span>
                        <span className="text-[10px] font-mono uppercase bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded font-bold">
                          {aiResult.halalStatus === 'halal_gecertificeerd' ? 'Gecertificeerd Halal' : 'Natuurlijk Halal'}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                        {aiResult.halalMotivation}
                      </p>
                      {aiResult.halalCertifierSuggestion && (
                        <p className="text-[11px] text-emerald-700 font-mono">
                          Aanbevolen borging: {aiResult.halalCertifierSuggestion}
                        </p>
                      )}
                    </div>
                  ) : (
                    /* ANDERS NORMAAL = Neutraal */
                    <div className="p-3 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-800 flex items-center gap-1.5 text-xs">
                          <span className="w-3 h-3 rounded-full bg-neutral-400"></span>
                          REGULIER / NIET HALAL (Normale Weergave)
                        </span>
                        <span className="text-[10px] font-mono uppercase bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded">
                          Niet Halal
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {aiResult.halalMotivation}
                      </p>
                    </div>
                  )}

                  {/* Detected Allergens notification */}
                  {aiResult.detectedAllergens.length > 0 && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
                      <Info className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        AI heeft de volgende allergenen aangevinkt:{' '}
                        <strong>{aiResult.detectedAllergens.join(', ')}</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">QR / Barcode Code</label>
                  <input
                    type="text"
                    required
                    value={intakeCode}
                    onChange={(e) => setIntakeCode(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Categorie</label>
                  <select
                    value={intakeCategory}
                    onChange={(e) => setIntakeCategory(e.target.value as ProductItem['category'])}
                    className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="Groente & Fruit">Groente & Fruit</option>
                    <option value="Brood & Bakkerij">Brood & Bakkerij</option>
                    <option value="Zuivel & Eieren">Zuivel & Eieren</option>
                    <option value="Droogwaren & Pasta">Droogwaren & Pasta</option>
                    <option value="Vlees, Vis & Plantaardig">Vlees, Vis & Plantaardig</option>
                    <option value="Conserven & Peulvruchten">Conserven & Peulvruchten</option>
                    <option value="Babyvoeding & Verzorging">Babyvoeding & Verzorging</option>
                    <option value="Dranken & Sappen">Dranken & Sappen</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Aantal</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={intakeQuantity}
                    onChange={(e) => setIntakeQuantity(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Eenheid</label>
                  <select
                    value={intakeUnit}
                    onChange={(e) => setIntakeUnit(e.target.value as ProductItem['unit'])}
                    className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="stuks">stuks</option>
                    <option value="pakken">pakken</option>
                    <option value="kratten">kratten</option>
                    <option value="blikken">blikken</option>
                    <option value="kg">kg</option>
                    <option value="liters">liters</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Totaalgewicht (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={intakeWeightKg}
                    onChange={(e) => setIntakeWeightKg(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono tabular-nums"
                  />
                </div>
              </div>

              {/* Location & Shelf */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Locatie Hub</label>
                  <select
                    value={intakeLocationId}
                    onChange={(e) => setIntakeLocationId(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Schaplocatie</label>
                  <input
                    type="text"
                    required
                    value={intakeShelf}
                    onChange={(e) => setIntakeShelf(e.target.value)}
                    placeholder="Bijv. Koelcel K-01 of Stelling B-03"
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Expiration Date Section */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="font-bold text-neutral-900 block mb-2">Houdbaarheid & Vervaldata</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">Type Datum</label>
                    <select
                      value={intakeExpType}
                      onChange={(e) => setIntakeExpType(e.target.value as 'THT' | 'TGT')}
                      className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
                    >
                      <option value="THT">THT (Tenminste Houdbaar Tot - Kwaliteitsgarantie)</option>
                      <option value="TGT">TGT (Te Gebruiken Tot - Voedselveiligheid / Koelvers)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">Vervaldatum *</label>
                    <input
                      type="date"
                      required
                      value={intakeExpDate}
                      onChange={(e) => setIntakeExpDate(e.target.value)}
                      className="w-full p-2 border border-neutral-300 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Halal Status Section (GROEN GEKLEURD ALS HALAL, ANDERS NORMAAL) */}
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  intakeHalalStatus === 'halal_gecertificeerd' || intakeHalalStatus === 'natuurlijk_halal'
                    ? 'bg-emerald-50 border-2 border-emerald-500'
                    : 'bg-neutral-50 border border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`font-bold block ${
                      intakeHalalStatus !== 'niet_halal' ? 'text-emerald-950' : 'text-neutral-900'
                    }`}
                  >
                    Halal Status & Keurmerk (Halal = Groen gekleurd, Anders = Normaal)
                  </span>
                  {intakeHalalStatus !== 'niet_halal' ? (
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded shadow-2xs">
                      ✓ Halal Gemarkeerd
                    </span>
                  ) : (
                    <span className="text-[10px] bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded">
                      Normale Status
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">Halal Categorie</label>
                    <select
                      value={intakeHalalStatus}
                      onChange={(e) => setIntakeHalalStatus(e.target.value as HalalStatus)}
                      className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
                    >
                      <option value="halal_gecertificeerd">Gecertificeerd Halal (Met Keurmerk) [Groen]</option>
                      <option value="natuurlijk_halal">Natuurlijk Halal (Groente/Fruit/Basis) [Groen]</option>
                      <option value="niet_halal">Niet Halal / Regulier Voedsel [Normaal]</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">Certificerende Instantie</label>
                    <input
                      type="text"
                      placeholder="Bijv. Halal Correct, HQC, HFFIA..."
                      value={intakeHalalCertifier}
                      onChange={(e) => setIntakeHalalCertifier(e.target.value)}
                      className="w-full p-2 border border-neutral-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Allergen Checkboxes */}
              <div>
                <label className="font-bold text-neutral-900 block mb-1">
                  Allergeneninformatie (Vink aan wat van toepassing is):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  {ALLERGEN_OPTIONS.map((all) => (
                    <label key={all.id} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={intakeAllergens.includes(all.id)}
                        onChange={() => toggleAllergen(all.id)}
                        className="rounded text-emerald-700 focus:ring-emerald-500"
                      />
                      <span className={intakeAllergens.includes(all.id) ? 'font-bold text-red-700' : 'text-neutral-700'}>
                        {all.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Donor info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Donateur</label>
                  <input
                    type="text"
                    required
                    value={intakeDonorName}
                    onChange={(e) => setIntakeDonorName(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Type Donateur</label>
                  <select
                    value={intakeDonorType}
                    onChange={(e) => setIntakeDonorType(e.target.value as ProductItem['donorType'])}
                    className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="Supermarkt">Supermarkt</option>
                    <option value="Groothandel">Groothandel</option>
                    <option value="Tuinder/Boer">Tuinder / Boer</option>
                    <option value="Fabrikant">Fabrikant</option>
                    <option value="Particulier">Particulier</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Batchnummer</label>
                  <input
                    type="text"
                    required
                    value={intakeBatch}
                    onChange={(e) => setIntakeBatch(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Bijzonderheden / Notities</label>
                <input
                  type="text"
                  placeholder="Bijv. gekoeld houden bij 4°C, speciale doos..."
                  value={intakeNotes}
                  onChange={(e) => setIntakeNotes(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="pt-4 border-t border-neutral-200 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowIntakeModal(false)}
                  className="flex-1 py-2.5 font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
                >
                  Opslaan & QR Label Genereren
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
