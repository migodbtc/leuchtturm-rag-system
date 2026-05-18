/**
 * @file NotepadModal.tsx
 * @description View / edit modal for a selected notepad.
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import {
  X,
  NotepadText,
  Flag,
  RotateCcw,
  Send,
  Pencil,
  CheckSquare,
  List,
  Plus,
  Trash2,
} from "lucide-react";
import type { Notepad, Task, TaskMode } from "../types";
import { TaskStatusIndicator } from "./TaskStatusIndicator";

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface NotepadModalProps {
  open: boolean;
  notepad: Notepad | null;
  onClose: () => void;
}

interface EditState {
  taskIndex: number | null;
  value: string;
}

interface TitleEditState {
  isEditing: boolean;
  value: string;
}

interface NewTaskDraft {
  label: string;
  checked: boolean;
  flagged: boolean;
  mode: TaskMode;
}

const BLANK_DRAFT: NewTaskDraft = {
  label: "",
  checked: false,
  flagged: false,
  mode: "checkbox",
};

function areTasksEqual(a: Task[], b: Task[]) {
  if (a.length !== b.length) return false;
  return a.every((task, index) => {
    const other = b[index];
    return (
      task.label === other.label &&
      task.checked === other.checked &&
      task.flagged === other.flagged &&
      task.mode === other.mode
    );
  });
}

// ─── TaskRow (existing tasks) ─────────────────────────────────────────────────

/**
 * Renders a single editable task row for tasks already in the list.
 * Left indicator toggles checked (checkbox mode only).
 * Mode toggle resets checked state when switching to list.
 */
interface TaskRowProps {
  task: Task;
  index: number;
  isEditing: boolean;
  onEdit: (index: number, currentLabel: string) => void;
  onSave: (index: number, newLabel: string) => void;
  onReset: () => void;
  editValue: string;
  onEditValueChange: (value: string) => void;
  onModeToggle: (index: number) => void;
  onCheckToggle: (index: number) => void;
  onFlagToggle: (index: number) => void;
  onRemove: (index: number) => void;
}

function TaskRow({
  task,
  index,
  isEditing,
  onEdit,
  onSave,
  onReset,
  editValue,
  onEditValueChange,
  onModeToggle,
  onCheckToggle,
  onFlagToggle,
  onRemove,
}: TaskRowProps) {
  return (
    <li className="flex items-center gap-2 py-2 bg-amber-100 border-b border-amber-300">
      {/* Left indicator — clicks toggle checked in checkbox mode */}
      <TaskStatusIndicator
        mode={task.mode}
        checked={task.checked}
        onClick={task.mode === "checkbox" ? () => onCheckToggle(index) : undefined}
      />

      {/* Label */}
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => onEditValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSave(index, editValue);
            if (e.key === "Escape") onReset();
          }}
          className="flex-1 bg-transparent outline-none text-sm text-amber-900 placeholder-amber-600 min-w-0"
          autoFocus
        />
      ) : (
        <span
          className={[
            "flex-1 text-sm text-amber-900 leading-snug",
            task.checked ? "line-through opacity-40" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {task.label}
        </span>
      )}

      {/* Controls */}
      {isEditing ? (
        <>
          <button
            type="button"
            onClick={() => onSave(index, editValue)}
            className="p-1.5 rounded-md transition cursor-pointer bg-amber-500 text-white hover:bg-amber-600"
            title="Save"
            aria-label="Save"
          >
            <Send size={13} aria-hidden />
          </button>
          <button
            type="button"
            onClick={onReset}
            className="p-1.5 rounded-md transition cursor-pointer text-amber-600 hover:bg-amber-200"
            title="Cancel"
            aria-label="Cancel"
          >
            <RotateCcw size={13} aria-hidden />
          </button>
        </>
      ) : (
        <>
          {/* Mode toggle — switches checkbox ↔ list; resets checked when going to list */}
          <button
            type="button"
            onClick={() => onModeToggle(index)}
            className={[
              "p-1.5 rounded-md transition cursor-pointer",
              task.mode === "checkbox"
                ? "bg-amber-200 text-amber-800"
                : "text-amber-600 hover:bg-amber-200",
            ].join(" ")}
            title={
              task.mode === "checkbox" ? "Switch to list" : "Switch to checkbox"
            }
            aria-label={
              task.mode === "checkbox" ? "Switch to list" : "Switch to checkbox"
            }
          >
            {task.mode === "checkbox" ? (
              <CheckSquare size={13} aria-hidden />
            ) : (
              <List size={13} aria-hidden />
            )}
          </button>

          {/* Flag */}
          <button
            type="button"
            onClick={() => onFlagToggle(index)}
            className={[
              "p-1.5 rounded-md transition cursor-pointer",
              task.flagged
                ? "bg-red-100 text-red-500"
                : "text-amber-600 hover:bg-amber-200",
            ].join(" ")}
            title={task.flagged ? "Remove priority" : "Mark priority"}
            aria-label={task.flagged ? "Remove priority" : "Mark priority"}
          >
            <Flag size={13} aria-hidden />
          </button>

          {/* Edit label */}
          <button
            type="button"
            onClick={() => onEdit(index, task.label)}
            className="p-1.5 rounded-md transition cursor-pointer text-amber-600 hover:bg-amber-200"
            title="Edit task"
            aria-label="Edit task"
          >
            <Pencil size={13} aria-hidden />
          </button>

          {/* Remove */}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1.5 rounded-md transition cursor-pointer text-amber-600 hover:bg-red-100 hover:text-red-500"
            title="Remove task"
            aria-label="Remove task"
          >
            <Trash2 size={13} aria-hidden />
          </button>
        </>
      )}
    </li>
  );
}

