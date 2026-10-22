import React, { useState } from 'react';
import { ProductItem, TaskItem, ParcelPlan, Location, AllergenType, VolunteerShift } from '../types';
import {
  CheckSquare,
  Square,
  QrCode,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Filter,
  Users,
  Calendar,
  ArrowRight,
  Sparkles,
  Clock,
  MapPin,
  Check,
  UserCheck,
  Truck,
  ShieldCheck,
  Heart,
  Download,
  X,
  Phone,
  Mail,
  UserPlus,
} from 'lucide-react';

interface VolunteerViewProps {
  products: ProductItem[];
  tasks: TaskItem[];
  parcels: ParcelPlan[];
  locations: Location[];
  shifts: VolunteerShift[];
  onUpdateTask: (id: string, updates: Partial<TaskItem>) => void;
  onAddTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  onUpdateParcel: (id: string, updates: Partial<ParcelPlan>) => void;
  onOpenScanner: () => void;
  onInspectProduct: (product: ProductItem) => void;
  onRegisterForShift: (
    shiftId: string,
    volunteer: { id?: string; name: string; phone?: string; email?: string }
  ) => { success: boolean; message: string; shift?: VolunteerShift };
  onUnregisterFromShift: (
    shiftId: string,
    volunteerIdentifier: string
  ) => { success: boolean; message: string; shift?: VolunteerShift };
  onAddShift?: (shift: Omit<VolunteerShift, 'id' | 'registeredVolunteers'>) => void;
}

