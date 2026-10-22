import { DonationRecord, ProductItem } from '../types';

export const ExportService = {
  exportDonationsToCSV(donations: DonationRecord[], monthName: string = 'oktober_2026'): void {
    const headers = [
      'Donatie ID',
      'Donateur Naam',
      'Donateur Type',
      'Datum',
      'Aantal Items',
      'Gewicht (kg)',
      'Geschatte Waarde (EUR)',
      'CO2 Besparing (kg)',
      'Halal Items Aantal',
      'Ontvangen Door',
      'Locatie ID',
    ];

    const rows = donations.map((d) => [
      `"${d.id}"`,
      `"${d.donorName.replace(/"/g, '""')}"`,
      `"${d.donorType}"`,
      `"${d.date}"`,
      d.itemsCount,
      d.totalWeightKg,
      d.estimatedValueEur,
      d.co2SavedKg,
      d.halalItemsCount,
      `"${d.receivedBy.replace(/"/g, '""')}"`,
      `"${d.locationId}"`,
    ]);

    const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    downloadFile(csvContent, `voedselbank_maandrapportage_donaties_${monthName}.csv`, 'text/csv;charset=utf-8;');
  },

  exportInventoryToCSV(products: ProductItem[]): void {
    const headers = [
      'Code',
      'Productnaam',
      'Categorie',
      'Aantal',
      'Eenheid',
      'Locatie ID',
      'Schaplocatie',
      'Vervaldatum',
      'Type (THT/TGT)',
      'Halal Status',
      'Halal Certificeerder',
      'Allergenen',
      'Donateur',
      'Batchnummer',
      'Status',
      'Gewicht (kg)',
    ];

    const rows = products.map((p) => [
      `"${p.code}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.quantity,
      `"${p.unit}"`,
      `"${p.locationId}"`,
      `"${p.shelf}"`,
      `"${p.expirationDate}"`,
      `"${p.expirationType}"`,
      `"${p.halalStatus}"`,
      `"${p.halalCertifier || ''}"`,
      `"${p.allergens.join(', ')}"`,
      `"${p.donorName.replace(/"/g, '""')}"`,
      `"${p.batchNumber}"`,
      `"${p.status}"`,
      p.weightKg,
    ]);

    const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
    downloadFile(csvContent, `voedselbank_actuele_voorraad_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
  },

  exportJSON(data: unknown, filename: string): void {
    const jsonStr = JSON.stringify(data, null, 2);
    downloadFile(jsonStr, filename, 'application/json');
  },
};

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
