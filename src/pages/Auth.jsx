import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Github, LogIn, UserPlus, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect,
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';

const getFriendlyAuthError = (err) => {
  const code = err?.code || '';

  if (code === 'auth/unauthorized-domain') {
    return 'Google login bị chặn do domain chưa được cấp quyền trong Firebase Auth. Hãy thêm minhquangnguyen321.github.io vào Authorized domains.';
  }
  if (code === 'auth/popup-blocked') {
    return 'Popup đăng nhập bị trình duyệt chặn. Hãy cho phép popup rồi thử lại.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Bạn đã đóng popup đăng nhập trước khi hoàn tất.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Google Sign-In chưa được bật trong Firebase Console (Authentication > Sign-in method).';
  }

  return (err?.message || 'Google login failed.').replace('Firebase: ', '');
};

const Auth = ({ onGuestMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Save the display name to the user profile
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) {
      setError('Firebase chưa khởi tạo, vui lòng kiểm tra cấu hình môi trường.');
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      setError(null);
      setLoading(true);
      await signInWithPopup(auth, provider);
    } catch (err) {
      const code = err?.code || '';

      if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request' || code === 'auth/operation-not-supported-in-this-environment') {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr) {
          setError(getFriendlyAuthError(redirectErr));
          return;
        }
      }

      setError(getFriendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 relative overflow-y-auto py-12">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px] animate-pulse delay-1000" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-2xl shadow-blue-100/50 overflow-hidden relative">
          
          {/* Header Section */}
          <div className="p-10 pb-6 text-center space-y-4 relative">
             <AnimatePresence>
                {!isLogin && (
                   <motion.button
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -10 }}
                     onClick={() => setIsLogin(true)}
                     className="absolute left-6 top-6 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                     title="Back to login"
                   >
                      <ArrowRight className="rotate-180" size={18} />
                   </motion.button>
                )}
             </AnimatePresence>

             <motion.div 
               whileHover={{ scale: 1.05, rotate: 5 }}
               className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-200"
             >
                <Sparkles size={32} className="text-white" />
             </motion.div>
             <div className="space-y-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-slate-500 font-medium text-sm">
                  {isLogin 
                    ? 'Sign in to access your AI-powered workspace.' 
                    : 'Join us to sync your tasks across devices.'}
                </p>
             </div>
          </div>

          <div className="px-10 pb-10 space-y-8">
             <form onSubmit={handleAuth} className="space-y-5">
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                       <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                          <input 
                            type="text" 
                            required={!isLogin}
                            placeholder="John Doe" 
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-slate-700 transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                   <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                      <input 
                        type="email" 
                        required
                        placeholder="hello@nexus.ai" 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-slate-700 transition-all"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                   <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                      <input 
                        type="password" 
                        required
                        placeholder="••••••••" 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 font-bold text-slate-700 transition-all"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                   </div>
                </div>

                {error && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-600 text-xs font-bold"
                   >
                      <AlertCircle className="shrink-0" size={16} />
                      <p>{error}</p>
                   </motion.div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                >
                   {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   ) : (
                      <>
                        {isLogin ? <LogIn size={16} /> : <UserPlus size={16} />}
                        {isLogin ? 'Sign In Now' : 'Create Account'}
                      </>
                   )}
                </button>
             </form>

             <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                <div className="relative flex justify-center text-xs font-black uppercase tracking-widest transition-colors"><span className="bg-white px-4 text-slate-300">Or continue with</span></div>
             </div>

             <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                   <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                   Google Account
                </button>
             </div>

             <div className="space-y-4 pt-4">
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="w-full text-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors"
                >
                  {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign In"}
                </button>
                
                <button 
                  onClick={onGuestMode}
                  className="w-full flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all p-3 rounded-xl border border-dashed border-slate-200 hover:bg-slate-50"
                >
                   Continue as Guest <ArrowRight size={14} />
                </button>
             </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-center gap-3">
             <ShieldCheck size={14} className="text-emerald-500" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enterprise Grade Security & Cloud Sync</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