export const VolunteerView: React.FC<VolunteerViewProps> = ({
  products,
  tasks,
  parcels,
  locations,
  shifts,
  onUpdateTask,
  onAddTask,
  onUpdateParcel,
  onOpenScanner,
  onInspectProduct,
  onRegisterForShift,
  onUnregisterFromShift,
  onAddShift,
}) => {
  // Navigation: default to interactive rooster
  const [activeTab, setActiveTab] = useState<'rooster' | 'taken' | 'inpakken' | 'vervaldata'>('rooster');

  // --- SHIFTS & ROOSTER STATE ---
  const [shiftLocationFilter, setShiftLocationFilter] = useState<string>('all');
  const [shiftDateFilter, setShiftDateFilter] = useState<string>('all');
  const [shiftCategoryFilter, setShiftCategoryFilter] = useState<string>('all');
  const [shiftStatusFilter, setShiftStatusFilter] = useState<'all' | 'open' | 'mine'>('all');

  // Active Volunteer Identity (for 1-click registration)
  const [currentVolunteerName, setCurrentVolunteerName] = useState<string>('Fatima Z.');
  const [currentVolunteerPhone, setCurrentVolunteerPhone] = useState<string>('06-34567890');
  const [currentVolunteerEmail, setCurrentVolunteerEmail] = useState<string>('fatima.z@vrijwilliger-vb.nl');

  // Registration Modal State
  const [selectedShiftForReg, setSelectedShiftForReg] = useState<VolunteerShift | null>(null);
  const [regFormName, setRegFormName] = useState<string>(currentVolunteerName);
  const [regFormPhone, setRegFormPhone] = useState<string>(currentVolunteerPhone);
  const [regFormEmail, setRegFormEmail] = useState<string>(currentVolunteerEmail);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // New Shift Modal State (for coordinators)
  const [showNewShiftModal, setShowNewShiftModal] = useState<boolean>(false);
  const [newShiftRole, setNewShiftRole] = useState<string>('');
  const [newShiftDate, setNewShiftDate] = useState<string>('2026-10-23');
  const [newShiftTimeSlot, setNewShiftTimeSlot] = useState<string>('13:30 - 16:30');
  const [newShiftLocId, setNewShiftLocId] = useState<string>(locations[0]?.id || 'loc-west');
  const [newShiftCat, setNewShiftCat] = useState<VolunteerShift['category']>('Uitgifte');
  const [newShiftDesc, setNewShiftDesc] = useState<string>('');
  const [newShiftRequired, setNewShiftRequired] = useState<number>(3);
  const [newShiftUrgency, setNewShiftUrgency] = useState<VolunteerShift['urgency']>('normaal');

  // --- TASKS STATE ---
  const [taskFilter, setTaskFilter] = useState<'all' | 'open' | 'afgerond'>('open');
  const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDesc, setNewTaskDesc] = useState<string>('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskItem['category']>('Sorteren');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskItem['priority']>('normaal');
  const [newTaskLocId, setNewTaskLocId] = useState<string>(locations[0]?.id || '');
  const [newTaskDue, setNewTaskDue] = useState<string>('Vandaag 16:00');

  // --- PARCEL BUILDER STATE ---
  const [activeParcelId, setActiveParcelId] = useState<string>(parcels[0]?.id || '');
  const [itemToAddId, setItemToAddId] = useState<string>('');
  const [itemAddWarning, setItemAddWarning] = useState<string | null>(null);

  // Quick preset volunteer names for fast switching in UI
  const PRESET_VOLUNTEERS = [
    { name: 'Fatima Z.', phone: '06-34567890', email: 'fatima.z@vrijwilliger-vb.nl' },
    { name: 'Jan de Boer', phone: '06-45678901', email: 'jan.deboer@vrijwilliger-vb.nl' },
    { name: 'Khadija Mansouri', phone: '06-56789012', email: 'khadija.m@vrijwilliger-vb.nl' },
    { name: 'Peter Bakker', phone: '06-67890123', email: 'peter.b@vrijwilliger-vb.nl' },
    { name: 'Anouk Visser', phone: '06-78901234', email: 'anouk.v@vrijwilliger-vb.nl' },
  ];

  // Helper: check if active volunteer is registered in a shift
  const isVolunteerRegistered = (shift: VolunteerShift, volunteerName: string) => {
    return shift.registeredVolunteers.some(
      (v) => v.name.trim().toLowerCase() === volunteerName.trim().toLowerCase()
    );
  };

  // Helper: generate .ics calendar download for a shift
  const downloadCalendarFile = (shift: VolunteerShift) => {
    const loc = locations.find((l) => l.id === shift.locationId);
    const locString = loc ? `${loc.name}, ${loc.address}, ${loc.city}` : 'Voedselbank Locatie';

    const [startRaw, endRaw] = shift.timeSlot.split('-');
    const [startH, startM] = (startRaw || '09:00').trim().split(':');
    const [endH, endM] = (endRaw || '12:00').trim().split(':');

    const dateClean = shift.date.replace(/-/g, '');
    const dtStart = `${dateClean}T${startH.padStart(2, '0')}${startM ? startM.padStart(2, '0') : '00'}00`;
    const dtEnd = `${dateClean}T${endH.padStart(2, '0')}${endM ? endM.padStart(2, '0') : '00'}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Voedselbank Verbinding//Shift Rooster//NL',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `SUMMARY:Voedselbank Shift: ${shift.roleTitle}`,
      `DESCRIPTION:${shift.description}`,
      `LOCATION:${locString}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shift-${shift.date}-${shift.category.toLowerCase().replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Filter Shifts
  const filteredShifts = shifts.filter((s) => {
    if (shiftLocationFilter !== 'all' && s.locationId !== shiftLocationFilter) return false;
    if (shiftDateFilter !== 'all' && s.date !== shiftDateFilter) return false;
    if (shiftCategoryFilter !== 'all' && s.category !== shiftCategoryFilter) return false;
    if (shiftStatusFilter === 'open' && s.registeredVolunteers.length >= s.requiredVolunteers) return false;
    if (shiftStatusFilter === 'mine' && !isVolunteerRegistered(s, currentVolunteerName)) return false;
    return true;
  });

  // KPI Metrics
  const totalOpenSpots = shifts.reduce(
    (sum, s) => sum + Math.max(0, s.requiredVolunteers - s.registeredVolunteers.length),
    0
  );
  const myRegisteredCount = shifts.filter((s) => isVolunteerRegistered(s, currentVolunteerName)).length;
  const urgentShiftsCount = shifts.filter((s) => s.urgency === 'spoed' || s.urgency === 'kritiek').length;

  // Filtered tasks for volunteers
  const volunteerTasks = tasks.filter((t) => {
    if (t.assignedRole === 'medewerker') return false;
    if (taskFilter === 'open') return t.status !== 'afgerond';
    if (taskFilter === 'afgerond') return t.status === 'afgerond';
    return true;
  });

  const activeParcel = parcels.find((p) => p.id === activeParcelId) || parcels[0];

  const handleToggleTaskStatus = (task: TaskItem) => {
    const nextStatus = task.status === 'afgerond' ? 'open' : task.status === 'open' ? 'bezig' : 'afgerond';
    onUpdateTask(task.id, { status: nextStatus });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onAddTask({
      title: newTaskTitle,
      description: newTaskDesc,
      assignedRole: 'vrijwilliger',
      status: 'open',
      priority: newTaskPriority,
      locationId: newTaskLocId,
      dueTime: newTaskDue,
      category: newTaskCategory,
      assigneeName: currentVolunteerName,
    });

    setNewTaskTitle('');
    setNewTaskDesc('');
    setShowNewTaskModal(false);
  };

  // Shift registration handlers
  const handleOpenRegistrationModal = (shift: VolunteerShift) => {
    setSelectedShiftForReg(shift);
    setRegFormName(currentVolunteerName);
    setRegFormPhone(currentVolunteerPhone);
    setRegFormEmail(currentVolunteerEmail);
    setFeedbackMessage(null);
  };

  const handleConfirmRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShiftForReg || !regFormName.trim()) return;

    const res = onRegisterForShift(selectedShiftForReg.id, {
      name: regFormName.trim(),
      phone: regFormPhone.trim(),
      email: regFormEmail.trim(),
    });

    if (res.success) {
      setCurrentVolunteerName(regFormName.trim());
      setCurrentVolunteerPhone(regFormPhone.trim());
      setCurrentVolunteerEmail(regFormEmail.trim());
      setFeedbackMessage({ text: res.message });
      setTimeout(() => {
        setSelectedShiftForReg(null);
        setFeedbackMessage(null);
      }, 1200);
    } else {
      setFeedbackMessage({ text: res.message, isError: true });
    }
  };

  const handleQuickUnregister = (shiftId: string) => {
    if (confirm(`Weet je zeker dat je je wilt uitschrijven van deze shift?`)) {
      const res = onUnregisterFromShift(shiftId, currentVolunteerName);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShiftRole.trim() || !onAddShift) return;

    onAddShift({
      roleTitle: newShiftRole.trim(),
      date: newShiftDate,
      timeSlot: newShiftTimeSlot.trim(),
      locationId: newShiftLocId,
      category: newShiftCat,
      description: newShiftDesc.trim(),
      requiredVolunteers: Number(newShiftRequired) || 2,
      urgency: newShiftUrgency,
    });

    setShowNewShiftModal(false);
    setNewShiftRole('');
    setNewShiftDesc('');
  };

  // Add product to active parcel with allergen & halal safety check
  const handleAddItemToParcel = () => {
    if (!activeParcel || !itemToAddId) return;
    const prod = products.find((p) => p.id === itemToAddId);
    if (!prod) return;

    // Safety checks
    if (activeParcel.halalRequired && prod.halalStatus === 'niet_halal') {
      setItemAddWarning(`Let op: "${prod.name}" is NIET halal en dit gezin vereist strikt halal voedsel!`);
      return;
    }

    const allergenConflict = prod.allergens.find((all) => activeParcel.excludedAllergens.includes(all));
    if (allergenConflict) {
      setItemAddWarning(
        `VEILIGHEIDSWAARSCHUWING: "${prod.name}" bevat ${allergenConflict}, waarvoor dit gezin een geregistreerde allergie heeft!`
      );
      return;
    }

    setItemAddWarning(null);
    const existingIndex = activeParcel.assignedItems.findIndex((i) => i.productId === prod.id);
    let updatedAssigned;
    if (existingIndex >= 0) {
      updatedAssigned = [...activeParcel.assignedItems];
      updatedAssigned[existingIndex].quantity += 1;
    } else {
      updatedAssigned = [...activeParcel.assignedItems, { productId: prod.id, quantity: 1 }];
    }

    onUpdateParcel(activeParcel.id, { assignedItems: updatedAssigned });
  };

  const handleRemoveItemFromParcel = (prodId: string) => {
    if (!activeParcel) return;
    const updated = activeParcel.assignedItems.filter((i) => i.productId !== prodId);
    onUpdateParcel(activeParcel.id, { assignedItems: updated });
  };

  // Expiring items for quick shelf inspection
  const expiringProducts = products.filter((p) => {
    const today = new Date('2026-10-22');
    const exp = new Date(p.expirationDate);
    const diff = (exp.getTime() - today.getTime()) / (1000 * 3600 * 24);
    return diff <= 5;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Volunteer Banner */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-neutral-200">
            <img
              src="/src/assets/images/volunteer_sorting_food_1792664913648.jpg"
              alt="Vrijwilliger inpakken"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">Vrijwilligers Portaal</h1>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Dienst & Rooster Actief
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Bekijk distributieshiften, schrijf je direct in voor uitgifte- of sorteerteams en beheer gezinspakketten.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowNewShiftModal(true)}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nieuwe Shift Plannen
          </button>
          <button
            onClick={onOpenScanner}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
          >
            <QrCode className="w-4 h-4" />
            QR Scanner Openen
          </button>
        </div>
      </div>

      {/* Navigation Segmented Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-neutral-200 pb-4 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('rooster')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'rooster'
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Shiften & Rooster ({shifts.length})
          </button>
          <button
            onClick={() => setActiveTab('taken')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'taken'
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Taken & Checklists ({volunteerTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('inpakken')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'inpakken'
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Gezinspakket Samensteller
          </button>
          <button
            onClick={() => setActiveTab('vervaldata')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'vervaldata'
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Schapinspectie & THT ({expiringProducts.length})
          </button>
        </div>

        {/* Current Volunteer Profile Indicator */}
        <div className="flex items-center gap-2 text-xs bg-neutral-100 p-1 rounded-xl">
          <span className="text-neutral-500 pl-2">Ingeschreven als:</span>
          <select
            value={currentVolunteerName}
            onChange={(e) => {
              const selected = PRESET_VOLUNTEERS.find((p) => p.name === e.target.value);
              if (selected) {
                setCurrentVolunteerName(selected.name);
                setCurrentVolunteerPhone(selected.phone);
                setCurrentVolunteerEmail(selected.email);
              } else {
                setCurrentVolunteerName(e.target.value);
              }
            }}
            className="text-xs font-bold py-1 px-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900"
          >
            {PRESET_VOLUNTEERS.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: INTERACTIEVE ROOSTERWEERGAVE & SHIFT INSCHRIJVING  */}
      {/* ========================================================= */}
      {activeTab === 'rooster' && (
        <div className="space-y-6">
          {/* Rooster KPI Overview Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
              <span className="text-xs text-neutral-500 font-medium block">Geplande Shiften</span>
              <span className="text-2xl font-bold text-neutral-900 font-mono tabular-nums">
                {shifts.length}
              </span>
              <span className="text-xs text-neutral-400 block mt-0.5">distributie & logistiek</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
              <span className="text-xs text-neutral-500 font-medium block">Open Vrijwilligersplekken</span>
              <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
                {totalOpenSpots}
              </span>
              <span className="text-xs text-emerald-600 font-medium block mt-0.5">plekken nog beschikbaar</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
              <span className="text-xs text-neutral-500 font-medium block">Mijn Inschrijvingen</span>
              <span className="text-2xl font-bold text-neutral-900 font-mono tabular-nums">
                {myRegisteredCount}
              </span>
              <span className="text-xs text-neutral-500 font-medium block mt-0.5">
                voor {currentVolunteerName}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
              <span className="text-xs text-neutral-500 font-medium block">Dringende / Spoed Shiften</span>
              <span className="text-2xl font-bold text-red-700 font-mono tabular-nums">
                {urgentShiftsCount}
              </span>
              <span className="text-xs text-red-600 font-medium block mt-0.5">directe bezetting nodig</span>
            </div>
          </div>

          {/* Rooster Filter Bar */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Location filter */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Locatie Filter:</label>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
                  <select
                    value={shiftLocationFilter}
                    onChange={(e) => setShiftLocationFilter(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="all">Alle Uitdeellocaties</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date filter */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Datum:</label>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                  <select
                    value={shiftDateFilter}
                    onChange={(e) => setShiftDateFilter(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="all">Alle Datums</option>
                    <option value="2026-10-22">Donderdag 22 okt (Vandaag)</option>
                    <option value="2026-10-23">Vrijdag 23 okt (Morgen)</option>
                    <option value="2026-10-24">Zaterdag 24 okt (Weekend)</option>
                  </select>
                </div>
              </div>

              {/* Category filter */}
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Taakgroep:</label>
                <select
                  value={shiftCategoryFilter}
                  onChange={(e) => setShiftCategoryFilter(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="all">Alle Taakgroepen</option>
                  <option value="Uitgifte">Uitgifte & Balie</option>
                  <option value="Kwaliteit & Halal">Kwaliteit & Halal Borging</option>
                  <option value="Inpakken">Inpakken Gezinspakketten</option>
                  <option value="Sorteren">Sorteren & Schappen</option>
                  <option value="Chauffeur">Chauffeur & Transport</option>
                </select>
              </div>
            </div>

            {/* Quick Status Filter Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100 text-xs">
              <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-lg">
                <button
                  onClick={() => setShiftStatusFilter('all')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    shiftStatusFilter === 'all'
                      ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Alle Shiften ({shifts.length})
                </button>
                <button
                  onClick={() => setShiftStatusFilter('open')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    shiftStatusFilter === 'open'
                      ? 'bg-emerald-700 text-white font-semibold shadow-2xs'
                      : 'text-emerald-800 hover:text-emerald-950'
                  }`}
                >
                  Alleen Open Plekken ({shifts.filter((s) => s.registeredVolunteers.length < s.requiredVolunteers).length})
                </button>
                <button
                  onClick={() => setShiftStatusFilter('mine')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    shiftStatusFilter === 'mine'
                      ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Mijn Aangemelde Shiften ({myRegisteredCount})
                </button>
              </div>

              <span className="text-neutral-500 font-mono text-[11px]">
                Actieve vrijwilliger: <strong>{currentVolunteerName}</strong>
              </span>
            </div>
          </div>

          {/* Shifts Grid Cards */}
          {filteredShifts.length === 0 ? (
            <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center text-neutral-500 text-xs">
              <Calendar className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              Geen distributieshiften gevonden die voldoen aan de geselecteerde filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredShifts.map((shift) => {
                const isRegistered = isVolunteerRegistered(shift, currentVolunteerName);
                const isFull = shift.registeredVolunteers.length >= shift.requiredVolunteers;
                const loc = locations.find((l) => l.id === shift.locationId);
                const spotsLeft = Math.max(0, shift.requiredVolunteers - shift.registeredVolunteers.length);
                const percentFilled = Math.min(
                  100,
                  Math.round((shift.registeredVolunteers.length / shift.requiredVolunteers) * 100)
                );

                return (
                  <div
                    key={shift.id}
                    className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-2xs ${
                      isRegistered
                        ? 'border-emerald-400 ring-2 ring-emerald-500/30'
                        : shift.urgency === 'kritiek'
                        ? 'border-red-300 hover:border-red-400'
                        : shift.urgency === 'spoed'
                        ? 'border-amber-300 hover:border-amber-400'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {/* Top Card Strip */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-md">
                          <Calendar className="w-3 h-3 text-neutral-500" />
                          {shift.date === '2026-10-22'
                            ? 'Vandaag'
                            : shift.date === '2026-10-23'
                            ? 'Morgen'
                            : shift.date}
                        </span>

                        {/* Urgency Badge */}
                        {shift.urgency === 'kritiek' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-800 bg-red-100 border border-red-300 px-2 py-0.5 rounded-full animate-pulse">
                            <AlertTriangle className="w-3 h-3" />
                            Dringend (Kritiek)
                          </span>
                        ) : shift.urgency === 'spoed' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                            Extra hulp gezocht
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-500 font-medium bg-neutral-50 border border-neutral-200 px-2 py-0.5 rounded-full">
                            Regulier
                          </span>
                        )}
                      </div>

                      {/* Title & Category */}
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold mb-1">
                          {shift.category === 'Kwaliteit & Halal' ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          ) : shift.category === 'Chauffeur' ? (
                            <Truck className="w-3.5 h-3.5 text-emerald-600" />
                          ) : shift.category === 'Uitgifte' ? (
                            <Users className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          <span>{shift.category}</span>
                        </div>

                        <h3 className="text-base font-bold text-neutral-900 leading-snug">
                          {shift.roleTitle}
                        </h3>

                        <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                          {shift.description}
                        </p>
                      </div>

                      {/* Location & TimeSlot Box */}
                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs space-y-1.5">
                        <div className="flex items-center gap-2 text-neutral-800 font-medium">
                          <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="font-mono font-bold">{shift.timeSlot}</span>
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                          <span className="truncate">{loc?.name || shift.locationId}</span>
                        </div>
                      </div>

                      {/* Capacity Progress Bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-neutral-600 font-medium">
                            Bezetting:{' '}
                            <strong className="text-neutral-900 font-mono">
                              {shift.registeredVolunteers.length} van {shift.requiredVolunteers}
                            </strong>
                          </span>
                          <span
                            className={`text-xs font-mono font-bold ${
                              isFull ? 'text-neutral-500' : spotsLeft === 1 ? 'text-amber-700' : 'text-emerald-700'
                            }`}
                          >
                            {isFull ? 'Volledig bezet' : `Nog ${spotsLeft} open`}
                          </span>
                        </div>

                        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isFull ? 'bg-neutral-500' : 'bg-emerald-600'
                            }`}
                            style={{ width: `${percentFilled}%` }}
                          />
                        </div>
                      </div>

                      {/* Registered Volunteers List Chips */}
                      <div>
                        <span className="text-[11px] font-semibold text-neutral-500 block mb-1.5">
                          Ingeschreven vrijwilligers:
                        </span>
                        {shift.registeredVolunteers.length === 0 ? (
                          <span className="text-[11px] text-neutral-400 italic">
                            Nog niemand ingeschreven. Wees de eerste!
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {shift.registeredVolunteers.map((vol) => {
                              const isMe = vol.name.trim().toLowerCase() === currentVolunteerName.trim().toLowerCase();
                              return (
                                <span
                                  key={vol.id}
                                  className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                                    isMe
                                      ? 'bg-emerald-100 text-emerald-950 border-emerald-300 font-bold'
                                      : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                                  }`}
                                >
                                  <UserCheck className="w-3 h-3 text-emerald-700" />
                                  {vol.name} {isMe && '(Jij)'}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between gap-2">
                      {isRegistered ? (
                        <>
                          <div className="flex items-center gap-1 text-xs font-bold text-emerald-800">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Je staat ingeschreven!</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => downloadCalendarFile(shift)}
                              className="p-2 text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-lg transition-colors"
                              title="Download Agenda afspraak (.ics)"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleQuickUnregister(shift.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:text-red-700 bg-white border border-neutral-200 hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors"
                            >
                              Uitschrijven
                            </button>
                          </div>
                        </>
                      ) : isFull ? (
                        <>
                          <span className="text-xs text-neutral-500 italic">Plekken zijn gevuld</span>
                          <button
                            disabled
                            className="px-3 py-1.5 text-xs font-semibold text-neutral-400 bg-neutral-200 rounded-lg cursor-not-allowed"
                          >
                            Volledig Bezet
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-emerald-800 font-medium">
                            {spotsLeft} {spotsLeft === 1 ? 'plek' : 'plekken'} open
                          </span>
                          <button
                            onClick={() => handleOpenRegistrationModal(shift)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs transition-colors"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            Inschrijven
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: TAKEN & CHECKLISTS                                  */}
      {/* ========================================================= */}
      {activeTab === 'taken' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-700">Filter status:</span>
              <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-lg">
                <button
                  onClick={() => setTaskFilter('open')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                    taskFilter === 'open' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-600'
                  }`}
                >
                  Nog te doen
                </button>
                <button
                  onClick={() => setTaskFilter('afgerond')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                    taskFilter === 'afgerond' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-600'
                  }`}
                >
                  Afgerond
                </button>
                <button
                  onClick={() => setTaskFilter('all')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                    taskFilter === 'all' ? 'bg-white shadow-xs text-neutral-900' : 'text-neutral-600'
                  }`}
                >
                  Alle
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowNewTaskModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              Nieuwe Taak
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {volunteerTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all ${
                  task.status === 'afgerond'
                    ? 'bg-neutral-50/70 border-neutral-200 opacity-60'
                    : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleTaskStatus(task)}
                    className="mt-0.5 text-neutral-500 hover:text-emerald-700 transition-colors"
                  >
                    {task.status === 'afgerond' ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5 text-neutral-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                        {task.category}
                      </span>
                      {task.priority === 'spoed' && (
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                          SPOED
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-sm font-bold mt-1 ${
                        task.status === 'afgerond' ? 'line-through text-neutral-500' : 'text-neutral-900'
                      }`}
                    >
                      {task.title}
                    </h3>

                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      {task.description}
                    </p>

                    <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        {task.dueTime}
                      </span>
                      <span>
                        {locations.find((l) => l.id === task.locationId)?.name || 'Algemeen'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: GEZINSPAKKET SAMENSTELLER (HALAL & ALLERGENEN)     */}
      {/* ========================================================= */}
      {activeTab === 'inpakken' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Choose Parcel */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-900">Actieve Uitdeellijst Gezinnen</h3>
            <div className="space-y-2">
              {parcels.map((parcel) => (
                <div
                  key={parcel.id}
                  onClick={() => {
                    setActiveParcelId(parcel.id);
                    setItemAddWarning(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    parcel.id === activeParcel?.id
                      ? 'bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-400 shadow-xs'
                      : 'bg-white border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-200">
                      {parcel.familyCode}
                    </span>
                    <span className="text-xs text-neutral-500">{parcel.householdSize} personen</span>
                  </div>

                  <div className="mt-2 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span>Halal:</span>
                      {parcel.halalRequired ? (
                        <span className="text-emerald-800 font-semibold bg-emerald-100 px-1.5 py-0.2 rounded">
                          ✓ Ja (Strikt Halal)
                        </span>
                      ) : (
                        <span className="text-neutral-500">Geen vereiste</span>
                      )}
                    </div>

                    <div>
                      <span className="text-neutral-500">Allergenenvrij van: </span>
                      {parcel.excludedAllergens.length > 0 ? (
                        <span className="font-semibold text-red-700">
                          {parcel.excludedAllergens.join(', ')}
                        </span>
                      ) : (
                        <span className="text-neutral-600">Geen restricties</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-neutral-200/60 flex items-center justify-between text-[11px] text-neutral-500">
                    <span>
                      Status: <span className="font-medium text-neutral-800 capitalize">{parcel.status}</span>
                    </span>
                    <span>{parcel.assignedItems.length} producten ingepakt</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Middle & Right: Parcel Assembly Workplace */}
          {activeParcel && (
            <div className="lg:col-span-2 space-y-4 bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-neutral-900">
                      Pakket Samenstellen voor {activeParcel.familyCode}
                    </h3>
                    <span className="text-xs font-mono bg-neutral-100 px-2 py-0.5 rounded">
                      Gezin met {activeParcel.householdSize} pers.
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">{activeParcel.notes}</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={activeParcel.status}
                    onChange={(e) =>
                      onUpdateParcel(activeParcel.id, {
                        status: e.target.value as ParcelPlan['status'],
                      })
                    }
                    className="text-xs font-semibold py-1.5 px-3 bg-neutral-100 border border-neutral-300 rounded-lg"
                  >
                    <option value="klaarmaken">In voorbereiding</option>
                    <option value="gereed">Gereed voor afhalen</option>
                    <option value="opgehaald">Uitgereikt</option>
                  </select>
                </div>
              </div>

              {/* Strict safety guidelines for this family */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-700">Dieeteisen:</span>
                  {activeParcel.halalRequired && (
                    <span className="text-emerald-800 bg-emerald-100/70 font-semibold px-2 py-0.5 rounded border border-emerald-300">
                      ✓ Uitsluitend Halal
                    </span>
                  )}
                  {activeParcel.excludedAllergens.map((all) => (
                    <span key={all} className="text-red-700 bg-red-100 font-semibold px-2 py-0.5 rounded">
                      Geen {all}
                    </span>
                  ))}
                </div>
                <span className="text-neutral-500 font-mono text-[11px]">
                  Locatie: {locations.find((l) => l.id === activeParcel.locationId)?.name}
                </span>
              </div>

              {/* Warning Alert if a conflicting item was attempted */}
              {itemAddWarning && (
                <div className="p-3 bg-red-50 text-red-900 text-xs font-medium rounded-xl border border-red-200 flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                  <span>{itemAddWarning}</span>
                </div>
              )}

              {/* Add item control */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <select
                  value={itemToAddId}
                  onChange={(e) => {
                    setItemToAddId(e.target.value);
                    setItemAddWarning(null);
                  }}
                  className="flex-1 text-xs p-2.5 border border-neutral-300 rounded-lg bg-white"
                >
                  <option value="">-- Kies product uit magazijnvoorraad om toe te voegen --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name} ({p.quantity} {p.unit} voorradig) ·{' '}
                      {p.halalStatus === 'halal_gecertificeerd'
                        ? 'Halal Gecertificeerd'
                        : p.halalStatus === 'natuurlijk_halal'
                        ? 'Halal Basis'
                        : 'Niet Halal'}{' '}
                      {p.allergens.length ? `[Bevat: ${p.allergens.join(',')}]` : ''}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleAddItemToParcel}
                  disabled={!itemToAddId}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors disabled:opacity-50"
                >
                  Toevoegen & Verifiëren
                </button>
              </div>

              {/* Currently Assigned Items List (Halal groen gekleurd, anders normaal) */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-neutral-800 mb-2">
                  Inhoud van dit pakket ({activeParcel.assignedItems.length} producten):
                </h4>

                {activeParcel.assignedItems.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400 text-xs border border-dashed border-neutral-200 rounded-xl">
                    Nog geen producten toegevoegd aan dit pakket. Selecteer een product hierboven of scan een barcode.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activeParcel.assignedItems.map((item) => {
                      const prod = products.find((p) => p.id === item.productId);
                      if (!prod) return null;
                      const isHalal = prod.halalStatus === 'halal_gecertificeerd' || prod.halalStatus === 'natuurlijk_halal';
                      return (
                        <div
                          key={prod.id}
                          className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-colors ${
                            isHalal
                              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                              : 'bg-white border-neutral-200 text-neutral-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-neutral-500 font-bold">{prod.code}</span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                {isHalal && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                                <span className={`font-bold block ${isHalal ? 'text-emerald-950' : 'text-neutral-900'}`}>
                                  {prod.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                                <span>{prod.category}</span>
                                <span>·</span>
                                <span>Schap: {prod.shelf}</span>
                                <span>·</span>
                                {isHalal ? (
                                  <span className="text-emerald-800 font-semibold bg-emerald-100 px-1.5 py-0.2 rounded">
                                    ✓ Halal ({prod.halalStatus === 'halal_gecertificeerd' ? 'Gecertificeerd' : 'Natuurlijk'})
                                  </span>
                                ) : (
                                  <span className="text-neutral-500 bg-neutral-100 px-1.5 py-0.2 rounded">
                                    Regulier (Niet Halal)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-neutral-900 tabular-nums">
                              {item.quantity} {prod.unit}
                            </span>
                            <button
                              onClick={() => handleRemoveItemFromParcel(prod.id)}
                              className="text-neutral-400 hover:text-red-700 p-1"
                              title="Verwijder uit pakket"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SCHAPINSPECTIE & THT (VERVALDATA AFVALPREVENTIE)   */}
      {/* ========================================================= */}
      {activeTab === 'vervaldata' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-amber-900">Vervaldata & FIFO Controlelijst</h3>
                <p className="text-xs text-amber-800">
                  Onderstaande producten hebben een THT/TGT datum binnen 5 dagen. Controleer deze schappen en geef voorrang bij het inpakken.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-md">
              {expiringProducts.length} items met urgentie
            </span>
          </div>

          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Productnaam</th>
                  <th className="py-3 px-4">Schaplocatie</th>
                  <th className="py-3 px-4">Houdbaarheid</th>
                  <th className="py-3 px-4">Voorraad</th>
                  <th className="py-3 px-4">Halal Status (Groen = Halal, Anders Normaal)</th>
                  <th className="py-3 px-4 text-right">Actie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {expiringProducts.map((p) => {
                  const isHalal = p.halalStatus === 'halal_gecertificeerd' || p.halalStatus === 'natuurlijk_halal';
                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors border-l-4 ${
                        isHalal
                          ? 'bg-emerald-50/50 hover:bg-emerald-100/60 border-l-emerald-600'
                          : 'bg-white hover:bg-neutral-50 border-l-neutral-200'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-neutral-700">{p.code}</td>
                      <td className="py-3 px-4 font-bold text-neutral-900">{p.name}</td>
                      <td className="py-3 px-4 font-mono text-neutral-600">{p.shelf}</td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded">
                          {p.expirationType} {p.expirationDate}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums">
                        {p.quantity} {p.unit}
                      </td>
                      <td className="py-3 px-4">
                        {isHalal ? (
                          <span className="text-emerald-800 bg-emerald-100 border border-emerald-300 font-semibold px-2 py-0.5 rounded inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                            ✓ Halal ({p.halalStatus === 'halal_gecertificeerd' ? 'Gecertificeerd' : 'Natuurlijk'})
                          </span>
                        ) : (
                          <span className="text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">
                            Regulier (Niet Halal)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onInspectProduct(p)}
                          className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline"
                        >
                          Inspecteren
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SHIFT INSCHRIJVEN BEVESTIGING                      */}
      {/* ========================================================= */}
      {selectedShiftForReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-neutral-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Inschrijven voor Shift</h3>
                <p className="text-xs text-neutral-500">
                  Bevestig je deelname aan deze distributiedienst.
                </p>
              </div>
              <button
                onClick={() => setSelectedShiftForReg(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                ✕
              </button>
            </div>

            {/* Shift Recap Card */}
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs mb-4 space-y-1.5">
              <span className="font-bold text-emerald-950 block text-sm">
                {selectedShiftForReg.roleTitle}
              </span>
              <div className="flex items-center gap-2 text-emerald-900">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span>{selectedShiftForReg.date} · {selectedShiftForReg.timeSlot}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-900">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>
                  {locations.find((l) => l.id === selectedShiftForReg.locationId)?.name || selectedShiftForReg.locationId}
                </span>
              </div>
              <p className="text-emerald-800 text-[11px] pt-1 border-t border-emerald-200">
                {selectedShiftForReg.description}
              </p>
            </div>

            {feedbackMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold mb-3 flex items-center gap-2 ${
                  feedbackMessage.isError
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                }`}
              >
                {feedbackMessage.isError ? (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>{feedbackMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleConfirmRegistration} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Jouw Naam *</label>
                <input
                  type="text"
                  required
                  value={regFormName}
                  onChange={(e) => setRegFormName(e.target.value)}
                  placeholder="Bijv. Fatima Z. of Jan de Boer"
                  className="w-full p-2 border border-neutral-300 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Telefoonnummer (voor shiftcoördinatie)</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="tel"
                    value={regFormPhone}
                    onChange={(e) => setRegFormPhone(e.target.value)}
                    placeholder="Bijv. 06-12345678"
                    className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">E-mailadres (optioneel voor herinnering)</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="email"
                    value={regFormEmail}
                    onChange={(e) => setRegFormEmail(e.target.value)}
                    placeholder="jouw.email@domein.nl"
                    className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedShiftForReg(null)}
                  className="flex-1 py-2 font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  Inschrijving Bevestigen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NIEUWE SHIFT INROOSTEREN (VOOR COÖRDINATOREN)       */}
      {/* ========================================================= */}
      {showNewShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-neutral-200 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Nieuwe Shift Inroosteren</h3>
                <p className="text-xs text-neutral-500">
                  Plan een nieuwe distributie- of sorteerdienst voor vrijwilligers.
                </p>
              </div>
              <button
                onClick={() => setShowNewShiftModal(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateShift} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Rol / Functie *</label>
                <input
                  type="text"
                  required
                  placeholder="Bijv. Uitgifte & Cliëntenontvangst of Inpakploeg"
                  value={newShiftRole}
                  onChange={(e) => setNewShiftRole(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Datum *</label>
                  <input
                    type="date"
                    required
                    value={newShiftDate}
                    onChange={(e) => setNewShiftDate(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Tijdsblok *</label>
                  <input
                    type="text"
                    required
                    placeholder="13:30 - 16:45"
                    value={newShiftTimeSlot}
                    onChange={(e) => setNewShiftTimeSlot(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Locatie Hub</label>
                  <select
                    value={newShiftLocId}
                    onChange={(e) => setNewShiftLocId(e.target.value)}
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
                  <label className="font-semibold text-neutral-700 block mb-1">Taakgroep</label>
                  <select
                    value={newShiftCat}
                    onChange={(e) => setNewShiftCat(e.target.value as VolunteerShift['category'])}
                    className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="Uitgifte">Uitgifte & Balie</option>
                    <option value="Kwaliteit & Halal">Kwaliteit & Halal</option>
                    <option value="Inpakken">Inpakken Pakketten</option>
                    <option value="Sorteren">Sorteren & Schappen</option>
                    <option value="Chauffeur">Chauffeur & Transport</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Benodigd Aantal</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={newShiftRequired}
                    onChange={(e) => setNewShiftRequired(Number(e.target.value))}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Urgentie</label>
                  <select
                    value={newShiftUrgency}
                    onChange={(e) => setNewShiftUrgency(e.target.value as VolunteerShift['urgency'])}
                    className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="normaal">Normaal (Gepland)</option>
                    <option value="spoed">Spoed (Handen te kort)</option>
                    <option value="kritiek">Kritiek (Direct nodig)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Omschrijving van de dienst</label>
                <textarea
                  rows={2}
                  value={newShiftDesc}
                  onChange={(e) => setNewShiftDesc(e.target.value)}
                  placeholder="Bijzonderheden of instructies voor vrijwilligers..."
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-neutral-200 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewShiftModal(false)}
                  className="flex-1 py-2 font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  Shift Toevoegen aan Rooster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: NIEUWE VRIJWILLIGERSTAAK AANMAKEN                  */}
      {/* ========================================================= */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-neutral-200">
            <h3 className="text-base font-bold text-neutral-900 mb-1">Nieuwe Vrijwilligerstaak Aanmaken</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Zet een taak klaar voor de huidige shift of het sorteerteam.
            </p>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Titel van de taak *</label>
                <input
                  type="text"
                  required
                  placeholder="Bijv. 25 kratten groente controleren en sorteren"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Omschrijving / Instructie</label>
                <textarea
                  rows={2}
                  placeholder="Specifieke aanwijzingen voor vrijwilligers..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Categorie</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as TaskItem['category'])}
                    className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="Sorteren">Sorteren</option>
                    <option value="Pakketten">Pakketten</option>
                    <option value="Voorraadcontrole">Voorraadcontrole</option>
                    <option value="Uitgifte">Uitgifte</option>
                    <option value="Schoonmaak">Schoonmaak</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Prioriteit</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskItem['priority'])}
                    className="w-full p-2 border border-neutral-300 rounded-lg bg-white"
                  >
                    <option value="normaal">Normaal</option>
                    <option value="spoed">Spoed</option>
                    <option value="laag">Laag</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Locatie</label>
                  <select
                    value={newTaskLocId}
                    onChange={(e) => setNewTaskLocId(e.target.value)}
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
                  <label className="font-semibold text-neutral-700 block mb-1">Gereed voor</label>
                  <input
                    type="text"
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="flex-1 py-2 font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  Taak Opslaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
