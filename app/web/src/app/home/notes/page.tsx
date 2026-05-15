
"use client";

import { useState } from "react";
import { Search, Plus, NotepadText } from "lucide-react";
import { NotepadCard } from "./_components/NotepadCard";
import { NewNotepadModal } from "./_components/NewNotepadModal";
import { MOCK_NOTEPADS } from "./constants";
import type { NotepadCardData } from "./constants";

export default function NotesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [notepads, setNotepads] = useState<NotepadCardData[]>(MOCK_NOTEPADS);

  function handleCreate(data: NotepadCardData) {
    setNotepads((prev) => [data, ...prev]);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      {/* ── Page header ── */}
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-amber-800 flex flex-row gap-2 items-center">
          <NotepadText className="text-amber-300" /> Notepads
        </h1>
        <p className="text-sm text-slate-600">
          See your notepads here, along with its contents
        </p>
      </section>

      {/* ── Search + action bar ── */}
      <section className="w-full h-auto flex flex-row gap-4 text-gray-400 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 h-10 bg-white rounded-lg px-3 hover:cursor-pointer border border-slate-300">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search notepads..."
            className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 hover:cursor-pointer"
          />
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="h-10 px-4 bg-amber-200 text-amber-900 rounded-lg font-semibold text-sm flex items-center gap-2 hover:cursor-pointer hover:bg-amber-300 transition uppercase"
        >
          <Plus size={16} />
          New Notepad
        </button>
      </section>

      {/* ── Notepad grid ── */}
      <section className="w-full grid grid-cols-3 gap-4 mb-2">
        {notepads.map((notepad) => (
          <NotepadCard
            key={notepad.id}
            notepad={notepad}
            onView={(id) => console.log("view", id)}
            onDelete={(id) => console.log("delete", id)}
          />
        ))}
      </section>

      {/* ── New Notepad Modal ── */}
      <NewNotepadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
