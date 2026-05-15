'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, CheckCircle, UserPlus, User, AlertCircle, X } from 'lucide-react';
import { registerAction } from '../actions';

/**
 * RegisterPage: Authentication page for user registration.
 * Handles email and password validation with confirmation field.
 * Enforces 8+ character password requirement.
 * 
 * @component
 * @returns {React.ReactNode} Registration form with email, password, and confirmation fields
 * 
 * TODO: Connect to /api/auth/register endpoint
 */
export default function RegisterPage() {
  const [state, formAction] = useActionState(registerAction, {
    ok: false,
    message: null,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (state.message) {
      setIsModalOpen(true);
    }
  }, [state.message]);

  const SubmitButton = () => {
    const { pending } = useFormStatus();

    return (
      <motion.button
        type="submit"
        disabled={pending}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-[0.95rem] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
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
        <UserPlus className="w-4 h-4" />
        {pending ? 'Creating account...' : 'Create Account'}
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
          <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Mail className="w-4 h-4" />
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            required
            className="mt-2 block w-full cursor-text rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-[0.95rem] text-gray-900 placeholder-gray-500 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            placeholder="you@example.com"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Lock className="w-4 h-4" />
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            autoComplete="new-password"
            required
            className="mt-2 block w-full cursor-text rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-[0.95rem] text-gray-900 placeholder-gray-500 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            placeholder="••••••••"
          />
          <p className="mt-1 text-xs text-gray-600">At least 8 characters</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <CheckCircle className="w-4 h-4" />
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
            className="mt-2 block w-full cursor-text rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-[0.95rem] text-gray-900 placeholder-gray-500 transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            placeholder="••••••••"
          />
        </motion.div>

        <SubmitButton />
      </motion.form>

      <motion.div className="text-center text-sm text-gray-700" variants={itemVariants}>
        Already have an account?{' '}
        <Link href="/auth/login" className="cursor-pointer font-semibold text-amber-600 transition hover:text-amber-700">
          Sign in
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
                {state.ok ? 'Account created' : 'Registration failed'}
              </h2>
              <p className="text-sm text-gray-600">{state.message}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {state.ok ? (
                <Link
                  href="/auth/login"
                  className="w-full cursor-pointer rounded-xl px-4 py-2 text-center text-sm font-semibold text-white"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #ac7414, #ffe500)',
                  }}
                >
                  Continue to login
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
