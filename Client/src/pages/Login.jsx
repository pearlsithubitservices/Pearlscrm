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
  <div className="min-h-screen flex flex-col lg:flex-row bg-black text-white overflow-hidden">

    {/* LEFT SIDE (hidden on mobile) */}
    <div className="hidden lg:flex w-full lg:w-1/2 relative bg-gradient-to-br from-[#12051f] via-[#1f1147] to-[#09090f] p-8 lg:p-16 flex-col justify-between">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.25),transparent_40%)]"></div>

      <div className="relative z-10">

        <div className="flex items-center gap-3 mb-10 lg:mb-16">

          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">

            <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-white" />

          </div>

          <h1 className="text-xl lg:text-2xl font-bold">
            Pearls CRM
          </h1>

        </div>

        <div className="max-w-xl">

          <h2 className="text-3xl lg:text-6xl leading-tight font-black mb-6 lg:mb-8">
            Manage your business with premium CRM experience.
          </h2>

          <p className="text-gray-400 text-base lg:text-lg leading-relaxed">
            Powerful analytics, lead management, automation and workflows.
          </p>

        </div>

      </div>
    </div>

    {/* RIGHT SIDE */}
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-gradient-to-br from-[#09090f] via-[#12051f] to-black">

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-[32px] p-5 sm:p-8"
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
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                : "text-gray-400"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              !isLogin
                ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                : "text-gray-400"
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
              className="w-full px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 outline-none"
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
              className="w-full pl-10 sm:pl-12 pr-4 sm:pr-5 py-3 sm:py-4 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 outline-none"
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
              className="w-full pl-10 sm:pl-12 pr-4 sm:pr-5 py-3 sm:py-4 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 outline-none"
            />
          </div>

          {/* SELECTS */}
          {!isLogin && (
            <>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 outline-none"
              >
                <option value="IT">IT & Software</option>
                <option value="Clinic">Clinic</option>
                <option value="Real Estate">Real Estate</option>
              </select>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 outline-none"
              >
                <option value="Admin">Admin</option>
                <option value="Employee">Employee</option>
              </select>
            </>
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
            className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 font-bold text-sm sm:text-base hover:scale-[1.02] transition-all"
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Register"}
          </button>

        </form>

        {/* GOOGLE */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mt-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 font-semibold text-sm sm:text-base"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            className="w-4 h-4 sm:w-5 sm:h-5"
          />
          Continue with Google
        </button>

      </motion.div>
    </div>

  </div>
);

}