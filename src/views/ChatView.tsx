import React, { useState, useEffect, useRef } from 'react';
import { ChatUser, ChatGroup, ChatMessage, EmailSettings } from '../types';
import { StorageService } from '../services/storageService';
import { EmailSettingsModal } from '../components/EmailSettingsModal';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Plus, 
  Phone, 
  Mail, 
  KeyRound, 
  ShieldCheck, 
  Lock, 
  LogOut, 
  Settings, 
  AlertCircle, 
  Check, 
  ArrowRight, 
  Sparkles,
  Inbox
} from 'lucide-react';

interface ChatViewProps {
  chatUsers: ChatUser[];
  chatGroups: ChatGroup[];
  chatMessages: ChatMessage[];
  onAddMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  onAddGroup: (grp: Omit<ChatGroup, 'id' | 'createdAt'>) => void;
  emailSettings: EmailSettings;
  onSaveEmailSettings: (settings: EmailSettings) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  chatUsers,
  chatGroups,
  chatMessages,
  onAddMessage,
  onAddGroup,
  emailSettings,
  onSaveEmailSettings,
}) => {
  // Current logged in user
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(() => {
    return StorageService.getCurrentChatUser();
  });

  // Login flow state
  const [mobileInput, setMobileInput] = useState<string>('0612345678');
  const [emailInput, setEmailInput] = useState<string>('');
  const [verificationCodeInput, setVerificationCodeInput] = useState<string>('');
  const [step, setStep] = useState<'mobile' | 'code'>('mobile');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [targetEmail, setTargetEmail] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState<boolean>(false);

  // Active channel/group
  const [selectedGroupId, setSelectedGroupId] = useState<string>(() => {
    return chatGroups[0]?.id || 'grp-01';
  });

  // Compose message state
  const [messageText, setMessageText] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState<boolean>(false);

  // Create Group Modal
  const [showCreateGroupModal, setShowCreateGroupModal] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [newGroupDesc, setNewGroupDesc] = useState<string>('');
  const [newGroupType, setNewGroupType] = useState<ChatGroup['type']>('vrijwilligers_groep');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // Email Settings Modal
  const [showEmailSettingsModal, setShowEmailSettingsModal] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, selectedGroupId]);

  // Request Code
  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const cleanMobile = mobileInput.replace(/\D/g, '');
    if (cleanMobile.length < 8) {
      setLoginError('Voer een geldig mobiel telefoonnummer in (bijv. 0612345678).');
      return;
    }

    const result = StorageService.requestEmailVerificationCode(cleanMobile, emailInput);
    setGeneratedCode(result.code);
    setTargetEmail(result.targetEmail);
    setStep('code');
    setShowEmailPreviewModal(true);
  };

  // Verify Code
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const user = StorageService.verifyEmailCode(mobileInput, verificationCodeInput);
    if (user) {
      setCurrentUser(user);
      setShowEmailPreviewModal(false);
      setVerificationCodeInput('');
      setStep('mobile');
    } else {
      setLoginError('Onjuiste of verlopen verificatiecode. Controleer uw e-mail.');
    }
  };

  // Quick autofill of verification code
  const handleAutofillCode = () => {
    if (generatedCode) {
      setVerificationCodeInput(generatedCode);
      const user = StorageService.verifyEmailCode(mobileInput, generatedCode);
      if (user) {
        setCurrentUser(user);
        setShowEmailPreviewModal(false);
        setVerificationCodeInput('');
        setStep('mobile');
      }
    }
  };

  const handleLogout = () => {
    StorageService.setCurrentChatUser(null);
    setCurrentUser(null);
    setStep('mobile');
  };

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !currentUser) return;

    onAddMessage({
      groupId: selectedGroupId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text: messageText.trim(),
      isUrgent,
    });

    setMessageText('');
    setIsUrgent(false);
  };

  // Create new group
  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !currentUser) return;

    const isAll = newGroupType === 'hele_groep';
    const group = onAddGroup({
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || 'Groep voor overleg en coördinatie.',
      type: newGroupType,
      createdByUserId: currentUser.id,
      createdByRole: currentUser.role === 'vrijwilliger' ? 'medewerker' : currentUser.role,
      isAllMembers: isAll,
      memberUserIds: isAll ? [] : Array.from(new Set([currentUser.id, ...selectedMemberIds])),
    });

    setNewGroupName('');
    setNewGroupDesc('');
    setSelectedMemberIds([]);
    setShowCreateGroupModal(false);
  };

  // Groups visible to current user
  const visibleGroups = chatGroups.filter((g) => {
    if (!currentUser) return false;
    if (g.isAllMembers || g.type === 'hele_groep') return true;
    if (currentUser.role === 'beheerder') return true;
    return g.memberUserIds.includes(currentUser.id);
  });

  const activeGroup = chatGroups.find((g) => g.id === selectedGroupId) || visibleGroups[0] || chatGroups[0];

  const currentGroupMessages = chatMessages.filter((m) => m.groupId === activeGroup?.id);

  // -----------------------------------------------------------------
  // LOGIN SCREEN (MOBILE NUMBER + EMAIL VERIFICATION)
  // -----------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white border border-neutral-200 rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-neutral-900 text-white p-8">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-neutral-800 border border-neutral-700 px-3 py-1 rounded-md mb-3">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Interne Communicatie</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Voedselbank Chatbox</h1>
            <p className="mt-1.5 text-xs text-neutral-300 leading-relaxed">
              Log veilig in met uw mobiele telefoonnummer. U ontvangt automatisch een verificatiecode via e-mail om uw identiteit te bevestigen.
            </p>
          </div>

          <div className="p-8 space-y-6">
            {loginError && (
              <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {step === 'mobile' ? (
              <form onSubmit={handleRequestCode} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-neutral-800 block mb-1">
                    Mobiel Telefoonnummer:
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                    <input
                      type="tel"
                      required
                      placeholder="0612345678"
                      value={mobileInput}
                      onChange={(e) => setMobileInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-sm font-mono border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1 block">
                    Voorbeeld: 0612345678 (Karel), 0623456789 (Anouk), 0634567890 (Fatima), 0656789012 (Directie)
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    E-mailadres (optioneel indien gekoppeld):
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                    <input
                      type="email"
                      placeholder="Laat leeg om gekoppeld adres te gebruiken"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs border border-neutral-300 rounded-xl"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Verificatiecode Versturen per E-mail
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4 text-xs">
                <div className="p-3 bg-emerald-50 text-emerald-950 rounded-xl border border-emerald-200">
                  <span className="font-bold block">Verificatie e-mail verstuurd!</span>
                  <span className="text-[11px] text-emerald-800">
                    Er is een e-mail met 6-cijferige code gezonden naar <strong>{targetEmail}</strong>.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-neutral-800 block mb-1">
                    Voer 6-cijferige Verificatiecode in:
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-400" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="Bijv. 489215"
                      value={verificationCodeInput}
                      onChange={(e) => setVerificationCodeInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-lg font-mono tracking-widest text-center border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('mobile')}
                    className="flex-1 py-2.5 text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-medium"
                  >
                    Ander Nummer
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md"
                  >
                    Bevestigen & Inloggen
                  </button>
                </div>

                {generatedCode && (
                  <button
                    type="button"
                    onClick={() => setShowEmailPreviewModal(true)}
                    className="w-full text-center text-xs text-emerald-800 font-semibold hover:underline pt-2 block"
                  >
                    Bekijk Verzonden Verificatie E-mail
                  </button>
                )}
              </form>
            )}

            {/* Quick Demo Accounts */}
            <div className="pt-4 border-t border-neutral-100">
              <span className="text-xs font-bold text-neutral-700 block mb-2">
                Snel inloggen met een demo-account:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {chatUsers.slice(0, 4).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setMobileInput(u.mobileNumber);
                      setEmailInput(u.email);
                    }}
                    className="p-2.5 bg-neutral-50 hover:bg-emerald-50 border border-neutral-200 rounded-xl text-left transition-colors"
                  >
                    <span className="font-bold text-neutral-900 block text-xs truncate">{u.name}</span>
                    <span className="text-[11px] text-neutral-500 font-mono block">{u.mobileNumber}</span>
                    <span className="text-[10px] text-emerald-800 font-medium capitalize block">{u.role}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Email Dispatcher Settings Button */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
              <span className="text-neutral-500">SMTP & Mail Server Configureren:</span>
              <button
                onClick={() => setShowEmailSettingsModal(true)}
                className="inline-flex items-center gap-1.5 font-semibold text-neutral-700 hover:text-emerald-800"
              >
                <Settings className="w-3.5 h-3.5" />
                Instellingen voor mailen
              </button>
            </div>
          </div>
        </div>

        {/* Modal: Instant Email Preview (Maak klaar voor mailen) */}
        {showEmailPreviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-neutral-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-bold text-neutral-900 text-sm">Inkomende Verificatie E-mail</h3>
                </div>
                <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  Zojuist Bezorgd
                </span>
              </div>

              {/* Email Content Box */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2 text-xs">
                <div>
                  <span className="text-neutral-500">Van:</span>{' '}
                  <strong className="text-neutral-800">{emailSettings.senderName} &lt;{emailSettings.senderEmail}&gt;</strong>
                </div>
                <div>
                  <span className="text-neutral-500">Aan:</span>{' '}
                  <strong className="text-neutral-800">{targetEmail}</strong>
                </div>
                <div>
                  <span className="text-neutral-500">Onderwerp:</span>{' '}
                  <strong className="text-neutral-900">Uw 6-cijferige verificatiecode voor Voedselbank Verbinding Chat</strong>
                </div>

                <div className="pt-3 border-t border-neutral-200 space-y-2">
                  <p className="text-neutral-700">
                    Beste collega,
                  </p>
                  <p className="text-neutral-700">
                    U heeft een verzoek ingediend om in te loggen op de Voedselbank Chat met mobiel nummer <strong>{mobileInput}</strong>.
                  </p>
                  <div className="my-3 p-3 bg-white border border-emerald-300 rounded-xl text-center">
                    <span className="text-xs text-neutral-500 block mb-1">Uw Verificatiecode:</span>
                    <span className="text-2xl font-mono font-bold text-emerald-800 tracking-widest">
                      {generatedCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Deze code is 15 minuten geldig. Deel deze code nooit met derden.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmailPreviewModal(false)}
                  className="flex-1 py-2 font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-xs"
                >
                  Sluiten
                </button>
                <button
                  type="button"
                  onClick={handleAutofillCode}
                  className="flex-1 py-2 font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl text-xs shadow-xs"
                >
                  Code Automatisch Invullen & Inloggen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Settings Modal */}
        <EmailSettingsModal
          settings={emailSettings}
          isOpen={showEmailSettingsModal}
          onClose={() => setShowEmailSettingsModal(false)}
          onSaveSettings={onSaveEmailSettings}
        />
      </div>
    );
  }

  // -----------------------------------------------------------------
  // ACTIVE CHAT WORKSPACE
  // -----------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col">
      <div className="flex-1 bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Left Sidebar: Channels & Groups */}
        <div className="w-full md:w-80 border-r border-neutral-200 flex flex-col bg-neutral-50/50">
          {/* User Profile Header */}
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 text-sm">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-neutral-900 text-xs block truncate">{currentUser.name}</span>
                <span className="text-[11px] text-emerald-800 font-semibold capitalize block">
                  {currentUser.role} · <span className="font-mono text-neutral-400">{currentUser.mobileNumber}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowEmailSettingsModal(true)}
                className="p-1.5 text-neutral-500 hover:text-neutral-800 rounded-lg hover:bg-neutral-100"
                title="Instellingen voor mailen"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="p-1.5 text-neutral-400 hover:text-red-700 rounded-lg hover:bg-neutral-100"
                title="Uitloggen"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Group Creation Button (Allowed for Beheerder and Medewerker) */}
          {(currentUser.role === 'beheerder' || currentUser.role === 'medewerker') && (
            <div className="p-3 border-b border-neutral-200 bg-emerald-50/60">
              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="w-full py-2 px-3 text-xs font-semibold text-emerald-900 bg-white hover:bg-emerald-100/60 border border-emerald-300 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-700" />
                <span>Nieuwe Vrijwilligersgroep Maken</span>
              </button>
            </div>
          )}

          {/* Group Channels List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider px-2 block mb-2">
              Kanalen & Groepen ({visibleGroups.length})
            </span>

            {visibleGroups.map((group) => {
              const isSelected = group.id === activeGroup?.id;
              const unreadInGroup = chatMessages.filter((m) => m.groupId === group.id).length;

              return (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <Users className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-neutral-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                        {group.name}
                      </span>
                      {group.type === 'hele_groep' && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-neutral-200 text-neutral-700'}`}>
                          Hele Groep
                        </span>
                      )}
                    </div>
                    <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-neutral-500'}`}>
                      {group.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Channel Header */}
          {activeGroup ? (
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-neutral-900">{activeGroup.name}</h2>
                  <span className="text-xs font-medium text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200">
                    {activeGroup.type === 'hele_groep' ? 'Iedereen (Hele Groep)' : activeGroup.type === 'vrijwilligers_groep' ? 'Vrijwilligersgroep' : 'Medewerkers'}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">{activeGroup.description}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-neutral-400 font-mono">
                  {currentGroupMessages.length} berichten
                </span>
              </div>
            </div>
          ) : null}

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50/30">
            {currentGroupMessages.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-400">
                Nog geen berichten in deze groep. Plaats hieronder het eerste bericht!
              </div>
            ) : (
              currentGroupMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-baseline gap-2 mb-1 px-1 text-[11px]">
                      <span className="font-bold text-neutral-900">{msg.senderName}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] capitalize font-medium ${
                        msg.senderRole === 'beheerder'
                          ? 'bg-neutral-900 text-white'
                          : msg.senderRole === 'medewerker'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {msg.senderRole}
                      </span>
                      <span className="text-neutral-400 font-mono">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        msg.isUrgent
                          ? 'bg-red-50 text-red-950 border-2 border-red-300'
                          : isMe
                          ? 'bg-emerald-700 text-white rounded-br-xs'
                          : 'bg-white text-neutral-900 border border-neutral-200 rounded-bl-xs'
                      }`}
                    >
                      {msg.isUrgent && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-red-700 uppercase tracking-wider mb-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Spoedmededeling</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-neutral-200 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <label className="flex items-center gap-1.5 text-xs text-neutral-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span className={isUrgent ? 'font-bold text-red-700' : ''}>Markeer als Spoedbericht</span>
              </label>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder={`Bericht sturen naar ${activeGroup?.name || 'deze groep'}...`}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 p-3 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-5 py-3 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Versturen</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal: Create Group (Beheerder & Medewerkers) */}
      {showCreateGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <h3 className="font-bold text-base text-neutral-900">Nieuwe Groep / Kanaal Aanmaken</h3>
              <button
                onClick={() => setShowCreateGroupModal(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroupSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Groepsnaam *</label>
                <input
                  type="text"
                  required
                  placeholder="Bijv. Vrijwilligers Sorteerploeg Ochtend"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Omschrijving / Doel</label>
                <textarea
                  rows={2}
                  placeholder="Waar is deze groep voor bedoeld..."
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Type Groep</label>
                <select
                  value={newGroupType}
                  onChange={(e) => setNewGroupType(e.target.value as ChatGroup['type'])}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl bg-white"
                >
                  <option value="vrijwilligers_groep">
                    Vrijwilligersgroep (Beheerd door medewerker)
                  </option>
                  <option value="hele_groep">
                    Hele Groep (Toegankelijk voor iedereen binnen de voedselbank)
                  </option>
                  {currentUser.role === 'beheerder' && (
                    <option value="medewerkers">Medewerkerskanaal (Besloten)</option>
                  )}
                </select>
              </div>

              {newGroupType !== 'hele_groep' && (
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">
                    Selecteer Vrijwilligers & Leden:
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-neutral-200 rounded-xl p-2 space-y-1 bg-neutral-50">
                    {chatUsers.map((u) => (
                      <label key={u.id} className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedMemberIds.includes(u.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMemberIds([...selectedMemberIds, u.id]);
                            } else {
                              setSelectedMemberIds(selectedMemberIds.filter((id) => id !== u.id));
                            }
                          }}
                          className="rounded text-emerald-700"
                        />
                        <span className="font-bold text-neutral-900">{u.name}</span>
                        <span className="text-[10px] text-neutral-500">({u.role})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-neutral-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(false)}
                  className="px-4 py-2 font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
                >
                  Groep Aanmaken
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Settings Modal */}
      <EmailSettingsModal
        settings={emailSettings}
        isOpen={showEmailSettingsModal}
        onClose={() => setShowEmailSettingsModal(false)}
        onSaveSettings={onSaveEmailSettings}
      />
    </div>
  );
};
