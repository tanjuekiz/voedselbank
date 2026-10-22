import React, { useState, useEffect } from 'react';
import { 
  UserRole, 
  ProductItem, 
  Location, 
  TaskItem, 
  NotificationAlert, 
  DonationRecord, 
  ParcelPlan, 
  DistributionSession, 
  InspectionAudit,
  ChatUser,
  ChatGroup,
  ChatMessage,
  EmailSettings,
  VolunteerShift
} from './types';
import { StorageService } from './services/storageService';
import { Header } from './components/Header';
import { NotificationDrawer } from './components/NotificationDrawer';
import { QRScannerModal } from './components/QRScannerModal';
import { QRLabelModal } from './components/QRLabelModal';
import { HomeView } from './views/HomeView';
import { VolunteerView } from './views/VolunteerView';
import { StaffView } from './views/StaffView';
import { AdminView } from './views/AdminView';
import { InspectorView } from './views/InspectorView';
import { ChatView } from './views/ChatView';
import { AlertCircle, Truck, Heart, ShieldCheck, WifiOff } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('public');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [parcels, setParcels] = useState<ParcelPlan[]>([]);
  const [distributionSessions, setDistributionSessions] = useState<DistributionSession[]>([]);
  const [inspections, setInspections] = useState<InspectionAudit[]>([]);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [emailSettings, setEmailSettings] = useState<EmailSettings>(StorageService.getEmailSettings());
  const [volunteerShifts, setVolunteerShifts] = useState<VolunteerShift[]>([]);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Modals
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState<boolean>(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState<boolean>(false);
  const [activeLabelProduct, setActiveLabelProduct] = useState<ProductItem | null>(null);

  // Load initial data
  useEffect(() => {
    setProducts(StorageService.getProducts());
    setLocations(StorageService.getLocations());
    setTasks(StorageService.getTasks());
    setNotifications(StorageService.getNotifications());
    setDonations(StorageService.getDonations());
    setParcels(StorageService.getParcels());
    setDistributionSessions(StorageService.getDistributionSessions());
    setInspections(StorageService.getInspections());
    setChatUsers(StorageService.getChatUsers());
    setChatGroups(StorageService.getChatGroups());
    setChatMessages(StorageService.getChatMessages());
    setEmailSettings(StorageService.getEmailSettings());
    setVolunteerShifts(StorageService.getVolunteerShifts());
  }, []);

  // Product Actions
  const handleAddProduct = (newProdData: Omit<ProductItem, 'id'>) => {
    const created = StorageService.addProduct(newProdData);
    setProducts(StorageService.getProducts());
    // Also notify
    StorageService.addNotification({
      title: `Nieuwe voorraad intake: ${created.name}`,
      message: `${created.quantity} ${created.unit} toegevoegd aan ${created.shelf} (${created.halalStatus === 'halal_gecertificeerd' ? 'Halal Gecertificeerd' : 'Regulier'}).`,
      type: 'update',
      priority: 'info',
      locationId: created.locationId,
    });
    setNotifications(StorageService.getNotifications());
    return created;
  };

  const handleUpdateProduct = (id: string, updates: Partial<ProductItem>) => {
    StorageService.updateProduct(id, updates);
    setProducts(StorageService.getProducts());
  };

  const handleDeleteProduct = (id: string) => {
    StorageService.deleteProduct(id);
    setProducts(StorageService.getProducts());
  };

  // Task Actions
  const handleAddTask = (newTaskData: Omit<TaskItem, 'id' | 'createdAt'>) => {
    StorageService.addTask(newTaskData);
    setTasks(StorageService.getTasks());
  };

  const handleUpdateTask = (id: string, updates: Partial<TaskItem>) => {
    StorageService.updateTask(id, updates);
    setTasks(StorageService.getTasks());
  };

  // Notification Actions
  const handleAddNotification = (alertData: Omit<NotificationAlert, 'id' | 'timestamp' | 'read'>) => {
    StorageService.addNotification(alertData);
    setNotifications(StorageService.getNotifications());
  };

  const handleMarkNotificationRead = (id: string) => {
    StorageService.markNotificationRead(id);
    setNotifications(StorageService.getNotifications());
  };

  const handleMarkAllNotificationsRead = () => {
    StorageService.markAllNotificationsRead();
    setNotifications(StorageService.getNotifications());
  };

  // Donation Actions
  const handleAddDonation = (donationData: Omit<DonationRecord, 'id'>) => {
    StorageService.addDonation(donationData);
    setDonations(StorageService.getDonations());
    // Auto broadcast notification of donation
    StorageService.addNotification({
      title: `Gedoneerde goederen ontvangen van ${donationData.donorName}`,
      message: `${donationData.totalWeightKg} kg ontvangen (${donationData.donorType}). Waarde: €${donationData.estimatedValueEur}.`,
      type: 'spoedlevering',
      priority: 'urgent',
      locationId: donationData.locationId,
    });
    setNotifications(StorageService.getNotifications());
  };

  // Parcel Actions
  const handleUpdateParcel = (id: string, updates: Partial<ParcelPlan>) => {
    StorageService.updateParcel(id, updates);
    setParcels(StorageService.getParcels());
  };

  // Inspection Actions
  const handleAddInspection = (
    auditData: Omit<InspectionAudit, 'id' | 'inspectionDate' | 'inspectionTime' | 'anonymousVerificationHash'>
  ) => {
    const created = StorageService.addInspection(auditData);
    setInspections(StorageService.getInspections());
    setDistributionSessions(StorageService.getDistributionSessions());
    StorageService.addNotification({
      title: `Kwaliteitsinspectie geregistreerd (${auditData.inspectorNumber})`,
      message: `Sessie geïnspecteerd met score ${auditData.overallScore}% (${auditData.status}). HACCP & Halal geverifieerd.`,
      type: 'update',
      priority: 'info',
      locationId: auditData.locationId,
    });
    setNotifications(StorageService.getNotifications());
    return created;
  };

  // Chat Actions
  const handleAddChatMessage = (msgData: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    StorageService.addChatMessage(msgData);
    setChatMessages(StorageService.getChatMessages());
  };

  const handleAddChatGroup = (grpData: Omit<ChatGroup, 'id' | 'createdAt'>) => {
    const created = StorageService.addChatGroup(grpData);
    setChatGroups(StorageService.getChatGroups());
    StorageService.addNotification({
      title: `Nieuwe chatgroep aangemaakt: ${created.name}`,
      message: `Type: ${created.type === 'hele_groep' ? 'Hele Organisatie' : 'Vrijwilligersgroep'}.`,
      type: 'update',
      priority: 'info',
    });
    setNotifications(StorageService.getNotifications());
    return created;
  };

  const handleSaveEmailSettings = (settings: EmailSettings) => {
    StorageService.saveEmailSettings(settings);
    setEmailSettings(settings);
    StorageService.addNotification({
      title: 'E-mail dispatcher instellingen bijgewerkt',
      message: `SMTP geconfigureerd via ${settings.smtpHost}:${settings.smtpPort} (${settings.simulationMode ? 'Simulatiemodus' : 'Live SMTP'}).`,
      type: 'update',
      priority: 'info',
    });
    setNotifications(StorageService.getNotifications());
  };

  // Volunteer Shift Handlers
  const handleRegisterForShift = (
    shiftId: string,
    volunteer: { id?: string; name: string; phone?: string; email?: string }
  ) => {
    const res = StorageService.registerForShift(shiftId, volunteer);
    if (res.success) {
      setVolunteerShifts(StorageService.getVolunteerShifts());
      StorageService.addNotification({
        title: `Nieuwe inschrijving shift: ${res.shift?.roleTitle}`,
        message: `${volunteer.name} heeft zich ingeschreven voor ${res.shift?.date} (${res.shift?.timeSlot}).`,
        type: 'update',
        priority: 'info',
        locationId: res.shift?.locationId,
      });
      setNotifications(StorageService.getNotifications());
    }
    return res;
  };

  const handleUnregisterFromShift = (shiftId: string, volunteerIdentifier: string) => {
    const res = StorageService.unregisterFromShift(shiftId, volunteerIdentifier);
    if (res.success) {
      setVolunteerShifts(StorageService.getVolunteerShifts());
    }
    return res;
  };

  const handleAddShift = (shiftData: Omit<VolunteerShift, 'id' | 'registeredVolunteers'>) => {
    const created = StorageService.addVolunteerShift(shiftData);
    setVolunteerShifts(StorageService.getVolunteerShifts());
    StorageService.addNotification({
      title: `Nieuwe shift ingeroosterd: ${created.roleTitle}`,
      message: `Op ${created.date} (${created.timeSlot}) op ${created.locationId}. ${created.requiredVolunteers} vrijwilligers gezocht.`,
      type: 'update',
      priority: 'info',
      locationId: created.locationId,
    });
    setNotifications(StorageService.getNotifications());
    return created;
  };

  // Local Database & Offline Handlers
  const handleResetAllData = () => {
    if (confirm('Weet u zeker dat u alle testdata wilt terugzetten naar de standaard fabrieksinstellingen?')) {
      StorageService.resetAllToSampleData();
      setProducts(StorageService.getProducts());
      setLocations(StorageService.getLocations());
      setTasks(StorageService.getTasks());
      setNotifications(StorageService.getNotifications());
      setDonations(StorageService.getDonations());
      setParcels(StorageService.getParcels());
      setDistributionSessions(StorageService.getDistributionSessions());
      setInspections(StorageService.getInspections());
      setChatUsers(StorageService.getChatUsers());
      setChatGroups(StorageService.getChatGroups());
      setChatMessages(StorageService.getChatMessages());
      setEmailSettings(StorageService.getEmailSettings());
      setVolunteerShifts(StorageService.getVolunteerShifts());
    }
  };

  const handleExportDatabase = () => {
    const jsonStr = StorageService.exportDatabaseSnapshot();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `voedselbank_lokale_database_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportDatabase = (jsonStr: string) => {
    const success = StorageService.importDatabaseSnapshot(jsonStr);
    if (success) {
      setProducts(StorageService.getProducts());
      setTasks(StorageService.getTasks());
      setNotifications(StorageService.getNotifications());
      setDonations(StorageService.getDonations());
      setParcels(StorageService.getParcels());
      setDistributionSessions(StorageService.getDistributionSessions());
      setInspections(StorageService.getInspections());
      setChatUsers(StorageService.getChatUsers());
      setChatGroups(StorageService.getChatGroups());
      setChatMessages(StorageService.getChatMessages());
      setEmailSettings(StorageService.getEmailSettings());
      setVolunteerShifts(StorageService.getVolunteerShifts());
      alert('Lokale database succesvol geïmporteerd en hersteld.');
    } else {
      alert('Fout bij het importeren van het JSON bestand. Controleer de structuur.');
    }
  };

  // Urgent notification banner
  const urgentUnread = notifications.find((n) => n.priority === 'urgent' && !n.read);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Emergency Delivery Banner (if urgent unread notification exists) */}
      {urgentUnread && (
        <aside aria-label="Spoedmelding" className="bg-emerald-800 text-white px-4 py-2.5 text-xs flex items-center justify-between shadow-xs">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0">
                Spoed
              </span>
              <span className="font-bold truncate">{urgentUnread.title}:</span>
              <span className="hidden sm:inline text-emerald-100 truncate">{urgentUnread.message}</span>
            </div>
            <button
              onClick={() => setIsNotificationDrawerOpen(true)}
              className="text-xs font-semibold text-white underline hover:text-emerald-200 whitespace-nowrap shrink-0"
            >
              Bekijk Details
            </button>
          </div>
        </aside>
      )}

      {/* Offline Mode Banner (when simulated offline) */}
      {isOfflineMode && (
        <aside aria-label="Offline status" className="bg-amber-600 text-white px-4 py-1.5 text-xs flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Lokale Offline Server Actief · Data wordt lokaal opgeslagen zonder actieve netwerkpoort</span>
        </aside>
      )}

      {/* Main Top Header */}
      <Header
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        unreadNotificationsCount={unreadCount}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onOpenScanner={() => setIsScannerModalOpen(true)}
        isOfflineMode={isOfflineMode}
      />

      {/* Active View Router */}
      <main className="flex-1">
        {currentRole === 'public' && (
          <HomeView
            products={products}
            locations={locations}
            onSelectRole={setCurrentRole}
          />
        )}

        {currentRole === 'vrijwilliger' && (
          <VolunteerView
            products={products}
            tasks={tasks}
            parcels={parcels}
            locations={locations}
            shifts={volunteerShifts}
            onUpdateTask={handleUpdateTask}
            onAddTask={handleAddTask}
            onUpdateParcel={handleUpdateParcel}
            onOpenScanner={() => setIsScannerModalOpen(true)}
            onInspectProduct={(prod) => setActiveLabelProduct(prod)}
            onRegisterForShift={handleRegisterForShift}
            onUnregisterFromShift={handleUnregisterFromShift}
            onAddShift={handleAddShift}
          />
        )}

        {currentRole === 'medewerker' && (
          <StaffView
            products={products}
            locations={locations}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onOpenScanner={() => setIsScannerModalOpen(true)}
            onPrintLabel={(prod) => setActiveLabelProduct(prod)}
            onTriggerEmergencyDelivery={() => setIsNotificationDrawerOpen(true)}
          />
        )}

        {currentRole === 'beheerder' && (
          <AdminView
            products={products}
            locations={locations}
            tasks={tasks}
            notifications={notifications}
            donations={donations}
            isOfflineMode={isOfflineMode}
            onToggleOfflineMode={() => setIsOfflineMode(!isOfflineMode)}
            onResetAllData={handleResetAllData}
            onExportDatabase={handleExportDatabase}
            onImportDatabase={handleImportDatabase}
            onAddDonation={handleAddDonation}
            onOpenNotificationModal={() => setIsNotificationDrawerOpen(true)}
          />
        )}

        {currentRole === 'inspecteur' && (
          <InspectorView
            distributionSessions={distributionSessions}
            inspections={inspections}
            products={products}
            locations={locations}
            parcels={parcels}
            onAddInspection={handleAddInspection}
            onOpenScanner={() => setIsScannerModalOpen(true)}
          />
        )}

        {currentRole === 'chat' && (
          <ChatView
            chatUsers={chatUsers}
            chatGroups={chatGroups}
            chatMessages={chatMessages}
            onAddMessage={handleAddChatMessage}
            onAddGroup={handleAddChatGroup}
            emailSettings={emailSettings}
            onSaveEmailSettings={handleSaveEmailSettings}
          />
        )}
      </main>

      {/* Notification Drawer */}
      <NotificationDrawer
        notifications={notifications}
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onAddNotification={handleAddNotification}
        canBroadcast={currentRole === 'medewerker' || currentRole === 'beheerder'}
      />

      {/* QR Scanner Modal */}
      {isScannerModalOpen && (
        <QRScannerModal
          products={products}
          locations={locations}
          onClose={() => setIsScannerModalOpen(false)}
          onUpdateProduct={handleUpdateProduct}
        />
      )}

      {/* Printable QR Label Modal */}
      {activeLabelProduct && (
        <QRLabelModal
          product={activeLabelProduct}
          locations={locations}
          onClose={() => setActiveLabelProduct(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-auto py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-700" />
              <div>
                <span className="font-bold text-neutral-900 text-sm">Voedselbank Puur Borg</span>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Puur Voedsel · Geborgde Zorg · 100% Halal Borging · Allergenenpreventie · Vrijwilligersroosters
                </p>
              </div>
            </div>

            {/* Quick Portal Switcher in Footer */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500">Wissel portaal:</span>
              <button
                onClick={() => setCurrentRole('public')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  currentRole === 'public' ? 'bg-neutral-900 text-white font-medium' : 'hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                Homepage
              </button>
              <button
                onClick={() => setCurrentRole('vrijwilliger')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  currentRole === 'vrijwilliger' ? 'bg-neutral-900 text-white font-medium' : 'hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                Vrijwilligers
              </button>
              <button
                onClick={() => setCurrentRole('medewerker')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  currentRole === 'medewerker' ? 'bg-neutral-900 text-white font-medium' : 'hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                Medewerkers
              </button>
              <button
                onClick={() => setCurrentRole('beheerder')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  currentRole === 'beheerder' ? 'bg-neutral-900 text-white font-medium' : 'hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                Beheerder
              </button>
              <button
                onClick={() => setCurrentRole('inspecteur')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  currentRole === 'inspecteur' ? 'bg-neutral-900 text-white font-medium' : 'hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                Inspecteurs
              </button>
              <button
                onClick={() => setCurrentRole('chat')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  currentRole === 'chat' ? 'bg-neutral-900 text-white font-medium' : 'hover:bg-neutral-100 text-neutral-700'
                }`}
              >
                Chatbox
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-2">
            <span>© 2026 Voedselbank Puur Borg · Zonder externe poorten · 100% Offline Standalone Capable</span>
            <span className="font-mono">Versie 2.5-NL · HACCP & Halal Geborgd</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
