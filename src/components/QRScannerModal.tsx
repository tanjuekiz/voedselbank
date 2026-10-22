import React, { useState, useRef, useEffect } from 'react';
import { ProductItem, Location } from '../types';
import { X, Camera, QrCode, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, MapPin, Calendar, Plus, Minus, Search } from 'lucide-react';

interface QRScannerModalProps {
  products: ProductItem[];
  locations: Location[];
  onClose: () => void;
  onUpdateProduct: (id: string, updates: Partial<ProductItem>) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  products,
  locations,
  onClose,
  onUpdateProduct,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Play synthesized positive scanner beep
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // AudioContext fallback
    }
  };

  const handleSelectCode = (code: string) => {
    const found = products.find((p) => p.code.toLowerCase() === code.trim().toLowerCase());
    if (found) {
      setSelectedProduct(found);
      playBeep();
      setActionFeedback(`Product gevonden: ${found.name}`);
      setTimeout(() => setActionFeedback(null), 3000);
    } else {
      setActionFeedback(`Geen product gevonden met code ${code}`);
      setTimeout(() => setActionFeedback(null), 3000);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Cameratoegang wordt niet ondersteund in deze browseromgeving.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Onbekende fout';
      setCameraError(`Camera kon niet geopend worden (${errorMessage}). Gebruik de snelle simulator hieronder.`);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleAdjustQuantity = (delta: number) => {
    if (!selectedProduct) return;
    const newQty = Math.max(0, selectedProduct.quantity + delta);
    onUpdateProduct(selectedProduct.id, { quantity: newQty });
    setSelectedProduct({ ...selectedProduct, quantity: newQty });
    playBeep();
    setActionFeedback(`Voorraad aangepast naar ${newQty} ${selectedProduct.unit}`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleRelocate = (newLocationId: string) => {
    if (!selectedProduct) return;
    onUpdateProduct(selectedProduct.id, { locationId: newLocationId });
    setSelectedProduct({ ...selectedProduct, locationId: newLocationId });
    playBeep();
    const locName = locations.find((l) => l.id === newLocationId)?.name || newLocationId;
    setActionFeedback(`Product verplaatst naar ${locName}`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  // Expiration calculation helper
  const getDaysUntilExpiration = (dateStr: string) => {
    const today = new Date('2026-10-22');
    const exp = new Date(dateStr);
    const diffTime = exp.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900">Magazijn QR & Barcode Scanner</h3>
              <p className="text-xs text-neutral-500">Snelle voorraadcontrole en logistieke verwerking (Offline-ready)</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-neutral-500 hover:text-neutral-800 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {actionFeedback && (
            <div className="p-3 bg-emerald-50 text-emerald-900 text-xs font-medium rounded-lg border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {actionFeedback}
            </div>
          )}

          {/* Camera Viewport or Manual Toggle */}
          <div className="bg-neutral-900 rounded-xl overflow-hidden relative flex flex-col items-center justify-center min-h-[220px] text-white p-4">
            {cameraActive ? (
              <div className="relative w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                {/* Scanner Target Box */}
                <div className="absolute inset-8 border-2 border-emerald-400 rounded-lg pointer-events-none opacity-80 animate-pulse flex items-center justify-center">
                  <span className="text-[11px] bg-neutral-900/80 px-2 py-0.5 rounded text-emerald-300">
                    Richt op QR-code
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 px-2 max-w-md">
                <Camera className="w-10 h-10 text-neutral-400 mx-auto mb-2" />
                <h4 className="text-sm font-semibold">Webcam / Handheld Scanner</h4>
                <p className="text-xs text-neutral-400 mt-1 mb-3">
                  Scan fysieke labels met je apparaatcamera of kies hieronder direct een geregistreerd product.
                </p>
                <button
                  onClick={startCamera}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Camera Activeren
                </button>
              </div>
            )}

            {cameraActive && (
              <button
                onClick={stopCamera}
                className="mt-3 px-3 py-1 text-xs text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-md"
              >
                Camera Uitschakelen
              </button>
            )}

            {cameraError && (
              <div className="absolute bottom-2 left-2 right-2 p-2 bg-amber-950/90 text-amber-200 text-xs rounded border border-amber-800">
                {cameraError}
              </div>
            )}
          </div>

          {/* Quick Barcode / QR Simulation Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-700">
                Snel scannen of typ code:
              </label>
              <span className="text-[11px] text-neutral-400">Klik op een tag om direct te simuleren</span>
            </div>
            
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Bijv. VB-2026-001 of scan..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSelectCode(manualCode);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
              <button
                onClick={() => handleSelectCode(manualCode)}
                className="px-3 py-2 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 transition-colors"
              >
                Scannen
              </button>
            </div>

            {/* Quick Demo Tags */}
            <div className="flex flex-wrap gap-1.5">
              {products.slice(0, 6).map((prod) => (
                <button
                  key={prod.id}
                  onClick={() => handleSelectCode(prod.code)}
                  className="text-xs font-mono px-2.5 py-1 bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-neutral-200 rounded-md transition-colors text-left"
                >
                  <span className="font-semibold">{prod.code}</span> · {prod.name.slice(0, 22)}...
                </button>
              ))}
            </div>
          </div>

          {/* Scanned Product Details & Realtime Actions */}
          {selectedProduct ? (
            <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-50 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-neutral-700 bg-white px-2 py-0.5 rounded border border-neutral-200">
                      {selectedProduct.code}
                    </span>
                    <span className="text-xs text-neutral-500">{selectedProduct.category}</span>
                  </div>
                  <h4 className="text-base font-bold text-neutral-900 mt-1">{selectedProduct.name}</h4>
                  <p className="text-xs text-neutral-500">
                    Donateur: {selectedProduct.donorName} ({selectedProduct.donorType})
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-neutral-500 block">Huidige Voorraad</span>
                  <span className="text-xl font-bold text-neutral-900 font-mono tabular-nums">
                    {selectedProduct.quantity} {selectedProduct.unit}
                  </span>
                </div>
              </div>

              {/* Halal & Allergen Status */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-200 text-xs">
                {selectedProduct.halalStatus === 'halal_gecertificeerd' && (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Gecertificeerd Halal ({selectedProduct.halalCertifier})
                  </span>
                )}
                {selectedProduct.halalStatus === 'natuurlijk_halal' && (
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                    Natuurlijk Halal
                  </span>
                )}
                {selectedProduct.halalStatus === 'niet_halal' && (
                  <span className="text-amber-800 bg-amber-100 px-2 py-1 rounded">
                    Niet Halal
                  </span>
                )}

                {selectedProduct.allergens.length > 0 ? (
                  <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded">
                    Allergenen: {selectedProduct.allergens.join(', ')}
                  </span>
                ) : (
                  <span className="text-emerald-700 bg-white border border-neutral-200 px-2 py-1 rounded">
                    Vrij van hoofdallergenen
                  </span>
                )}
              </div>

              {/* Expiration Tracking */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 bg-white rounded-lg border border-neutral-200">
                  <span className="text-neutral-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedProduct.expirationType} Vervaldatum
                  </span>
                  <span className="font-semibold text-neutral-900 font-mono block mt-0.5">
                    {selectedProduct.expirationDate}
                  </span>
                  {(() => {
                    const days = getDaysUntilExpiration(selectedProduct.expirationDate);
                    if (days <= 0) {
                      return <span className="text-[11px] font-bold text-red-600">Verlopen! Afboeken</span>;
                    }
                    if (days <= 3) {
                      return <span className="text-[11px] font-bold text-amber-700">Urgent: Nog {days} dagen houdbaar</span>;
                    }
                    return <span className="text-[11px] text-neutral-500">Nog {days} dagen houdbaar</span>;
                  })()}
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-neutral-200">
                  <span className="text-neutral-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Opslaglocatie & Schap
                  </span>
                  <span className="font-semibold text-neutral-900 block truncate mt-0.5">
                    {locations.find((l) => l.id === selectedProduct.locationId)?.name || selectedProduct.locationId}
                  </span>
                  <span className="text-neutral-500 font-mono">{selectedProduct.shelf}</span>
                </div>
              </div>

              {/* Quick Actions in Scanner */}
              <div className="pt-2 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAdjustQuantity(-1)}
                    disabled={selectedProduct.quantity <= 0}
                    className="p-1.5 bg-white border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100 disabled:opacity-40"
                    title="1 eenheid afboeken (pakket/uitgifte)"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold px-2">Aanpassen</span>
                  <button
                    onClick={() => handleAdjustQuantity(1)}
                    className="p-1.5 bg-white border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-100"
                    title="1 eenheid toevoegen (inboeken)"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Location Transfer */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-neutral-500">Verplaats naar:</span>
                  <select
                    value={selectedProduct.locationId}
                    onChange={(e) => handleRelocate(e.target.value)}
                    className="text-xs py-1 px-2 border border-neutral-300 rounded-lg bg-white"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-neutral-200 rounded-xl text-neutral-400 text-xs">
              Nog geen product gescand. Gebruik de camera of selecteer een code hierboven om realtime gegevens te bekijken en bewerken.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex justify-end">
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};
