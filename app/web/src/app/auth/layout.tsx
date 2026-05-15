'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Copyright } from 'lucide-react';

type AuthLayoutProps = {
  children: ReactNode;
};

/**
 * AuthLayout: Root layout component for all authentication pages.
 * Provides a centered, animated card layout.
 *
 * @component
 * @param {AuthLayoutProps} props - Layout props
 * @param {ReactNode} props.children - Child pages (login, register, etc.)
 * @returns {React.ReactNode} Centered auth card
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.14, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 px-6 py-12 font-sans"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex w-full max-w-lg flex-col items-center gap-4"
        variants={containerVariants}
      >
        <motion.div className="text-center" variants={itemVariants}>
          <p className="text-sm text-gray-700">Inspired by MyProgressList</p>
          <h1 className="mt-2 text-3xl font-bold">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(to right, #ac7414, #ffe500)'
              }}
            >
              YELLOWPAD
            </span>
          </h1>
        </motion.div>

        <motion.div
          className="w-full rounded-xl border border-gray-300 bg-white p-8"
          variants={itemVariants}
        >
          {children}
        </motion.div>
      </motion.div>

      <motion.footer
        className="mt-6 flex items-center gap-2 text-xs text-gray-600"
        variants={itemVariants}
      >
        <Copyright className="w-3 h-3" />
        <span>2026 Communeye Software • Miguel Justin Bunda</span>
      </motion.footer>
    </motion.div>
  );
}
