import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

import {
  auth,
  db,
} from '../lib/firebase';

import {
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';

import { motion } from 'framer-motion';

import {
  Mail,
  Lock,
  Sparkles,
  User,
  Briefcase,
  Shield,
} from 'lucide-react';

export default function Login() {

  const [isLogin, setIsLogin] =
    useState(true);

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [name, setName] =
    useState('');

  const [industry, setIndustry] =
    useState('IT');

  const [role, setRole] =
    useState('Employee');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const navigate =
    useNavigate();

  // GOOGLE LOGIN

  const handleGoogleLogin =
    async () => {

      const provider =
        new GoogleAuthProvider();

      try {

        setLoading(true);

        setError('');

        const result =
          await signInWithPopup(
            auth,
            provider
          );

        const userRef =
          doc(
            db,
            'users',
            result.user.uid
          );

        const userSnap =
          await getDoc(userRef);

        // CREATE USER IF NOT EXISTS

        if (!userSnap.exists()) {

          // USERS COLLECTION

          await setDoc(userRef, {

            uid:
              result.user.uid,

            email:
              result.user.email,

            displayName:
              result.user.displayName || '',

            role,

            industry,

            avatar:
              result.user.photoURL || '',

            createdAt:
              new Date(),

          });

          // EMPLOYEES COLLECTION

          await setDoc(

            doc(
              db,
              'employees',
              result.user.uid
            ),

            {

              uid:
                result.user.uid,

              name:
                result.user.displayName || '',

              email:
                result.user.email,

              password:
                'Google Login',

              phone: '',

              role,

              createdAt:
                new Date(),

            }

          );

        }

        const updatedUserSnap =
          await getDoc(userRef);

        const userData =
          updatedUserSnap.data() || {};

        // NAVIGATE

        if (
          userData?.role ===
          'Admin'
        ) {

          navigate('/');

        } else {

          navigate(
            '/employee-dashboard'
          );

        }

      } catch (err) {

        console.log(err);

        setError(err.message);

      } finally {

        setLoading(false);

      }

    };

  // EMAIL LOGIN / REGISTER

  const handleEmailAuth =
    async (e) => {

      e.preventDefault();

      setLoading(true);

      setError('');

      try {

        // LOGIN

        if (isLogin) {

          await signInWithEmailAndPassword(
            auth,
            email,
            password
          );

          const userRef =
            doc(
              db,
              'users',
              auth.currentUser.uid
            );

          const userSnap =
            await getDoc(userRef);

          if (
            !userSnap.exists()
          ) {

            setError(
              'User profile not found'
            );

            setLoading(false);

            return;

          }

          const userData =
            userSnap.data() || {};

          if (
            userData?.role ===
            'Admin'
          ) {

            navigate('/');

          } else {

            navigate(
              '/employee-dashboard'
            );

          }

        }

        // REGISTER

        else {

          const result =
            await createUserWithEmailAndPassword(
              auth,
              email,
              password
            );

          // USERS COLLECTION

          await setDoc(

            doc(
              db,
              'users',
              result.user.uid
            ),

            {

              uid:
                result.user.uid,

              email:
                result.user.email,

              displayName:
                name,

              role,

              industry,

              createdAt:
                new Date(),

            }

          );

          // EMPLOYEES COLLECTION

          await setDoc(

            doc(
              db,
              'employees',
              result.user.uid
            ),

            {

              uid:
                result.user.uid,

              name:
                name,

              email:
                result.user.email,

              password:
                password,

              phone: '',

              role,

              createdAt:
                new Date(),

            }

          );

          // NAVIGATE

          if (
            role === 'Admin'
          ) {

            navigate('/');

          } else {

            navigate(
              '/employee-dashboard'
            );

          }

        }

      } catch (err) {

        console.log(err);

        setError(err.message);

      } finally {

        setLoading(false);

      }

    };
return (
<div className="min-h-screen w-full flex flex-col lg:flex-row bg-black text-white overflow-x-hidden">

    {/* LEFT SIDE (hidden on mobile) */}
    <div className="hidden lg:flex w-full lg:w-1/2 relative bg-gradient-to-br from-[#12051f] via-[#1f1147] to-[#09090f] p-8 lg:p-16 flex-col justify-between">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.25),transparent_40%)]"></div>

      <div className="relative z-10">

        <div className="flex items-center gap-3 mb-10 lg:mb-16">

          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">

            <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-white" />

          </div>

          <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
            Pearls CRM
          </h1>

        </div>

        <div className="max-w-xl">

          <h2 className="text-3xl lg:text-6xl leading-tight font-black mb-6 lg:mb-8 bg-gradient-to-r from-white via-gray-100 to-purple-200 bg-clip-text text-transparent">
            Manage your business with premium CRM experience.
          </h2>

          <p className="text-gray-400 text-base lg:text-lg leading-relaxed">
            Powerful analytics, lead management, automation and workflows.
          </p>

        </div>

      </div>
    </div>

    {/* RIGHT SIDE */}
    <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-y-auto page-scroll">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="
          w-full
          max-w-md
          sm:max-w-lg
          p-6
          sm:p-8
          md:p-10
          bg-white/[0.04]
          backdrop-blur-xl
          border border-white/10
          rounded-3xl
          shadow-2xl
          my-auto
        "
      >
        {/* TITLE */}
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h2 className="text-2xl sm:text-4xl font-black mb-2 sm:mb-3 tracking-tight">
            {isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
          </h2>

          <p className="text-gray-400 text-xs sm:text-sm">
            {isLogin
              ? "Access your premium CRM dashboard"
              : "Fill details to create your employee or admin account"}
          </p>
        </div>

        {/* TOGGLE */}
        <div className="flex p-1 bg-white/5 rounded-2xl mb-6 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            className={`flex-1 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
              isLogin
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-600/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
            className={`flex-1 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
              !isLogin
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-600/30"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500"
              />
            </div>
          )}

          {/* EMAIL */}
          <div className="relative">
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500"
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-purple-500 transition-colors text-white placeholder-gray-500"
            />
          </div>

          {/* REGISTER SELECTS */}
          {!isLogin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="relative">
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 outline-none text-white focus:border-purple-500 transition-colors cursor-pointer"
                >
                  <option value="IT" className="text-black">IT & Software</option>
                  <option value="Clinic" className="text-black">Clinic</option>
                  <option value="Real Estate" className="text-black">Real Estate</option>
                </select>
              </div>

              <div className="relative">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-3.5 text-xs sm:text-sm rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 outline-none text-white focus:border-purple-500 transition-colors cursor-pointer"
                >
                  <option value="Admin" className="text-black">Admin</option>
                  <option value="Employee" className="text-black">Employee</option>
                </select>
              </div>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs sm:text-sm p-3.5 rounded-xl sm:rounded-2xl font-medium text-center">
              {error}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 font-bold text-xs sm:text-sm hover:opacity-95 transition-all shadow-lg shadow-purple-600/25 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Processing..." : isLogin ? "Sign In to Account" : "Create New Account"}
          </button>
        </form>

        {/* GOOGLE LOGIN BUTTON */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mt-4 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 font-semibold text-xs sm:text-sm active:scale-[0.98]"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-4 h-4 sm:w-5 sm:h-5"
          />
          <span>Continue with Google</span>
        </button>
      </motion.div>
    </div>
  </div>
);

}