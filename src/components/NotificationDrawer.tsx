import React, { useState } from 'react';
import { NotificationAlert } from '../types';
import { X, Bell, AlertTriangle, Truck, Clock, Check, Plus, ShieldAlert, Info } from 'lucide-react';

interface NotificationDrawerProps {
  notifications: NotificationAlert[];
  isOpen: boolean;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onAddNotification: (notification: Omit<NotificationAlert, 'id' | 'timestamp' | 'read'>) => void;
  canBroadcast: boolean;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onAddNotification,
  canBroadcast,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newMessage, setNewMessage] = useState<string>('');
  const [newType, setNewType] = useState<NotificationAlert['type']>('spoedlevering');
  const [newPriority, setNewPriority] = useState<NotificationAlert['priority']>('urgent');
  const [newActionRequired, setNewActionRequired] = useState<string>('');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'urgent') return n.priority === 'urgent';
    return true;
  });

  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    onAddNotification({
      title: newTitle,
      message: newMessage,
      type: newType,
      priority: newPriority,
      actionRequired: newActionRequired.trim() ? newActionRequired : undefined,
    });

    setNewTitle('');
    setNewMessage('');
    setNewActionRequired('');
    setShowBroadcastModal(false);
  };

  const getIcon = (type: NotificationAlert['type']) => {
    switch (type) {
      case 'spoedlevering':
        return <Truck className="w-4 h-4 text-emerald-700" />;
      case 'vervaldatum_alert':
        return <Clock className="w-4 h-4 text-amber-700" />;
      case 'voorraadtekort':
        return <AlertTriangle className="w-4 h-4 text-red-700" />;
      default:
        return <Info className="w-4 h-4 text-blue-700" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-neutral-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-neutral-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-neutral-900 text-base">Notificaties & Spoedleveringen</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-800 rounded-lg hover:bg-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Actions Bar */}
        <div className="p-3 border-b border-neutral-200 bg-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Alle ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'unread' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Ongelezen ({notifications.filter((n) => !n.read).length})
            </button>
            <button
              onClick={() => setFilter('urgent')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filter === 'urgent' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Spoed
            </button>
          </div>

          <button
            onClick={onMarkAllRead}
            className="text-xs text-neutral-500 hover:text-neutral-800 whitespace-nowrap"
          >
            Alles gelezen
          </button>
        </div>

        {/* Broadcast Trigger for Staff / Admin */}
        {canBroadcast && (
          <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
            <span className="text-xs text-emerald-900 font-medium">Nieuwe spoedlevering binnengekomen?</span>
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Notificatie Uitzenden
            </button>
          </div>
        )}

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 text-xs">
              Geen notificaties gevonden in deze selectie.
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => onMarkRead(n.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  !n.read
                    ? 'bg-neutral-50 border-neutral-300 shadow-xs ring-1 ring-emerald-500/20'
                    : 'bg-white border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-neutral-100 shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-xs font-bold text-neutral-900 leading-snug truncate">
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-neutral-400 whitespace-nowrap font-mono">
                        {n.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      {n.message}
                    </p>

                    {n.actionRequired && (
                      <div className="mt-2 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200/60">
                        Actie: {n.actionRequired}
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-2 pt-1 text-[11px] text-neutral-500 border-t border-neutral-100">
                      <span className="capitalize">{n.type.replace('_', ' ')}</span>
                      <span>·</span>
                      <span className={n.priority === 'urgent' ? 'text-red-700 font-semibold' : 'text-neutral-500'}>
                        Prioriteit: {n.priority}
                      </span>
                      {!n.read && (
                        <span className="ml-auto text-[10px] font-semibold text-emerald-700">Nieuw</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal: Broadcast New Emergency Alert */}
        {showBroadcastModal && (
          <div className="absolute inset-0 bg-white z-20 flex flex-col p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <h4 className="font-bold text-sm text-neutral-900">Nieuwe Spoednotificatie Uitzenden</h4>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-3.5 flex-1 flex flex-col">
              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Type Notificatie</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as NotificationAlert['type'])}
                  className="w-full text-xs p-2 border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="spoedlevering">Spoedlevering (Verse goederen / koeling)</option>
                  <option value="vervaldatum_alert">Vervaldata Alert (THT/TGT controle)</option>
                  <option value="voorraadtekort">Voorraadtekort (Dringende behoefte)</option>
                  <option value="update">Algemene Update / Mededeling</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Prioriteit</label>
                <div className="flex gap-2">
                  {(['urgent', 'belangrijk', 'info'] as const).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setNewPriority(p)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize border ${
                        newPriority === p
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'bg-white text-neutral-700 border-neutral-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Kop / Titel *</label>
                <input
                  type="text"
                  required
                  placeholder="Bijv. Spoed: 50 kratten verse zuivel binnengekomen"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Bericht & Toelichting *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Beschrijf details, hoeveelheden en waar de goederen geplaatst moeten worden..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Vereiste Actie (Optioneel)</label>
                <input
                  type="text"
                  placeholder="Bijv. 3 vrijwilligers nodig voor inpakken in koelruimte Hub West"
                  value={newActionRequired}
                  onChange={(e) => setNewActionRequired(e.target.value)}
                  className="w-full text-xs p-2 border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="mt-auto pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="flex-1 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  Nu Uitzenden
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
