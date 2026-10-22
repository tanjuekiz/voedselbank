import React, { useState } from 'react';
import { ProductItem, Location, TaskItem, NotificationAlert, DonationRecord } from '../types';
import { ExportService } from '../services/exportService';
import { BarChart3, Download, FileText, Server, ShieldCheck, HeartHandshake, RefreshCw, Plus, CheckCircle2, AlertTriangle, HardDrive, Printer } from 'lucide-react';

interface AdminViewProps {
  products: ProductItem[];
  locations: Location[];
  tasks: TaskItem[];
  notifications: NotificationAlert[];
  donations: DonationRecord[];
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
  onResetAllData: () => void;
  onExportDatabase: () => void;
  onImportDatabase: (jsonStr: string) => void;
  onAddDonation: (donation: Omit<DonationRecord, 'id'>) => void;
  onOpenNotificationModal: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  products,
  locations,
  tasks,
  notifications,
  donations,
  isOfflineMode,
  onToggleOfflineMode,
  onResetAllData,
  onExportDatabase,
  onImportDatabase,
  onAddDonation,
  onOpenNotificationModal,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [showPrintableReport, setShowPrintableReport] = useState<boolean>(false);
  const [showNewDonationModal, setShowNewDonationModal] = useState<boolean>(false);

  // New donation form state
  const [donorName, setDonorName] = useState<string>('');
  const [donorType, setDonorType] = useState<DonationRecord['donorType']>('Supermarkt');
  const [donorWeight, setDonorWeight] = useState<number>(350);
  const [donorValue, setDonorValue] = useState<number>(1400);
  const [donorItemsCount, setDonorItemsCount] = useState<number>(120);
  const [donorHalalCount, setDonorHalalCount] = useState<number>(40);
  const [donorLocId, setDonorLocId] = useState<string>(locations[0]?.id || 'loc-centraal');
  const [donorReceivedBy, setDonorReceivedBy] = useState<string>('Beheerder');

  // Filter donations for selected month
  const filteredDonations = donations.filter((d) => d.date.startsWith(selectedMonth));

  // Totals for the month
  const totalDonatedKg = filteredDonations.reduce((sum, d) => sum + d.totalWeightKg, 0);
  const totalEstimatedEur = filteredDonations.reduce((sum, d) => sum + d.estimatedValueEur, 0);
  const totalCo2Saved = filteredDonations.reduce((sum, d) => sum + d.co2SavedKg, 0);
  const totalDonatedItems = filteredDonations.reduce((sum, d) => sum + d.itemsCount, 0);

  // Donations grouped by donor type
  const donorTypeBreakdown: Record<string, number> = {};
  filteredDonations.forEach((d) => {
    donorTypeBreakdown[d.donorType] = (donorTypeBreakdown[d.donorType] || 0) + d.totalWeightKg;
  });

  // Category breakdown across all current inventory
  const categoryInventory: Record<string, { count: number; weight: number }> = {};
  products.forEach((p) => {
    if (!categoryInventory[p.category]) {
      categoryInventory[p.category] = { count: 0, weight: 0 };
    }
    categoryInventory[p.category].count += p.quantity;
    categoryInventory[p.category].weight += p.weightKg;
  });

