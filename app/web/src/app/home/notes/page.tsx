"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  NotepadText,
  AlertCircle,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { NotepadCard } from "./_components/NotepadCard";
import { NewNotepadModal } from "./_components/NewNotepadModal";
import { NotepadModal } from "./_components/NotepadModal";
import type { Notepad, Task } from "./types";
import { authHeaders } from "@/utils/auth";
import { API_BASE } from "@/utils/api";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/utils/motion";
import NotepadDeleteModal from "./_components/NotepadDeleteModal";

/**
 *  NotesPage: Page containing the catalog of the notepads ASSOCIATED
 *  WITH THE CURRENT USER ONLY, along with the features such as adding new
 *  notepad, viewing/selecting single notepads, editing/deletion, etc.
 *
 *  @component
 *  @returns {JSX.Element}
 */
export default function NotesPage() {
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [viewModalOpen, setViewModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [selectedNotepad, setSelectedNotepad] = useState<Notepad | null>(null);
  const [notepads, setNotepads] = useState<Notepad[]>([]);
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // handleIndex: useCallback which contains the sending of the request to the
  // FastAPI's handle_notepad_index route (see main.py). On success, data is stored
  // on notepads, and on failure, pageError value is defined with API error message.
  const handleIndex = useCallback(async (skip = 0, limit = 21, title = "") => {
    setLoading(true);
    setPageError(null);

    try {
      const res = await fetch(
        `${API_BASE}/notepads?skip=${skip}&limit=${limit}&title=${title}`,
        {
          headers: authHeaders(),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err.detail ?? `Failed to load notepads (${res.status})`,
        );
      }

      const data: Notepad[] = await res.json();
      setNotepads(data);
    } catch (e) {
      setPageError(
        e instanceof Error ? e.message : "Unexpected error loading notepads.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // handleIndex/useEffect: Effect which loads the index on initial load. Once fetched,
  // the index itself will load properly or return an error case.
  useEffect(() => {
    handleIndex();
  }, [handleIndex]);

  // handleCreate: async function to create new notepads for the authenticated user
  async function handleCreate(title: string, tasks: Task[]) {
    setActionError(null);
    try {
      const res = await fetch(`${API_BASE}/notepads`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title,
          tasks: tasks.map((t) => ({
            label: t.label.trim(),
            checked: t.checked,
            flagged: t.flagged,
            mode: t.mode,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err.detail ?? `Failed to create notepad (${res.status})`,
        );
      }
      const created: Notepad = await res.json();
      setNotepads((prev) => [created, ...prev]);
      setCreateModalOpen(false);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Unexpected error creating notepad.",
      );
    }
  }

  // handleView: async function to select (read) a certain notepad made by the user
  async function handleView(id: number) {
    setActionError(null);
    try {
      const res = await fetch(`${API_BASE}/notepads/${id}`, {
        headers: authHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `Failed to load notepad (${res.status})`);
      }
      const notepad: Notepad = await res.json();
      setSelectedNotepad(notepad);
      setViewModalOpen(true);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Unexpected error loading notepad.",
      );
    }
  }

  // handleUpdate: async function for updating an existing notepad
  async function handleUpdate(payload: Notepad) {
    setActionError(null);

    try {
      const res = await fetch(`${API_BASE}/notepads/${payload.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err.detail ?? `Failed to update the notepad (${res.status})`,
        );
      }

      // post-200 update client-side here
      const data: Notepad = await res.json();
      setNotepads((prev) =>
        // each outdated notepad is iterated
        prev.map((notepad) => (notepad.id == data.id ? { ...data } : notepad)),
      );

      setViewModalOpen(false);
    } catch (e) {
      setActionError(
        e instanceof Error
          ? e.message
          : "Unexpected error updating the notepad.",
      );
    }
  }

  // handleDelete: async function to delete an existing notepad made by the user
  async function handleDelete(id: number) {
    setActionError(null);
    try {
      const res = await fetch(`${API_BASE}/notepads/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err.detail ?? `Failed to delete notepad (${res.status})`,
        );
      }

      // post api request
      setNotepads((prev) => prev.filter((n) => n.id !== id));
      setDeleteModalOpen(false);
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Unexpected error deleting notepad.",
      );
    }
  }

  return (
    <motion.div
      className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Page header ── */}
      <motion.section className="flex flex-col gap-2" variants={itemVariants}>
        <h1 className="text-3xl font-semibold text-amber-800 flex flex-row gap-2 items-center">
          <NotepadText className="text-amber-300" /> Notepads
        </h1>
        <p className="text-sm text-slate-600">
          See your notepads here, along with its contents
        </p>
      </motion.section>

      {/* ── Page-level error (index failure) ── */}
      {pageError && (
        <motion.div
          className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          variants={itemVariants}
        >
          <AlertCircle size={16} className="shrink-0" />
          <span>{pageError}</span>
          <button
            onClick={() => handleIndex()}
            className="ml-auto text-xs font-semibold underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* ── Action-level error (create / view / delete failure) ── */}
      {actionError && (
        <motion.div
          className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700"
          variants={itemVariants}
        >
          <AlertCircle size={16} className="shrink-0" />
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="ml-auto text-xs font-semibold underline hover:no-underline cursor-pointer"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* ── Search + action bar ── */}
      <motion.section
        className="w-full h-auto flex flex-row gap-4 text-gray-400 items-center justify-between"
        variants={containerVariants}
      >
        <motion.div
          className="flex items-center gap-2 flex-1 h-10 bg-white rounded-lg px-3 hover:cursor-pointer border border-slate-300"
          variants={itemVariants}
        >
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search notepads..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTitle(e.target.value)
            }
            value={searchTitle}
            className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 hover:cursor-pointer"
          />
        </motion.div>

        <motion.button
          variants={itemVariants}
          className="flex flex-row justify-center align-middle items-center gap-2 h-10 px-4 bg-white border border-slate-300 rounded-lg font-semibold text-sm uppercase text-slate-500 cursor-pointer hover:bg-slate-100"
          onClick={() => handleIndex(0, 21, searchTitle)}
        >
          <Search size={18} />
          Search
        </motion.button>

        {searchTitle != "" && (
          <motion.button
            variants={itemVariants}
            className="flex flex-row justify-center align-middle items-center gap-2 h-10 px-4 bg-white border border-slate-300 rounded-lg font-semibold text-sm uppercase text-slate-500 cursor-pointer hover:bg-slate-100"
            onClick={async () => {
              setSearchTitle("");
              handleIndex();
            }}
          >
            <RotateCcw size={18} />
            Reset
          </motion.button>
        )}

        <motion.button
          onClick={() => setCreateModalOpen(true)}
          className="h-10 px-4 bg-amber-200 text-amber-900 rounded-lg font-semibold text-sm flex items-center gap-2 hover:cursor-pointer hover:bg-amber-300 transition uppercase"
          variants={itemVariants}
        >
          <Plus size={16} />
          New Notepad
        </motion.button>
      </motion.section>

      {/* ── Notepad grid ── */}
      <motion.section
        className="w-full grid grid-cols-3 gap-4 mb-2"
        variants={containerVariants}
      >
        {loading ? (
          <motion.div
            className="col-span-3 flex items-center justify-center gap-2 py-16 text-amber-600"
            variants={containerVariants}
          >
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm font-medium">Loading notepads…</span>
          </motion.div>
        ) : notepads.length === 0 && !pageError ? (
          <motion.div
            className="col-span-3 flex flex-col items-center justify-center py-16 text-slate-400 gap-2"
            variants={containerVariants}
          >
            <NotepadText size={32} className="opacity-30" />
            <motion.p className="text-sm" variants={itemVariants}>
              No notepads yet. Create one to get started.
            </motion.p>
          </motion.div>
        ) : (
          notepads.map((notepad) => (
            <NotepadCard
              key={notepad.id}
              notepad={notepad}
              setSelectedNotepad={setSelectedNotepad}
              onView={handleView}
              onDelete={() => {
                setDeleteModalOpen(true);
              }}
            />
          ))
        )}
      </motion.section>

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
        onSubmit={handleUpdate}
      />

      {/* notepad/delete modal */}
      {selectedNotepad && (
        <NotepadDeleteModal
          open={deleteModalOpen}
          notepad={selectedNotepad}
          onClose={() => {
            setDeleteModalOpen(false);
          }}
          onClick={() => {
            handleDelete(selectedNotepad?.id);
          }}
        />
      )}
    </motion.div>
  );
}
