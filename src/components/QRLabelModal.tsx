import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ProductItem, Location } from '../types';
import { X, Printer, CheckCircle, ShieldAlert, Sparkles, MapPin, Calendar, Tag } from 'lucide-react';

interface QRLabelModalProps {
  product: ProductItem | null;
  locations: Location[];
  onClose: () => void;
}

export const QRLabelModal: React.FC<QRLabelModalProps> = ({ product, locations, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!product) return;
    const payload = JSON.stringify({
      code: product.code,
      name: product.name,
      exp: product.expirationDate,
      halal: product.halalStatus,
      batch: product.batchNumber,
    });

    QRCode.toDataURL(payload, {
      width: 240,
      margin: 1,
      color: {
        dark: '#171717',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR Gen error:', err));
  }, [product]);

  if (!product) return null;

  const loc = locations.find((l) => l.id === product.locationId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <div>
            <h3 className="text-base font-semibold text-neutral-900">Magazijn & Voedselbank QR-Label</h3>
            <p className="text-xs text-neutral-500 font-mono tabular-nums">{product.code} · Batch: {product.batchNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-800 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Label Printable Content */}
        <div className="p-6">
          <div className="border-2 border-dashed border-neutral-300 rounded-xl p-5 bg-white shadow-xs" id="printable-label">
            <div className="flex items-start justify-between border-b border-neutral-200 pb-4 mb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-800 font-bold block mb-1">
                  Voedselbank Puur Borg
                </span>
                <h4 className="text-lg font-bold text-neutral-900 leading-snug">{product.name}</h4>
                <p className="text-xs text-neutral-500 mt-0.5">{product.category}</p>
              </div>
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt={`QR code voor ${product.code}`}
                  className="w-24 h-24 border border-neutral-200 rounded p-1 bg-white shrink-0 ml-3"
                />
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                <span className="text-neutral-500 flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  {product.expirationType === 'TGT' ? 'Te Gebruiken Tot (TGT)' : 'Tenminste Houdbaar Tot (THT)'}
                </span>
                <span className="font-semibold text-neutral-900 font-mono text-sm block">
                  {product.expirationDate}
                </span>
              </div>

              <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                <span className="text-neutral-500 flex items-center gap-1 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  Locatie & Schap
                </span>
                <span className="font-semibold text-neutral-900 block truncate">
                  {loc?.name || product.locationId}
                </span>
                <span className="text-neutral-600 font-mono">{product.shelf}</span>
              </div>
            </div>

            {/* Halal & Allergen Badges */}
            <div className="space-y-2 mb-4 pt-1 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-600 font-medium">Halal Status:</span>
                {product.halalStatus === 'halal_gecertificeerd' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Gecertificeerd Halal
                  </span>
                ) : product.halalStatus === 'natuurlijk_halal' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50/60 px-2 py-0.5 rounded">
                    Natuurlijk Halal (Vega/Basis)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                    Niet Halal / Onbekend
                  </span>
                )}
              </div>

              {product.halalCertifier && (
                <p className="text-[11px] text-neutral-500 italic">
                  Certificeerder: {product.halalCertifier}
                </p>
              )}

              <div className="pt-1">
                <span className="text-xs text-neutral-600 font-medium block mb-1">Allergenen Informatie:</span>
                {product.allergens.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {product.allergens.map((all) => (
                      <span
                        key={all}
                        className="inline-flex items-center gap-1 text-[11px] font-medium bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded"
                      >
                        <ShieldAlert className="w-3 h-3 text-red-500" />
                        Bevat {all}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Geen bekende allergenen geregistreerd
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Meta */}
            <div className="text-[11px] text-neutral-500 flex items-center justify-between border-t border-neutral-100 pt-3">
              <span>Donateur: {product.donorName}</span>
              <span className="font-mono">Voorraad: {product.quantity} {product.unit}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 bg-neutral-50">
          <p className="text-xs text-neutral-500">
            Geschikt voor industriële Dymo / Zebra labelprinters & standaard A4.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              Sluiten
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              Label Afdrukken
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
