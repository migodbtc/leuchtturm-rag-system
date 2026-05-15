'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, LogIn, User, CheckCircle, AlertCircle, X } from 'lucide-react';
import { loginAction } from '../actions';

/**
 * LoginPage: Authentication page for user login.
 * Handles email/password validation and submission.
 * 
 * @component
 * @returns {React.ReactNode} Login form with email and password fields
 * 
 * TODO: Connect to /api/auth/login endpoint
 */
export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, {
    ok: false,
    message: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (state.message) {
      setIsModalOpen(true);
    }
  }, [state.message]);

  useEffect(() => {
    if (!state.ok || !state.token) {
      return;
    }

    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    const token = encodeURIComponent(state.token);
    document.cookie = `access_token=${token}; Path=/; Max-Age=900; SameSite=Lax${secure}`;
  }, [state.ok, state.token]);

  const SubmitButton = () => {
    const { pending } = useFormStatus();

    return (
      <motion.button
        type="submit"
        disabled={pending}
        className="flex items-center justify-center gap-2 w-full cursor-pointer rounded-xl py-2.5 text-[0.95rem] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          backgroundImage: 'linear-gradient(to right, #ac7414, #ffe500)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.9';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
        variants={itemVariants}
      >
        <LogIn className="w-4 h-4" />
        {pending ? 'Signing in...' : 'Sign In'}
      </motion.button>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <>
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
      <motion.form action={formAction} className="space-y-4" variants={containerVariants}>
        <motion.div variants={itemVariants}>
          <label htmlFor="username" className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <User className="w-4 h-4" />
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            required
            className="mt-2 block w-full cursor-text rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-[0.95rem] text-gray-900 placeholder-gray-500 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            placeholder="your-username"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Lock className="w-4 h-4" />
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-2 block w-full cursor-text rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-[0.95rem] text-gray-900 placeholder-gray-500 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            placeholder="••••••••"
          />
        </motion.div>

        <SubmitButton />
      </motion.form>

      <motion.div className="text-center text-sm text-gray-700" variants={itemVariants}>
        Don't have an account?{' '}
        <Link href="/auth/register" className="cursor-pointer font-semibold text-amber-600 transition hover:text-amber-700">
          Sign up
        </Link>
      </motion.div>
      </motion.div>

      {isModalOpen && state.message && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsModalOpen(false)}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl border border-gray-300 bg-white p-6 shadow-xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-end mb-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-3">
                {state.ok ? (
                  <CheckCircle className="w-6 h-6 text-amber-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <h2 className="mt-2 text-xl font-semibold text-gray-900">
                {state.ok ? 'Welcome back' : 'Login failed'}
              </h2>
              <p className="text-sm text-gray-600">{state.message}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {state.ok ? (
                <Link
                  href="/home/dash"
                  className="w-full cursor-pointer rounded-xl px-4 py-2 text-center text-sm font-semibold text-white"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #ac7414, #ffe500)',
                  }}
                >
                  Continue to dashboard
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full cursor-pointer rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-amber-200"
                >
                  Try again
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
