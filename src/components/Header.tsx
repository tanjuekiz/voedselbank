import React from 'react';
import { UserRole } from '../types';
import {
  Bell,
  QrCode,
  WifiOff,
  Home,
  Users,
  Package,
  BarChart3,
  ShieldCheck,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenScanner: () => void;
  isOfflineMode: boolean;
}

const PORTAL_ITEMS: {
  id: UserRole;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  tag?: string;
}[] = [
  { id: 'public', label: 'Homepage & Uitleg', shortLabel: 'Home', icon: Home },
  { id: 'vrijwilliger', label: 'Vrijwilligers', shortLabel: 'Vrijwilligers', icon: Users, tag: 'Rooster' },
  { id: 'medewerker', label: 'Medewerkers', shortLabel: 'Medewerkers', icon: Package, tag: 'Voorraad' },
  { id: 'beheerder', label: 'Beheerder', shortLabel: 'Beheer', icon: BarChart3 },
  { id: 'inspecteur', label: 'Inspecteurs', shortLabel: 'Inspecteur', icon: ShieldCheck, tag: 'Anoniem' },
  { id: 'chat', label: 'Team Chat', shortLabel: 'Chat', icon: MessageSquare },
];

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenScanner,
  isOfflineMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Row */}
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Brand Wordmark: Voedselbank Puur Borg */}
          <button
            onClick={() => onSelectRole('public')}
            className="flex items-center gap-3 text-left group shrink-0"
            title="Naar Voedselbank Puur Borg Homepage"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-2xs group-hover:bg-emerald-800 transition-colors">
              <span className="font-bold text-sm tracking-tighter">PB</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-neutral-900 group-hover:text-emerald-800 transition-colors">
                  Voedselbank Puur Borg
                </span>
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-600" />
              </div>
              <p className="text-[11px] text-neutral-500 font-medium tracking-wide">
                Puur Voedsel · Geborgde Zorg · 100% Halal Borging
              </p>
            </div>
          </button>

          {/* Desktop Alles-in-één Portaal Navigatiebalk */}
          <nav className="hidden lg:flex items-center p-1 bg-neutral-100 rounded-xl border border-neutral-200/80 shadow-2xs">
            {PORTAL_ITEMS.map((portal) => {
              const Icon = portal.icon;
              const isActive = currentRole === portal.id;
              return (
                <button
                  key={portal.id}
                  onClick={() => onSelectRole(portal.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                  <span>{portal.shortLabel}</span>
                  {portal.tag && !isActive && (
                    <span className="text-[9px] uppercase tracking-wider px-1 py-0.2 rounded bg-neutral-200 text-neutral-700 font-mono">
                      {portal.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Offline indicator */}
            <div
              title="Draait op lokale server configuratie zonder externe poorten"
              className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-lg border border-neutral-200"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span className="font-mono">Puur Borg Lokaal</span>
              {isOfflineMode && <WifiOff className="w-3 h-3 text-amber-600 ml-0.5" />}
            </div>

            {/* Quick QR Scanner */}
            <button
              onClick={onOpenScanner}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg border border-neutral-200 transition-colors whitespace-nowrap"
              title="Scan QR-codes voor directe voorraadcontrole"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">QR Scan</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
              title="Meldingen en spoedleveringen"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Alles-in-één Portaalbalk (Zichtbaar op Tablet & Mobiel en als compacte secondary strip) */}
        <div className="lg:hidden py-2 border-t border-neutral-100 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            {PORTAL_ITEMS.map((portal) => {
              const Icon = portal.icon;
              const isActive = currentRole === portal.id;
              return (
                <button
                  key={portal.id}
                  onClick={() => onSelectRole(portal.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-emerald-700 text-white font-semibold shadow-2xs'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{portal.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
