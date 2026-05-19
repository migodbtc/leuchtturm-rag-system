"use client";

import {
  LayoutDashboard,
  NotepadText,
  PieChart,
  Target,
  PlusCircle,
  LogOut,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { logoutAction } from "../actions";
import { notepadChartData } from "./constants";
import { useEffect, useState } from "react";
import { API_BASE } from "@/utils/api";
import { authHeaders } from "@/utils/auth";
import { containerVariants, itemVariants } from "@/utils/motion";
import { motion } from "framer-motion";
import { Router } from "next/router";
import { useRouter } from "next/navigation";

interface DashboardStats {
  total_notepads: number;
  total_tasks: number;
  total_completed_tasks: number;
  all_notepads: number;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    total_notepads: -1,
    total_tasks: -1,
    total_completed_tasks: -1,
    all_notepads: -1,
  });

  const router = useRouter();

  const navigateToCredits = () => {
    router.push("/home/credits");
  };

  const navigateToNotepads = () => {
    router.push("/home/notes");
  };

  const handleDashboardData = async () => {
    // pre-operation
    setLoading(true);
    setPageError(null);

    // operation
    try {
      const response = await fetch(`${API_BASE}/dashboard`, {
        headers: authHeaders(),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          err.detail ?? `Failed to load notepads (${response.status})`,
        );
      }

      const data: DashboardStats = await response.json();

      console.log("Dashboard data received");
      console.log(data);

      setDashboardStats(data);
    } catch (e) {
      setPageError(
        e instanceof Error ? e.message : "Unexpected error loading notepads.",
      );
    } finally {
      // post-operation
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      handleDashboardData();
    };
    load();
  }, []);

  const handleLogout = async () => {
    await logoutAction();
  };

  const pieChartData = [
    {
      name: "Your Notepads",
      value: dashboardStats.total_notepads,
    },
    {
      name: "All Notepads",
      value: dashboardStats.all_notepads,
    },
  ];

  return (
    <>
      {loading ? (
        <motion.div
          className="col-span-3 flex items-center justify-center gap-2 py-16 text-amber-600"
          variants={containerVariants}
          initial={"hidden"}
          animate={"visible"}
        >
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm font-medium">Loading dashboard...</span>
        </motion.div>
      ) : (
        <motion.div
          className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8"
          variants={containerVariants}
          initial={"hidden"}
          animate={"visible"}
        >
          <motion.section
            className="w-full flex flex-col gap-2"
            variants={containerVariants}
            initial={"hidden"}
            animate={"visible"}
          >
            <motion.h1
              className="text-3xl font-semibold text-amber-800 flex flex-row gap-2 items-center"
              variants={itemVariants}
            >
              <LayoutDashboard className="text-amber-300" /> Dashboard
            </motion.h1>
            <motion.p className="text-sm text-gray-600" variants={itemVariants}>
              Welcome to Yellowpad! Here are some statistics for your usage.
            </motion.p>
          </motion.section>

          <motion.section
            className="w-full grid gap-4 sm:grid-cols-1 md:grid-cols-3"
            variants={containerVariants}
            initial={"hidden"}
            animate={"visible"}
          >
            <motion.div
              variants={itemVariants}
              className="rounded-lg border border-slate-300 bg-white p-5 h-36 flex flex-col align-middle items-start justify-center gap-2"
            >
              <NotepadText size={20} className="text-amber-600" />
              <h2 className="text-4xl font-semibold text-gray-900 flex flex-row gap-2">
                {dashboardStats.total_notepads}
              </h2>
              <p className="text-sm text-gray-600">Your Total Notepads</p>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="rounded-lg border border-slate-300 bg-white p-5 h-36 flex flex-col align-middle items-start justify-center gap-2"
            >
              <Target size={20} className="text-amber-600" />
              <h2 className="text-4xl font-semibold text-gray-900 flex flex-row gap-2">
                {dashboardStats.total_tasks}
              </h2>
              <p className="text-sm text-gray-600">Your Total Tasks</p>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="rounded-lg border border-slate-300 bg-white p-5 h-36 flex flex-col align-middle items-start justify-center gap-2"
            >
              <CheckCircle size={20} className="text-amber-600" />
              <h2 className="text-4xl font-semibold text-gray-900 flex flex-row gap-2">
                {dashboardStats.total_completed_tasks}
              </h2>
              <p className="text-sm text-gray-600">Your Completed Tasks</p>
            </motion.div>
          </motion.section>

          <motion.section className="w-full grid sm:grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              variants={containerVariants}
              initial={"hidden"}
              animate={"visible"}
              className="rounded-lg border border-slate-300 bg-white p-5 h-[21rem] flex flex-col gap-2"
            >
              <motion.h1
                variants={itemVariants}
                className="w-full text-lg uppercase font-semibold text-black flex flex-row gap-2 items-center"
              >
                <PieChart className="text-amber-600" /> Notepad Chart
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-sm text-gray-600"
              >
                Your notepads in comparison to all existing notepads
              </motion.p>
              <motion.div
                variants={itemVariants}
                className="mt-2 h-52 min-w-0"
                style={{ minWidth: 0, height: 220 }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      isAnimationActive={false}
                    >
                      {pieChartData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={
                            entry.name === "Your Notepads"
                              ? "#f59e0b"
                              : "#94A3B8"
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </motion.div>
            </motion.div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="w-full h-84 grid grid-cols-2 align-middle items-start justify-center gap-4 aspect-square"
            >
              <motion.div
                variants={itemVariants}
                className="h-full rounded-lg border border-slate-300 bg-white p-5 transition transform hover:cursor-pointer hover:scale-105 hover:bg-slate-100 flex flex-col gap-2 text-center justify-center items-center align-middle"
                onClick={navigateToNotepads}
              >
                <NotepadText size={20} className="text-amber-600" />
                <p className="text-xs font-semibold text-black uppercase">
                  View All Notepads
                </p>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="h-full rounded-lg border border-slate-300 bg-white p-5 transition transform hover:cursor-pointer hover:scale-105 hover:bg-slate-100 flex flex-col gap-2 text-center justify-center items-center align-middle"
                onClick={navigateToNotepads}
              >
                <PlusCircle size={20} className="text-amber-600" />
                <p className="text-xs font-semibold text-black uppercase">
                  Make New Notepad
                </p>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="h-full rounded-lg border border-slate-300 bg-white p-5 transition transform hover:cursor-pointer hover:scale-105 hover:bg-slate-100 flex flex-col gap-2 text-center justify-center items-center align-middle"
                onClick={navigateToCredits}
              >
                <PieChart size={20} className="text-amber-600" />
                <p className="text-xs font-semibold text-black uppercase">
                  View Credits
                </p>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="h-full rounded-lg border border-slate-300 bg-white p-5 transition transform hover:cursor-pointer hover:scale-105 hover:bg-slate-100 flex flex-col gap-2 text-center justify-center items-center align-middle"
                onClick={handleLogout}
              >
                <LogOut size={20} className="text-amber-600" />
                <p className="text-xs font-semibold text-black uppercase">
                  Log Out
                </p>
              </motion.div>
            </motion.div>
          </motion.section>
        </motion.div>
      )}
    </>
  );
}