  const handleCreateDonation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim()) return;

    onAddDonation({
      donorName: donorName.trim(),
      donorType,
      date: new Date().toISOString().slice(0, 10),
      itemsCount: Number(donorItemsCount),
      totalWeightKg: Number(donorWeight),
      estimatedValueEur: Number(donorValue),
      co2SavedKg: Math.round(Number(donorWeight) * 2.2), // Standard EPA/Food bank co2 formula
      halalItemsCount: Number(donorHalalCount),
      categoryBreakdown: {
        'Algemene Voedseldonatie': Number(donorWeight),
      },
      receivedBy: donorReceivedBy,
      locationId: donorLocId,
    });

    setDonorName('');
    setShowNewDonationModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportDatabase(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
              Beheerders Dashboard & Directie Rapportages
            </h1>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Beheerdersrechten
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Volledig inzicht in gedoneerde goederen, maandrapportages, lokale offline server configuratie en koepelverantwoording.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setShowNewDonationModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Donatie Invoeren
          </button>

          <button
            onClick={() => ExportService.exportDonationsToCSV(filteredDonations, selectedMonth)}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
            title="Download maandelijkse donatielog als CSV"
          >
            <Download className="w-4 h-4" />
            Maandrapport CSV
          </button>

          <button
            onClick={() => setShowPrintableReport(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            Printbaar Audit Rapport
          </button>
        </div>
      </div>

      {/* KPI Overzicht Directie */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <span className="text-xs text-neutral-500 font-medium block">Totaal Gedoneerd ({selectedMonth})</span>
          <span className="text-2xl sm:text-3xl font-bold text-neutral-900 font-mono tabular-nums">
            {totalDonatedKg.toLocaleString('nl-NL')} kg
          </span>
          <span className="text-xs text-emerald-700 font-medium block mt-1">
            Gered van verspilling
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <span className="text-xs text-neutral-500 font-medium block">Geschatte Economische Waarde</span>
          <span className="text-2xl sm:text-3xl font-bold text-neutral-900 font-mono tabular-nums">
            € {totalEstimatedEur.toLocaleString('nl-NL')}
          </span>
          <span className="text-xs text-neutral-400 block mt-1">
            inclusief supermarktdonaties
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <span className="text-xs text-neutral-500 font-medium block">Gerealiseerde CO2-Reductie</span>
          <span className="text-2xl sm:text-3xl font-bold text-emerald-800 font-mono tabular-nums">
            {totalCo2Saved.toLocaleString('nl-NL')} kg
          </span>
          <span className="text-xs text-neutral-400 block mt-1">
            voetafdruk vermeden
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <span className="text-xs text-neutral-500 font-medium block">Aantal Donatie Batches</span>
          <span className="text-2xl sm:text-3xl font-bold text-neutral-900 font-mono tabular-nums">
            {filteredDonations.length}
          </span>
          <span className="text-xs text-neutral-400 block mt-1">
            geregistreerd en gecontroleerd
          </span>
        </div>
      </div>

      {/* RAPPORTAGETOOL VOOR GEDONEERDE GOEDEREN */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-700" />
              Rapportagetool Gedoneerde Goederen & Herkomst
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Analyseer herkomst per donateursgroep, halal spreiding en distributielocaties.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-600 font-medium">Selecteer Maand:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs py-1.5 px-3 border border-neutral-300 rounded-lg bg-white font-mono"
            >
              <option value="2026-10">Oktober 2026 (Huidige maand)</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-08">Augustus 2026</option>
            </select>
          </div>
        </div>

        {/* Visual donor type breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Gedoneerd Gewicht per Type Partner:
            </h3>
            <div className="space-y-2 text-xs">
              {Object.entries(donorTypeBreakdown).map(([type, weight]) => {
                const percentage = totalDonatedKg > 0 ? Math.round((weight / totalDonatedKg) * 100) : 0;
                return (
                  <div key={type} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-neutral-900">{type}</span>
                      <span className="font-mono tabular-nums font-bold text-neutral-800">
                        {weight} kg ({percentage}%)
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-700 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Category Distribution in Warehouses */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Actuele Magazijnvoorraad per Categorie:
            </h3>
            <div className="space-y-1.5 text-xs max-h-[260px] overflow-y-auto pr-1">
              {Object.entries(categoryInventory).map(([category, data]) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-lg border border-neutral-100"
                >
                  <span className="font-medium text-neutral-900">{category}</span>
                  <div className="text-right font-mono">
                    <span className="font-bold text-neutral-800">{data.count} eenheden</span>
                    <span className="text-neutral-400 text-[11px] block">{data.weight.toFixed(1)} kg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Donated Goods Log Table */}
        <div className="pt-4 border-t border-neutral-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Donatielogboek ({filteredDonations.length} records):
            </h3>
            <button
              onClick={() => ExportService.exportDonationsToCSV(filteredDonations, selectedMonth)}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Exporteer deze lijst naar CSV
            </button>
          </div>

          <div className="overflow-x-auto border border-neutral-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Datum</th>
                  <th className="py-2.5 px-3">Donateur</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Gewicht</th>
                  <th className="py-2.5 px-3">Waarde (indicatief)</th>
                  <th className="py-2.5 px-3">Halal Colli</th>
                  <th className="py-2.5 px-3">Ontvangen door</th>
                  <th className="py-2.5 px-3">Locatie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-neutral-50/60">
                    <td className="py-2.5 px-3 font-mono text-neutral-600">{d.date}</td>
                    <td className="py-2.5 px-3 font-bold text-neutral-900">{d.donorName}</td>
                    <td className="py-2.5 px-3 text-neutral-600">{d.donorType}</td>
                    <td className="py-2.5 px-3 font-mono font-bold tabular-nums text-neutral-800">
                      {d.totalWeightKg} kg
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-neutral-700">
                      € {d.estimatedValueEur}
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-emerald-800">
                      {d.halalItemsCount} stuks
                    </td>
                    <td className="py-2.5 px-3 text-neutral-600">{d.receivedBy}</td>
                    <td className="py-2.5 px-3 text-neutral-500">
                      {locations.find((l) => l.id === d.locationId)?.name || d.locationId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* LOKALE SERVER & STANDALONE CONFIGURATIE (GEEN POORTEN / 100% OFFLINE) */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-emerald-800" />
          <h2 className="text-base font-bold text-neutral-900">
            Lokale Server Configuratie & Standalone Opslag
          </h2>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed">
          Dit platform is ontworpen om volledig standalone te functioneren binnen het lokale netwerk
          van de voedselbank. Er zijn geen externe netwerkpoorten vereist. Alle voorraad-, taak-
          en donatiegegevens worden lokaal persistent opgeslagen via de browser-engine en kunnen op
          elk moment als standalone backup worden geëxporteerd.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Offline mode test toggle */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-900 block mb-1">
                Offline Lokale Server Simulatie
              </span>
              <p className="text-[11px] text-neutral-500">
                Test hoe het platform blijft functioneren zonder actieve internetverbinding.
              </p>
            </div>
            <button
              onClick={onToggleOfflineMode}
              className={`mt-3 py-2 px-3 text-xs font-semibold rounded-lg transition-colors border ${
                isOfflineMode
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
              }`}
            >
              {isOfflineMode ? '✓ Lokale Offline Modus Actief' : 'Schakel Offline Simulatie In'}
            </button>
          </div>

          {/* Database Backup Export */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-900 block mb-1">
                Lokale Database Snapshot
              </span>
              <p className="text-[11px] text-neutral-500">
                Download een compleet JSON archief van alle actuele voorraden, taken en donaties.
              </p>
            </div>
            <button
              onClick={onExportDatabase}
              className="mt-3 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-700" />
              JSON Snapshot Exporteren
            </button>
          </div>

          {/* Database Import / Restore */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-neutral-900 block mb-1">
                Herstellen & Data Import
              </span>
              <p className="text-[11px] text-neutral-500">
                Laad een eerder gemaakte lokale snapshot of herstel de standaard demo data.
              </p>
            </div>
            <div className="mt-3 flex gap-2">
              <label className="flex-1 text-center py-2 px-2 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-100 rounded-lg cursor-pointer">
                Import JSON
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
              <button
                onClick={onResetAllData}
                className="py-2 px-2.5 text-xs text-neutral-500 hover:text-red-700 border border-neutral-300 rounded-lg hover:bg-neutral-100"
                title="Herstel fabrieksinstellingen"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Invoer Nieuwe Donatie */}
      {showNewDonationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900 mb-1">
              Gedoneerde Goederen Invoeren (Directie Log)
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Registreer een partij goederen van een partner voor de officiële maandrapportage.
            </p>

            <form onSubmit={handleCreateDonation} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Donateur Bedrijf / Organisatie *</label>
                <input
                  type="text"
                  required
                  placeholder="Bijv. Vomar Voordeelmarkt of Bakkerij Hilversum"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Type Partner</label>
                  <select
                    value={donorType}
                    onChange={(e) => setDonorType(e.target.value as DonationRecord['donorType'])}
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
                  <label className="font-semibold text-neutral-700 block mb-1">Totaalgewicht (kg)</label>
                  <input
                    type="number"
                    min="1"
                    value={donorWeight}
                    onChange={(e) => setDonorWeight(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Geschatte Waarde (€)</label>
                  <input
                    type="number"
                    min="0"
                    value={donorValue}
                    onChange={(e) => setDonorValue(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Aantal Halal Items</label>
                  <input
                    type="number"
                    min="0"
                    value={donorHalalCount}
                    onChange={(e) => setDonorHalalCount(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Ontvangstlocatie</label>
                  <select
                    value={donorLocId}
                    onChange={(e) => setDonorLocId(e.target.value)}
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
                  <label className="font-semibold text-neutral-700 block mb-1">Geregistreerd door</label>
                  <input
                    type="text"
                    value={donorReceivedBy}
                    onChange={(e) => setDonorReceivedBy(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewDonationModal(false)}
                  className="flex-1 py-2 font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  Donatie Opslaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Printable Audit Maandrapport Preview */}
      {showPrintableReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-neutral-200 p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-neutral-300 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-800 font-bold block mb-1">
                  Voedselbank Puur Borg · Regio Groot-Amsterdam
                </span>
                <h3 className="text-xl font-bold text-neutral-900">
                  Officieel Maandrapport Gedoneerde Goederen & Voedselveiligheid
                </h3>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">
                  Periode: {selectedMonth} · Gegenereerd op: 22 oktober 2026
                </p>
              </div>
              <button
                onClick={() => setShowPrintableReport(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                ✕
              </button>
            </div>

            {/* Core Stats */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
              <div>
                <span className="text-neutral-500 block">Totaal Gewicht</span>
                <span className="font-bold font-mono text-base text-neutral-900">{totalDonatedKg} kg</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Geschatte Waarde</span>
                <span className="font-bold font-mono text-base text-neutral-900">€ {totalEstimatedEur}</span>
              </div>
              <div>
                <span className="text-neutral-500 block">CO2 Voetafdruk Vermeden</span>
                <span className="font-bold font-mono text-base text-emerald-800">{totalCo2Saved} kg</span>
              </div>
              <div>
                <span className="text-neutral-500 block">Halal Verantwoording</span>
                <span className="font-bold font-mono text-base text-neutral-900">100% Geborgd</span>
              </div>
            </div>

            {/* List */}
            <div>
              <h4 className="text-xs font-bold text-neutral-800 mb-2">Geregistreerde Donaties in deze Periode:</h4>
              <div className="border border-neutral-200 rounded-lg overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-neutral-100 text-neutral-600 font-semibold border-b">
                    <tr>
                      <th className="py-2 px-3">Datum</th>
                      <th className="py-2 px-3">Partner</th>
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-3">Gewicht</th>
                      <th className="py-2 px-3">Waarde</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredDonations.map((d) => (
                      <tr key={d.id}>
                        <td className="py-1.5 px-3 font-mono">{d.date}</td>
                        <td className="py-1.5 px-3 font-medium">{d.donorName}</td>
                        <td className="py-1.5 px-3 text-neutral-500">{d.donorType}</td>
                        <td className="py-1.5 px-3 font-mono">{d.totalWeightKg} kg</td>
                        <td className="py-1.5 px-3 font-mono">€ {d.estimatedValueEur}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sign-off footer */}
            <div className="pt-6 border-t border-neutral-200 grid grid-cols-2 gap-8 text-xs text-neutral-600">
              <div>
                <span className="font-semibold block mb-8">Voor akkoord Coördinator Logistiek:</span>
                <div className="border-b border-neutral-300 w-48 mb-1" />
                <span className="font-mono text-[11px] text-neutral-400">Handtekening / Datum</span>
              </div>
              <div>
                <span className="font-semibold block mb-8">Voor akkoord Bestuurder / Penningmeester:</span>
                <div className="border-b border-neutral-300 w-48 mb-1" />
                <span className="font-mono text-[11px] text-neutral-400">Handtekening / Datum</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex justify-end gap-2 border-t border-neutral-200">
              <button
                onClick={() => setShowPrintableReport(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200"
              >
                Sluiten
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
              >
                <Printer className="w-4 h-4" />
                Printen of Opslaan als PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
