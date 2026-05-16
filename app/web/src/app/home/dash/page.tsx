"use client";

import {
  LayoutDashboard,
  NotepadText,
  PieChart,
  Target,
  PlusCircle,
  LogOut,
  CheckCircle,
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

export default function DashboardPage() {
  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <section className="w-full flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-amber-800 flex flex-row gap-2 items-center">
          <LayoutDashboard className="text-amber-300" /> Dashboard
        </h1>
        <p className="text-sm text-gray-600">
          Welcome to Yellowpad! Here are some statistics for your usage.
        </p>
      </section>

      <section className="w-full grid gap-4 sm:grid-cols-1 md:grid-cols-3">
        <div className="rounded-lg border border-slate-300 bg-white p-5 h-36 flex flex-col align-middle items-start justify-center gap-2">
          <NotepadText size={20} className="text-amber-600" />
          <h2 className="text-4xl font-semibold text-gray-900 flex flex-row gap-2">
            9
          </h2>
          <p className="text-sm text-gray-600">Your Total Notepads</p>
        </div>
        <div className="rounded-lg border border-slate-300 bg-white p-5 h-36 flex flex-col align-middle items-start justify-center gap-2">
          <Target size={20} className="text-amber-600" />
          <h2 className="text-4xl font-semibold text-gray-900 flex flex-row gap-2">
            23
          </h2>
          <p className="text-sm text-gray-600">Your Total Tasks</p>
        </div>
        <div className="rounded-lg border border-slate-300 bg-white p-5 h-36 flex flex-col align-middle items-start justify-center gap-2">
          <CheckCircle size={20} className="text-amber-600" />
          <h2 className="text-4xl font-semibold text-gray-900 flex flex-row gap-2">
            6
          </h2>
          <p className="text-sm text-gray-600">Your Completed Notepads</p>
        </div>
      </section>

      <section className="w-full grid sm:grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-slate-300 bg-white p-5 h-[21rem] flex flex-col  gap-2">
          <h1 className="w-full text-lg uppercase font-semibold text-black flex flex-row gap-2 items-center">
            <PieChart className="text-amber-600" /> Notepad Chart
          </h1>
          <p className="text-sm text-gray-600">
            Your notepads in comparison to all existing notepads
          </p>
          <div className="mt-2" style={{ minWidth: 0, height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={notepadChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {notepadChartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        entry.name === "Your Notepads" ? "#f59e0b" : "#94A3B8"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="w-full h-84 grid grid-cols-2 align-middle items-start justify-center gap-4 aspect-square">
          <div className="h-full rounded-lg border border-slate-300 bg-white p-5 transition transform hover:cursor-pointer hover:scale-105 hover:bg-slate-100 flex flex-col gap-2 text-center justify-center items-center align-middle">
            <NotepadText size={20} className="text-amber-600" />
            <p className="text-xs font-semibold text-black uppercase">
              View All Notepads
            </p>
          </div>
          <div className="h-full rounded-lg border border-slate-300 bg-white p-5 transition transform hover:cursor-pointer hover:scale-105 hover:bg-slate-100 flex flex-col gap-2 text-center justify-center items-center align-middle">
            <PlusCircle size={20} className="text-amber-600" />
            <p className="text-xs font-semibold text-black uppercase">
              Make New Notepad
            </p>
          </div>
          <div className="h-full rounded-lg border border-slate-300 bg-white p-5 transition transform hover:cursor-pointer hover:scale-105 hover:bg-slate-100 flex flex-col gap-2 text-center justify-center items-center align-middle">
            <PieChart size={20} className="text-amber-600" />
            <p className="text-xs font-semibold text-black uppercase">
              View Credits
            </p>
          </div>
          <div
            className="h-full rounded-lg border border-slate-300 bg-white p-5 transition transform hover:cursor-pointer hover:scale-105 hover:bg-slate-100 flex flex-col gap-2 text-center justify-center items-center align-middle"
            onClick={handleLogout}
          >
            <LogOut size={20} className="text-amber-600" />
            <p className="text-xs font-semibold text-black uppercase">
              Log Out
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
