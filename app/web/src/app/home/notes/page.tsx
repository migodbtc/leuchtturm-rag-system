"use client";

import { useState } from "react";
import { Search, Plus, NotepadText } from "lucide-react";
import { NotepadCard } from "./_components/NotepadCard";
import { NewNotepadModal } from "./_components/NewNotepadModal";
import { NotepadModal } from "./_components/NotepadModal";
import { MOCK_NOTEPADS } from "./constants";
import type { NotepadCardData } from "./types";
/**
 * NotesPage: a page component containing the search bar for the notes, the new notepad
 * button & modal, and the index of all existing notepads pertaining to the current
 * authenticated user.
 *
 * @returns A proper NotesPage with all notes and components rendered successfully
 */
export default function NotesPage() {
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [selectedNotepad, setSelectedNotepad] =
    useState<NotepadCardData | null>(null);

  const [notepads, setNotepads] = useState<NotepadCardData[]>(MOCK_NOTEPADS);

  function handleCreate(data: NotepadCardData) {
    setNotepads((prev) => [data, ...prev]);
  }

  function handleView(id: string) {
    const found = notepads.find((item) => item.id === id) || null;
    setSelectedNotepad(found);
    setViewModalOpen(true);
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
          onClick={() => setCreateModalOpen(true)}
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
            onView={handleView}
            onDelete={(id) => console.log("delete", id)}
          />
        ))}
      </section>

      {/* ── New Notepad Modal ── */}
      <NewNotepadModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreate}
      />

      {/* ── View Notepad Modal ── */}
      <NotepadModal
        open={viewModalOpen}
        notepad={selectedNotepad}
        onClose={() => setViewModalOpen(false)}
      />
    </div>
  );
}
