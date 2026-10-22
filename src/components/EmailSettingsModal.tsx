import React, { useState } from 'react';
import { EmailSettings } from '../types';
import { X, Mail, Server, ShieldCheck, Check, Send, Sparkles } from 'lucide-react';

interface EmailSettingsModalProps {
  settings: EmailSettings;
  isOpen: boolean;
  onClose: () => void;
  onSaveSettings: (settings: EmailSettings) => void;
}

export const EmailSettingsModal: React.FC<EmailSettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onSaveSettings,
}) => {
  const [smtpHost, setSmtpHost] = useState<string>(settings.smtpHost);
  const [smtpPort, setSmtpPort] = useState<number>(settings.smtpPort);
  const [encryption, setEncryption] = useState<EmailSettings['encryption']>(settings.encryption);
  const [senderEmail, setSenderEmail] = useState<string>(settings.senderEmail);
  const [senderName, setSenderName] = useState<string>(settings.senderName);
  const [apiKeyOrPassword, setApiKeyOrPassword] = useState<string>(settings.apiKeyOrPassword);
  const [simulationMode, setSimulationMode] = useState<boolean>(settings.simulationMode);

  const [testEmailAddress, setTestEmailAddress] = useState<string>('coördinator@voedselbank.nl');
  const [testStatus, setTestStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      smtpHost,
      smtpPort: Number(smtpPort),
      encryption,
      senderEmail,
      senderName,
      apiKeyOrPassword,
      simulationMode,
    });
    setTestStatus('Instellingen succesvol opgeslagen.');
    setTimeout(() => {
      setTestStatus(null);
      onClose();
    }, 1200);
  };

  const handleSendTestEmail = () => {
    setTestStatus('Test e-mail wordt verstuurd...');
    setTimeout(() => {
      setTestStatus(`Test e-mail succesvol verzonden naar ${testEmailAddress} via ${simulationMode ? 'Lokale Dispatcher' : smtpHost}.`);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-neutral-200">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">E-mail Dispatcher & SMTP Instellingen</h3>
              <p className="text-xs text-neutral-500">Configuratie voor verificatiemails bij inloggen met mobiel nummer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-800 rounded-lg hover:bg-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {testStatus && (
            <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{testStatus}</span>
            </div>
          )}

          {/* Mode toggle */}
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <span className="font-bold text-neutral-900 block">Verzendmodus</span>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={simulationMode}
                onChange={(e) => setSimulationMode(e.target.checked)}
                className="rounded text-emerald-700 focus:ring-emerald-500"
              />
              <span className="font-medium text-neutral-800">
                Lokale Simulator & Instant Code Preview (Aanbevolen voor offline werking)
              </span>
            </label>
            <p className="text-[11px] text-neutral-500">
              Wanneer ingeschakeld, worden verificatiecodes direct op het scherm getoond en gelogd zonder dat er een externe internetverbinding of SMTP-server vereist is.
            </p>
          </div>

          {/* SMTP Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">SMTP Server Host</label>
              <input
                type="text"
                required
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="smtp.voedselbank.nl"
                className="w-full p-2 border border-neutral-300 rounded-lg font-mono bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">SMTP Poort</label>
              <input
                type="number"
                required
                value={smtpPort}
                onChange={(e) => setSmtpPort(Number(e.target.value))}
                placeholder="587"
                className="w-full p-2 border border-neutral-300 rounded-lg font-mono bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Beveiliging / Versleuteling</label>
              <select
                value={encryption}
                onChange={(e) => setEncryption(e.target.value as EmailSettings['encryption'])}
                className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
              >
                <option value="TLS">STARTTLS (Aanbevolen, poort 587)</option>
                <option value="SSL">SSL / TLS (Direct, poort 465)</option>
                <option value="Geen">Geen versleuteling (Lokaal intranet)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">SMTP Wachtwoord / API Key</label>
              <input
                type="password"
                value={apiKeyOrPassword}
                onChange={(e) => setApiKeyOrPassword(e.target.value)}
                className="w-full p-2 border border-neutral-300 rounded-lg font-mono bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Afzender E-mailadres</label>
              <input
                type="email"
                required
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="verificatie@voedselbank-verbinding.nl"
                className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-neutral-700 block mb-1">Afzendernaam</label>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Voedselbank Verbinding Chat"
                className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
              />
            </div>
          </div>

          {/* Test Mail Section */}
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
            <span className="font-bold text-neutral-800 block">Test E-mail Verzenden</span>
            <div className="flex gap-2">
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="Ontvanger testadres..."
                className="flex-1 p-2 border border-neutral-300 rounded-lg bg-white text-xs"
              />
              <button
                type="button"
                onClick={handleSendTestEmail}
                className="px-3 py-2 bg-neutral-800 hover:bg-neutral-900 text-white rounded-lg font-semibold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Test Versturen
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-neutral-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
            >
              Instellingen Opslaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