// ─── NotepadModal ─────────────────────────────────────────────────────────────

export function NotepadModal({ open, notepad, onClose }: NotepadModalProps) {
  const [initialNotepad, setInitialNotepad] = useState<Notepad | null>(
    null,
  );
  const [draftTasks, setDraftTasks] = useState<Task[]>([]);
  const [editState, setEditState] = useState<EditState>({
    taskIndex: null,
    value: "",
  });
  const [titleState, setTitleState] = useState<TitleEditState>({
    isEditing: false,
    value: "",
  });
  const [newTaskDraft, setNewTaskDraft] = useState<NewTaskDraft>(BLANK_DRAFT);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize/reset state when modal opens or notepad changes
  useEffect(() => {
    if (!open || !notepad) return;
    if (initialNotepad?.id === notepad.id) return;
    setInitialNotepad(notepad);
    setDraftTasks(notepad.tasks);
    setEditState({ taskIndex: null, value: "" });
    setTitleState({ isEditing: false, value: notepad.title });
    setNewTaskDraft(BLANK_DRAFT);
    setValidationError(null);
  }, [open, notepad, initialNotepad?.id]);

  const completedCount = draftTasks.filter((t) => t.checked).length;
  const totalCount = draftTasks.length;

  // ── Existing task handlers ────────────────────────────────────────────────

  const handleEditStart = useCallback((index: number, currentLabel: string) => {
    setEditState({ taskIndex: index, value: currentLabel });
  }, []);

  const handleEditSave = useCallback((index: number, newLabel: string) => {
    if (newLabel.trim() === "") return;
    setDraftTasks((prev) =>
      prev.map((task, i) =>
        i === index ? { ...task, label: newLabel.trim() } : task,
      ),
    );
    setEditState({ taskIndex: null, value: "" });
  }, []);

  const handleEditReset = useCallback(() => {
    setEditState({ taskIndex: null, value: "" });
  }, []);

  /** Mode toggle — resets checked when switching to list. */
  const handleModeToggle = useCallback((index: number) => {
    setDraftTasks((prev) =>
      prev.map((task, i) => {
        if (i !== index) return task;
        const nextMode = task.mode === "checkbox" ? "list" : "checkbox";
        return {
          ...task,
          mode: nextMode,
          checked: nextMode === "list" ? false : task.checked,
        };
      }),
    );
  }, []);

  const handleCheckToggle = useCallback((index: number) => {
    setDraftTasks((prev) =>
      prev.map((task, i) =>
        i === index ? { ...task, checked: !task.checked } : task,
      ),
    );
  }, []);

  const handleFlagToggle = useCallback((index: number) => {
    setDraftTasks((prev) =>
      prev.map((task, i) =>
        i === index ? { ...task, flagged: !task.flagged } : task,
      ),
    );
  }, []);

  const handleRemove = useCallback((index: number) => {
    setDraftTasks((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── Title edit handlers ───────────────────────────────────────────────────

  const handleTitleEditStart = useCallback(() => {
    setTitleState((prev) => ({ ...prev, isEditing: true }));
  }, []);

  const handleTitleEditSave = useCallback(() => {
    if (titleState.value.trim() === "") return;
    setTitleState((prev) => ({
      ...prev,
      isEditing: false,
      value: prev.value.trim(),
    }));
  }, [titleState.value]);

  const handleTitleEditCancel = useCallback(() => {
    setTitleState({
      isEditing: false,
      value: initialNotepad?.title ?? "",
    });
  }, [initialNotepad?.title]);

  // ── New-task draft handlers ───────────────────────────────────────────────

  const handleNewDraftModeToggle = useCallback(() => {
    setNewTaskDraft((prev) => {
      const nextMode = prev.mode === "checkbox" ? "list" : "checkbox";
      return {
        ...prev,
        mode: nextMode,
        // reset checked when switching to list
        checked: nextMode === "list" ? false : prev.checked,
      };
    });
  }, []);

  const handleAddNewTask = useCallback(() => {
    if (newTaskDraft.label.trim() === "") return;
    setDraftTasks((prev) => [
      ...prev,
      {
        // id / notepad_id are server-assigned; use sentinels until persisted.
        id: 0,
        notepad_id: initialNotepad?.id ?? 0,
        label: newTaskDraft.label.trim(),
        checked: newTaskDraft.checked,
        flagged: newTaskDraft.flagged,
        mode: newTaskDraft.mode,
      },
    ]);
    setNewTaskDraft(BLANK_DRAFT);
  }, [newTaskDraft, initialNotepad?.id]);

  // ── Footer ────────────────────────────────────────────────────────────────

  const hasChanges =
    !!initialNotepad &&
    (!areTasksEqual(initialNotepad.tasks, draftTasks) ||
      initialNotepad.title !== titleState.value);

  const handleFooterReset = useCallback(() => {
    if (!initialNotepad) return;
    setDraftTasks(initialNotepad.tasks);
    setEditState({ taskIndex: null, value: "" });
    setTitleState({ isEditing: false, value: initialNotepad.title });
    setNewTaskDraft(BLANK_DRAFT);
    setValidationError(null);
  }, [initialNotepad]);

  const handleSubmit = useCallback(() => {
    const trimmedTitle = titleState.value.trim();
    const validTasks = draftTasks.filter((t) => t.label.trim() !== "");

    if (trimmedTitle === "") {
      setValidationError("Please add a title before submitting.");
      return;
    }
    if (validTasks.length === 0) {
      setValidationError("Add at least one task before submitting.");
      return;
    }

    setValidationError(null);
    const payload: Notepad = {
      // id / user_id / timestamps come from the server — keep the originals
      // if available, otherwise use sentinels until persisted.
      id: initialNotepad?.id ?? 0,
      user_id: initialNotepad?.user_id ?? 0,
      title: trimmedTitle,
      created_at: initialNotepad?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tasks: validTasks.map(
        (t): Task => ({
          // Preserve existing server ids; new tasks use sentinel 0.
          id: (t as Task).id ?? 0,
          notepad_id: (t as Task).notepad_id ?? (initialNotepad?.id ?? 0),
          label: t.label,
          checked: t.checked,
          flagged: t.flagged,
          mode: t.mode,
        }),
      ),
    };
    console.log("[NotepadModal] handleSubmit payload:", payload);
  }, [initialNotepad, titleState.value, draftTasks]);

  if (!open || !notepad) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Notepad"
      className="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg mx-4 rounded-xl bg-amber-100 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* ── Header ── */}
        <div className="w-full h-12 flex flex-row items-center justify-between px-5 pt-4 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <NotepadText
              size={16}
              className="shrink-0 text-amber-700"
              aria-hidden
            />
            {titleState.isEditing ? (
              <input
                type="text"
                value={titleState.value}
                onChange={(e) =>
                  setTitleState((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTitleEditSave();
                  if (e.key === "Escape") handleTitleEditCancel();
                }}
                className="flex-1 bg-transparent outline-none text-sm font-semibold text-amber-900 placeholder-amber-600 min-w-0"
                autoFocus
              />
            ) : (
              <h2 className="text-sm font-semibold text-amber-900 truncate">
                {titleState.value || "Untitled Notepad"}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {titleState.isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleTitleEditSave}
                  className="p-1.5 rounded-md transition cursor-pointer bg-amber-500 text-white hover:bg-amber-600"
                  title="Save title"
                  aria-label="Save title"
                >
                  <Send size={13} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={handleTitleEditCancel}
                  className="p-1.5 rounded-md transition cursor-pointer text-amber-600 hover:bg-amber-200"
                  title="Cancel title edit"
                  aria-label="Cancel title edit"
                >
                  <RotateCcw size={13} aria-hidden />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleTitleEditStart}
                className="p-1.5 rounded-md transition cursor-pointer text-amber-600 hover:bg-amber-200"
                title="Edit title"
                aria-label="Edit title"
              >
                <Pencil size={13} aria-hidden />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer p-1 text-amber-700 hover:bg-amber-200 rounded transition"
              title="Close"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-md font-semibold uppercase tracking-wider text-amber-700">
              Notepad List
            </span>
            <span className="text-[10px] text-amber-600">
              {totalCount} item{totalCount !== 1 ? "s" : ""}
            </span>
          </div>

          {totalCount === 0 ? (
            <p className="text-xs text-amber-500 italic">No tasks yet.</p>
          ) : (
            <>
              {/* Flagged */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                    Flagged
                  </span>
                </div>
                {draftTasks.some((task) => task.flagged) ? (
                  <ul
                    className="flex flex-col gap-2"
                    aria-label="Flagged tasks"
                  >
                    {draftTasks
                      .map((task, index) => ({ task, index }))
                      .filter(({ task }) => task.flagged)
                      .map(({ task, index }) => (
                        <TaskRow
                          key={`${notepad.id}-flagged-${index}`}
                          task={task}
                          index={index}
                          isEditing={editState.taskIndex === index}
                          onEdit={handleEditStart}
                          onSave={handleEditSave}
                          onReset={handleEditReset}
                          editValue={editState.value}
                          onEditValueChange={(value) =>
                            setEditState((prev) => ({ ...prev, value }))
                          }
                          onModeToggle={handleModeToggle}
                          onCheckToggle={handleCheckToggle}
                          onFlagToggle={handleFlagToggle}
                          onRemove={handleRemove}
                        />
                      ))}
                  </ul>
                ) : (
                  <p className="text-xs text-amber-500 italic mt-3">
                    No flagged tasks yet.
                  </p>
                )}
              </div>

              {/* Unflagged */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                    Unflagged
                  </span>
                </div>
                <ul className="flex flex-col gap-2" aria-label="Task list">
                  {draftTasks
                    .map((task, index) => ({ task, index }))
                    .filter(({ task }) => !task.flagged)
                    .map(({ task, index }) => (
                      <TaskRow
                        key={`${notepad.id}-task-${index}`}
                        task={task}
                        index={index}
                        isEditing={editState.taskIndex === index}
                        onEdit={handleEditStart}
                        onSave={handleEditSave}
                        onReset={handleEditReset}
                        editValue={editState.value}
                        onEditValueChange={(value) =>
                          setEditState((prev) => ({ ...prev, value }))
                        }
                        onModeToggle={handleModeToggle}
                        onCheckToggle={handleCheckToggle}
                        onFlagToggle={handleFlagToggle}
                        onRemove={handleRemove}
                      />
                    ))}
                </ul>
              </div>
            </>
          )}

          {/* ── New task draft (matches existing TaskRow style) ── */}
          <div className="mt-4 flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 mb-1">
              New Task
            </span>
            <ul>
              <li className="flex items-center gap-2 py-2 bg-amber-100 border-b border-amber-300">
                {/* Left indicator toggles draft checked in checkbox mode */}
                <TaskStatusIndicator
                  mode={newTaskDraft.mode}
                  checked={newTaskDraft.checked}
                  onClick={
                    newTaskDraft.mode === "checkbox"
                      ? () =>
                          setNewTaskDraft((prev) => ({
                            ...prev,
                            checked: !prev.checked,
                          }))
                      : undefined
                  }
                />

                {/* Label */}
                <input
                  type="text"
                  value={newTaskDraft.label}
                  onChange={(e) =>
                    setNewTaskDraft((prev) => ({
                      ...prev,
                      label: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddNewTask();
                  }}
                  placeholder="Task description…"
                  className={[
                    "flex-1 bg-transparent outline-none text-sm text-amber-900 placeholder-amber-600 min-w-0",
                    newTaskDraft.checked ? "line-through opacity-40" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label="New task description"
                />

                {/* Mode toggle */}
                <button
                  type="button"
                  onClick={handleNewDraftModeToggle}
                  title={
                    newTaskDraft.mode === "checkbox"
                      ? "Switch to list item"
                      : "Switch to checkbox"
                  }
                  aria-pressed={newTaskDraft.mode === "checkbox"}
                  className={[
                    "p-1.5 rounded-md transition cursor-pointer",
                    newTaskDraft.mode === "checkbox"
                      ? "text-amber-600 hover:bg-amber-200"
                      : "text-amber-600 hover:bg-amber-200",
                  ].join(" ")}
                >
                  {newTaskDraft.mode === "checkbox" ? (
                    <CheckSquare size={13} aria-hidden />
                  ) : (
                    <List size={13} aria-hidden />
                  )}
                </button>

                {/* Flag */}
                <button
                  type="button"
                  onClick={() =>
                    setNewTaskDraft((prev) => ({
                      ...prev,
                      flagged: !prev.flagged,
                    }))
                  }
                  title={newTaskDraft.flagged ? "Remove flag" : "Flag as priority"}
                  aria-pressed={newTaskDraft.flagged}
                  className={[
                    "p-1.5 rounded-md transition cursor-pointer",
                    newTaskDraft.flagged
                      ? "bg-red-100 text-red-500"
                      : "text-amber-600 hover:bg-amber-200",
                  ].join(" ")}
                >
                  <Flag size={13} aria-hidden />
                </button>

                {/* Clear */}
                <button
                  type="button"
                  onClick={() => setNewTaskDraft(BLANK_DRAFT)}
                  title="Clear"
                  aria-label="Clear new task"
                  className="p-1.5 rounded-md transition cursor-pointer text-amber-600 hover:bg-red-100 hover:text-red-500"
                >
                  <Trash2 size={13} aria-hidden />
                </button>
              </li>
            </ul>

            <button
              type="button"
              onClick={handleAddNewTask}
              className="mt-3 flex items-center gap-2 text-xs text-amber-700 hover:text-amber-900 hover:bg-amber-200 px-3 py-2 rounded-lg border border-dashed border-amber-300 transition w-full justify-center font-medium uppercase tracking-wide cursor-pointer"
            >
              <Plus size={13} />
              Add Task
            </button>
          </div>

          {/* Validation error */}
          {validationError && (
            <p className="mt-2 text-[11px] text-red-500 font-medium px-1">
              {validationError}
            </p>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 px-5 py-3 flex items-center justify-between gap-2 bg-amber-100 border-t border-amber-200">
          {totalCount > 0 ? (
            <div className="flex-1 pr-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-amber-700 font-medium uppercase tracking-wide">
                  Progress
                </span>
                <span className="text-[10px] text-amber-700">
                  {completedCount}/{totalCount}
                </span>
              </div>
              <div className="w-full h-1 bg-amber-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-amber-300 text-amber-800 hover:bg-amber-200 transition uppercase cursor-pointer"
            >
              Close
            </button>
            {hasChanges && (
              <>
                <button
                  type="button"
                  onClick={handleFooterReset}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-amber-800 hover:bg-amber-200 transition uppercase border border-amber-300 cursor-pointer"
                >
                  <RotateCcw size={13} aria-hidden />
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 cursor-pointer transition uppercase shadow"
                >
                  <Send size={13} aria-hidden />
                  Submit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
