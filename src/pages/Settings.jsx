import React, { useState } from 'react';
import { 
  User, Bell, Shield, Moon, Globe, LogOut, CheckCircle2,
  Lock, Calendar, Trash2, Mail, Camera, Save, X, Hash, MapPin, Briefcase
} from 'lucide-react';
import { updateProfile, sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { auth } from '../firebase';
import { format } from 'date-fns';
import { useTranslation } from '../lib/i18n.jsx';
import { useGoogleLogin } from '@react-oauth/google';

const SectionHeader = ({ title, description }) => (
  <div className="mb-6">
    <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{title}</h3>
    <p className="text-xs font-semibold text-slate-400 mt-1">{description}</p>
  </div>
);

const Settings = ({ user, settings, updateSettings, onLogout }) => {
  const { t } = useTranslation();
  // Local state for extended profile editing
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    avatarUrl: settings?.avatarUrl || '',
    bio: settings?.bio || '',
    role: settings?.role || '',
    location: settings?.location || ''
  });
  
  const [newQuote, setNewQuote] = useState('');
  
  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar.events',
    onSuccess: tokenResponse => {
      updateSettings({ googleAccessToken: tokenResponse.access_token });
      alert('Tài khoản Google đã được kết nối! | Google Account Connected!');
    },
    onError: error => alert('Kết nối thất bại | Connection Failed')
  });
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const customQuotes = settings?.customQuotes || ["Take a deep breath and start small."];

  const handleAddQuote = async () => {
     if (!newQuote.trim()) return;
     const updated = [...customQuotes, newQuote.trim()];
     await updateSettings({ customQuotes: updated });
     setNewQuote('');
     showMessage("Quote added successfully", "success");
  };

  const handleRemoveQuote = async (indexToRemove) => {
     const updated = customQuotes.filter((_, i) => i !== indexToRemove);
     await updateSettings({ customQuotes: updated });
     showMessage("Quote removed", "success");
  };

  const getInitials = () => {
    if (!user) return 'GA';
    if (user.displayName) return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return user.email.slice(0, 2).toUpperCase();
  };

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      // 1. Update Firebase Auth Profile (Core identity)
      if (user && profileData.displayName !== user.displayName) {
         await updateProfile(user, { displayName: profileData.displayName });
      }
      
      // 2. Update extended info in Firestore (Preferences)
      await updateSettings({
         avatarUrl: profileData.avatarUrl,
         bio: profileData.bio,
         role: profileData.role,
         location: profileData.location
      });

      setIsEditingProfile(false);
      showMessage("Profile updated successfully", "success");
    } catch (err) {
      console.error(err);
      showMessage("Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      showMessage("Password reset email sent. Please check your inbox.", "success");
    } catch (err) {
      console.error(err);
      showMessage(err.message, "error");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      await deleteUser(user);
      // user is signed out automatically
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
         showMessage("For security reasons, please sign out and sign back in before deleting your account.", "error");
      } else {
         showMessage(err.message, "error");
      }
    }
  };

  const showMessage = (msg, type) => {
    setActionMessage({ text: msg, type });
    setTimeout(() => setActionMessage(null), 5000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 pb-16 relative">
      
      {/* Toast Notification */}
      {actionMessage && (
         <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom-5 ${actionMessage.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
            {actionMessage.type === 'success' ? <CheckCircle2 size={20} /> : <Shield size={20} />}
            <span className="font-bold text-sm tracking-wide">{actionMessage.text}</span>
         </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('Account Settings')}</h1>
        <p className="text-slate-500 font-medium">{t('Manage your FocusFlow identity, preferences, and security.')}</p>
      </div>

      {/* 1. Core Identity */}
      <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2"></div>
        <SectionHeader title={t('Core Identity')} description="These fields define your primary FocusFlow profile." />
        
        {isEditingProfile ? (
          <div className="space-y-6 animate-in fade-in duration-200">
             <div className="flex flex-col items-center md:flex-row md:items-start gap-6 md:gap-8 text-center md:text-left">
                <div className="w-24 h-24 shrink-0 bg-blue-100 rounded-[2rem] flex flex-col items-center justify-center text-blue-600 relative overflow-hidden border-4 border-white shadow-lg mx-auto md:mx-0">
                   {profileData.avatarUrl ? <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <Camera size={32} />}
                </div>
                <div className="flex-1 space-y-4 w-full">
                   <div className="text-left">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">{t('Display Name')}</label>
                     <input 
                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                       value={profileData.displayName}
                       onChange={e => setProfileData({...profileData, displayName: e.target.value})}
                       placeholder="e.g. John Doe"
                     />
                   </div>
                   <div className="text-left">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">{t('Avatar Image URL (Optional)')}</label>
                     <input 
                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm"
                       value={profileData.avatarUrl}
                       onChange={e => setProfileData({...profileData, avatarUrl: e.target.value})}
                       placeholder="https://example.com/photo.jpg"
                     />
                   </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="flex flex-col items-center md:flex-row gap-6 md:gap-8 text-center md:text-left">
             <div className="w-24 h-24 shrink-0 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-200/50 relative overflow-hidden ring-4 ring-white mx-auto md:mx-0">
                {settings?.avatarUrl ? <img src={settings.avatarUrl} alt="Profile" className="w-full h-full object-cover" /> : getInitials()}
             </div>
             <div className="flex-1">
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">{user ? user.displayName || 'Unnamed User' : 'Guest Account'}</h2>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                   <Mail size={14} className="text-slate-400" />
                   <p className="text-slate-500 font-bold text-sm tracking-wide break-all">{user ? user.email : 'Local Storage Only'}</p>
                </div>
             </div>
             {user && (
               <button onClick={() => setIsEditingProfile(true)} className="w-full md:w-auto px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all shadow-sm">
                  Edit Profile
               </button>
             )}
          </div>
        )}
      </section>

      {/* 2. Personal Information */}
      <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
         <div className="flex items-center justify-between mb-6">
            <div>
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">{t('Personal Information')}</h3>
            </div>
            {isEditingProfile && (
               <div className="flex items-center gap-2">
                  <button onClick={() => setIsEditingProfile(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all"><X size={20} /></button>
                  <button onClick={handleProfileSave} disabled={loading} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2">
                     <Save size={16} /> {t('Save')}
                  </button>
               </div>
            )}
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-5 rounded-2xl border ${isEditingProfile ? 'bg-slate-50 border-blue-100' : 'bg-white border-slate-100'}`}>
               <div className="flex items-center gap-2 mb-3 text-slate-400">
                  <Hash size={16} /> <span className="text-[10px] uppercase font-black tracking-widest">{t('Bio / Headline')}</span>
               </div>
               {isEditingProfile ? (
                 <textarea 
                    className="w-full bg-transparent resize-none focus:outline-none font-medium text-slate-700 placeholder-slate-300"
                    rows="2"
                    placeholder="E.g. Computer Science Student at UIT..."
                    value={profileData.bio}
                    onChange={e => setProfileData({...profileData, bio: e.target.value})}
                 />
               ) : (
                 <p className="font-semibold text-slate-700 min-h-[48px]">{settings?.bio || <span className="text-slate-300 italic">Not specified</span>}</p>
               )}
            </div>

            <div className={`p-5 rounded-2xl border ${isEditingProfile ? 'bg-slate-50 border-blue-100' : 'bg-white border-slate-100'}`}>
               <div className="flex items-center gap-2 mb-3 text-slate-400">
                  <Briefcase size={16} /> <span className="text-[10px] uppercase font-black tracking-widest">{t('Job Title / Role')}</span>
               </div>
               {isEditingProfile ? (
                 <input 
                    className="w-full bg-transparent focus:outline-none font-medium text-slate-700 placeholder-slate-300"
                    placeholder="E.g. Student / Developer"
                    value={profileData.role}
                    onChange={e => setProfileData({...profileData, role: e.target.value})}
                 />
               ) : (
                 <p className="font-semibold text-slate-700">{settings?.role || <span className="text-slate-300 italic">Not specified</span>}</p>
               )}
            </div>

            <div className={`p-5 rounded-2xl border md:col-span-2 ${isEditingProfile ? 'bg-slate-50 border-blue-100' : 'bg-white border-slate-100'}`}>
               <div className="flex items-center gap-2 mb-3 text-slate-400">
                  <MapPin size={16} /> <span className="text-[10px] uppercase font-black tracking-widest">{t('Location / Timezone')}</span>
               </div>
               {isEditingProfile ? (
                 <input 
                    className="w-full bg-transparent focus:outline-none font-medium text-slate-700 placeholder-slate-300"
                    placeholder="E.g. Ho Chi Minh City (GMT+7)"
                    value={profileData.location}
                    onChange={e => setProfileData({...profileData, location: e.target.value})}
                 />
               ) : (
                 <p className="font-semibold text-slate-700">{settings?.location || <span className="text-slate-300 italic">Not specified</span>}</p>
               )}
            </div>
         </div>
      </section>

      {/* 3. User Preferences */}
      <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
         <SectionHeader title={t('User Preferences')} description="Customize your interface and notification alerts." />
         <div className="space-y-3">
            <div 
               onClick={() => updateSettings({ darkMode: !settings.darkMode })}
               className="flex justify-between items-center p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-all group"
            >
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors"><Moon size={20} /></div>
                  <div>
                     <p className="font-bold text-sm text-slate-800">{t('Interface Theme')}</p>
                     <p className="text-xs font-semibold text-slate-400 mt-0.5">Toggle Dark Mode aesthetics.</p>
                  </div>
               </div>
               <div className={`w-12 h-7 rounded-full relative p-1 transition-colors ${settings.darkMode ? 'bg-blue-600' : 'bg-slate-200'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute shadow-sm transition-all ${settings.darkMode ? 'right-1' : 'left-1'}`}></div>
               </div>
            </div>

            <div 
               onClick={() => updateSettings({ notifications: !settings.notifications })}
               className="flex justify-between items-center p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer transition-all group"
            >
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors"><Bell size={20} /></div>
                  <div>
                     <p className="font-bold text-sm text-slate-800">Browser Notifications</p>
                     <p className="text-xs font-semibold text-slate-400 mt-0.5">Allow web reminders for your tasks.</p>
                  </div>
               </div>
               <div className={`w-12 h-7 rounded-full relative p-1 transition-colors ${settings.notifications ? 'bg-blue-600' : 'bg-slate-200'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute shadow-sm transition-all ${settings.notifications ? 'right-1' : 'left-1'}`}></div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-2xl border border-slate-100 gap-4 transition-all">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center"><Globe size={20} /></div>
                  <div>
                     <p className="font-bold text-sm text-slate-800">{t('Language')}</p>
                     <p className="text-xs font-semibold text-slate-400 mt-0.5">Primary language for dates and system text.</p>
                  </div>
               </div>
               <select 
                  value={settings?.language || 'English'}
                  onChange={e => updateSettings({ language: e.target.value })}
                  className="w-full sm:w-auto bg-slate-50 border border-slate-200 font-bold text-sm text-slate-700 rounded-lg px-4 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
               >
                  <option value="English">English</option>
                  <option value="Vietnamese">Vietnamese</option>
               </select>
            </div>
         </div>
      </section>

      {/* Inspiration & Empty States */}
      <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl -z-10 -translate-y-1/2 translate-x-1/2"></div>
         <SectionHeader title="Inspiration & Empty States" description="Customize the famous quotes that appear when your lists are completely clear." />
         
         <div className="space-y-4">
            <div className="flex gap-3">
               <input 
                  type="text"
                  placeholder="Type a custom quote e.g. 'A clear space is a clear mind.'"
                  value={newQuote}
                  onChange={e => setNewQuote(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddQuote(); }}
                  className="flex-1 bg-slate-50 border border-slate-200 font-bold text-sm text-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:font-medium placeholder:text-slate-400"
               />
               <button 
                  onClick={handleAddQuote}
                  disabled={!newQuote.trim()}
                  className="px-6 py-3 bg-amber-100 text-amber-700 font-bold rounded-xl hover:bg-amber-200 transition-colors disabled:opacity-50"
               >
                  Add
               </button>
            </div>
            
            <div className="grid grid-cols-1 gap-3 mt-4 max-h-60 overflow-y-auto pr-2">
               {customQuotes.map((quote, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 rounded-xl border border-slate-100 bg-white shadow-sm group hover:border-amber-100 transition-colors">
                     <p className="text-sm font-semibold text-slate-600 italic">"{quote}"</p>
                     <button onClick={() => handleRemoveQuote(idx)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                     </button>
                  </div>
               ))}
               {customQuotes.length === 0 && (
                  <p className="p-4 text-center text-sm font-bold text-slate-400 uppercase tracking-widest bg-slate-50 rounded-xl border border-slate-100 border-dashed">No custom quotes saved.</p>
               )}
            </div>
         </div>
      </section>

      {/* 4. Integrations */}
      <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
         <SectionHeader title={t('Integrations')} description="Connect external services and APIs." />
         
         <div className="space-y-4">
            <div className="flex flex-col gap-2">
               <label className="text-sm font-bold text-slate-800">{t('Gemini API Key')}</label>
               <p className="text-xs text-slate-500 mb-2">Enable smart AI parsing. Get your key from Google AI Studio.</p>
               <div className="flex gap-3">
                  <input 
                     type="password"
                     placeholder="AIzaSy..."
                     value={settings?.geminiKey || ''}
                     onChange={e => updateSettings({ geminiKey: e.target.value })}
                     className="flex-1 bg-slate-50 border border-slate-200 font-bold text-sm text-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                  />
               </div>
            </div>

               <div className="flex border-t border-slate-100 p-5 items-center justify-between group hover:bg-slate-50 transition-colors rounded-b-2xl">
                  <div>
                     <p className="font-bold text-sm text-slate-800">Google Calendar</p>
                     <p className="text-xs font-semibold text-slate-400 mt-0.5">Sync tasks and events with your Google account.</p>
                  </div>
                  {settings?.googleAccessToken ? (
                    <button 
                      onClick={() => updateSettings({ googleAccessToken: null })}
                      className="px-4 py-2 bg-rose-50 text-rose-600 font-bold rounded-xl text-sm"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button 
                      onClick={() => login()}
                      className="px-4 py-2 bg-blue-100 text-blue-600 font-bold rounded-xl text-sm"
                    >
                      Connect
                    </button>
                  )}
               </div>
          </div>
      </section>

      {/* 5. Account Security */}
      <section className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm overflow-hidden relative">
         <div className="absolute left-0 w-1 h-full bg-rose-500 top-0"></div>
         <SectionHeader title="Account Security" description="Warning: Some actions in this section are irreversible." />
         
         <div className="grid grid-cols-1 gap-6">
            {user && (
               <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-2xl border border-slate-100 bg-slate-50 gap-4">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center shadow-sm"><Lock size={18} /></div>
                        <div>
                           <p className="font-bold text-sm text-slate-800">Change Password</p>
                           <p className="text-xs font-semibold text-slate-500 mt-0.5">Receive an email to reset your credentials securely.</p>
                        </div>
                     </div>
                     <button onClick={handlePasswordReset} className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all shadow-sm">
                        Request Reset
                     </button>
                  </div>
                  
                  <div className="flex items-center gap-4 px-2">
                      <Calendar size={18} className="text-slate-400" />
                      <p className="text-sm font-semibold text-slate-500">Member Since: <span className="font-bold text-slate-700">
                        {(() => {
                          try {
                            return user?.metadata?.creationTime ? format(new Date(user.metadata.creationTime), 'MMM dd, yyyy') : 'Unknown';
                          } catch { return 'Unknown'; }
                        })()}
                      </span></p>
                   </div>
               </>
            )}

            <div className="mt-4 pt-6 border-t border-rose-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <div>
                  <p className="font-bold text-sm text-rose-600">Delete Account</p>
                  <p className="text-xs font-semibold text-rose-400 mt-0.5">Permanently remove your account and all associated cloud data.</p>
               </div>
               <button onClick={handleDeleteAccount} className="w-full sm:w-auto px-6 py-3 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-all shadow-sm flex items-center justify-center gap-2 group">
                  <Trash2 size={16} className="group-hover:rotate-12 transition-transform" /> Delete Account
               </button>
            </div>
         </div>
      </section>

    </div>
  );
};

export default Settings;
