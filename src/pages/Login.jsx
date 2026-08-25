import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Sparkles } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('IT');
  const [role, setRole] = useState('Admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, login, register } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      if (isAdmin) {
        navigate('/', { replace: true });
      } else {
        navigate('/employee-dashboard', { replace: true });
      }
    }
  }, [user, authLoading, isAdmin, navigate]);

  const getFriendlyErrorMessage = (err) => {
    const message = err?.message || err?.response?.data?.message || 'Authentication error. Please try again.';

    if (message.toLowerCase().includes('already registered')) {
      return 'This email is already registered. Please click Login instead.';
    }
    if (message.toLowerCase().includes('invalid email or password')) {
      return 'Invalid email or password. Please check your credentials or register a new account.';
    }
    if (message.toLowerCase().includes('email and password are required')) {
      return 'Please enter your email and password.';
    }
    if (message.toLowerCase().includes('not authorized') || message.toLowerCase().includes('token')) {
      return 'Your session has expired. Please log in again.';
    }
    if (message.toLowerCase().includes('forbidden') || message.toLowerCase().includes('admin access')) {
      return 'You do not have permission to access that area.';
    }
    return message;
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const authUser = await login(normalizedEmail, password);

        if (authUser?.role === 'Admin') {
          navigate('/', { replace: true });
        } else {
          navigate('/employee-dashboard', { replace: true });
        }
      } else {
        const authUser = await register({
          name,
          email: normalizedEmail,
          password,
          role,
          industry,
        });

        if (authUser?.role === 'Admin') {
          navigate('/', { replace: true });
        } else {
          navigate('/employee-dashboard', { replace: true });
        }
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-black text-white overflow-hidden font-sans">
      {/* LEFT SIDE Branding */}
      <div className="hidden lg:flex w-full lg:w-1/2 relative bg-gradient-to-br from-[#12051f] via-[#1f1147] to-[#09090f] p-8 lg:p-16 flex-col justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.25),transparent_40%)]"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10 lg:mb-16">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Pearls CRM</h1>
          </div>

          <div className="max-w-xl">
            <h2 className="text-3xl lg:text-5xl leading-tight font-black mb-6 lg:mb-8 tracking-tight">
              Manage your business with premium CRM experience.
            </h2>
            <p className="text-gray-400 text-base lg:text-lg leading-relaxed font-normal">
              Powerful analytics, lead management, automation and employee collaboration workflows.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-gradient-to-br from-[#09090f] via-[#12051f] to-black">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-[32px] p-5 sm:p-8 shadow-2xl"
        >
          {/* TITLE */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">
              {isLogin ? "Welcome Back 👋" : "Create Account"}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Access your premium CRM dashboard
            </p>
          </div>

          {/* TOGGLE */}
          <div className="flex p-1 bg-white/5 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 border border-white/10">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isLogin
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Login
            </button>

            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                !isLogin
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleEmailAuth} className="space-y-4 sm:space-y-5">
            {!isLogin && (
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-purple-500 transition"
              />
            )}

            {/* EMAIL */}
            <div className="relative">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full pl-10 sm:pl-12 pr-4 sm:pr-5 py-3 sm:py-4 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* PASSWORD */}
            <div className="relative">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 sm:pl-12 pr-4 sm:pr-5 py-3 sm:py-4 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* SELECT INDUSTRY (Register only) */}
            {!isLogin && (
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 outline-none text-white focus:border-purple-500 transition"
              >
                <option value="IT" className="bg-slate-900 text-white">IT & Software</option>
                <option value="Clinic" className="bg-slate-900 text-white">Clinic</option>
                <option value="Real Estate" className="bg-slate-900 text-white">Real Estate</option>
              </select>
            )}

            {/* ROLE SELECTOR */}
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-medium ml-1">
                  Register As:
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-white/5 border border-purple-500/50 outline-none text-white font-medium focus:border-purple-400 transition"
                >
                  <option value="Admin" className="bg-slate-900 text-white">Admin (Full Access Dashboard)</option>
                  <option value="Employee" className="bg-slate-900 text-white">Employee (Portal Access)</option>
                </select>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                {error}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 font-bold text-sm sm:text-base hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-purple-500/25"
            >
              {loading ? "Processing..." : isLogin ? "Login" : "Register"}
            </button>
          </form>

        </motion.div>
      </div>
    </div>
  );
}