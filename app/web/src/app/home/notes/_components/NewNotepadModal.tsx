/**
 * @file NewNotepadModal.tsx
 * @description Modal dialog for creating a new notepad with a dynamic task list.
 */

"use client";

import {
  useState,
  useReducer,
  useRef,
  useEffect,
  useCallback,
  memo,
} from "react";
import {
  X,
  Plus,
  Trash2,
  Flag,
  List,
  CheckSquare,
  NotepadText,
  RotateCcw,
  Send,
  Info,
} from "lucide-react";
import type { NotepadCardData, TaskItemData } from "./NotepadCard";

// ─── DraftTask ────────────────────────────────────────────────────────────────

/**
 * Working copy of a task being edited inside the modal.
 * Maps 1-to-1 with `TaskItemData` once submitted, minus the stable `id` key.
 */
interface DraftTask {
  /** Stable React key; never mutated after creation. */
  id: string;
  /** User-provided task description. */
  label: string;
  /** Whether the task starts as checked. */
  checked: boolean;
  /** Whether the task is marked high-priority. */
  flagged: boolean;
  /**
   * Rendering mode:
   * - `"checkbox"` — amber checkbox indicator on the left
   * - `"list"`     — plain bullet dot on the left
   */
  mode: "checkbox" | "list";
}

/** Returns a fresh, empty DraftTask with a unique stable id. */
const blankTask = (): DraftTask => ({
  id: crypto.randomUUID(),
  label: "",
  checked: false,
  flagged: false,
  mode: "checkbox",
});

// ─── Modal state — useReducer ─────────────────────────────────────────────────

interface ModalState {
  title: string;
  tasks: DraftTask[];
}

type ModalAction =
  | { type: "SET_TITLE"; title: string }
  | { type: "ADD_TASK" }
  | { type: "UPDATE_TASK"; index: number; task: DraftTask }
  | { type: "REMOVE_TASK"; index: number }
  | { type: "RESET" };

const INITIAL_STATE: ModalState = { title: "", tasks: [blankTask()] };

/**
 * Pure reducer for the modal form.
 * All state mutations live here for easy tracing and testing.
 */
function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case "SET_TITLE":
      return { ...state, title: action.title };
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, blankTask()] };
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((t, i) => (i === action.index ? action.task : t)),
      };
    case "REMOVE_TASK":
      return { ...state, tasks: state.tasks.filter((_, i) => i !== action.index) };
    case "RESET":
      return { title: "", tasks: [blankTask()] };
    default:
      return state;
  }
}

// ─── TaskRow ──────────────────────────────────────────────────────────────────

interface TaskRowProps {
  /** The draft task to display and edit. */
  task: DraftTask;
  /** Called with the updated task whenever any field changes. */
  onChange: (updated: DraftTask) => void;
  /** Called when the user clicks the remove button. */
  onRemove: () => void;
}

/**
 * Single editable task row inside the modal.
 *
 * Controls:
 *  - Label text input
 *  - Mode toggle (checkbox ↔ list)
 *  - Flag toggle
 *  - Remove button
 *
 * Wrapped in `React.memo` — re-renders only when its own props change.
 */
const TaskRow = memo(function TaskRow({ task, onChange, onRemove }: TaskRowProps) {
  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...task, label: e.target.value }),
    [task, onChange]
  );

  const handleModeToggle = useCallback(
    () =>
      onChange({ ...task, mode: task.mode === "checkbox" ? "list" : "checkbox" }),
    [task, onChange]
  );

  const handleFlagToggle = useCallback(
    () => onChange({ ...task, flagged: !task.flagged }),
    [task, onChange]
  );

  return (
    <li className="flex items-center gap-2 group rounded-lg px-3 py-2 bg-amber-100">
      {/* Leading mode indicator (non-interactive preview) */}
      {task.mode === "list" ? (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" aria-hidden />
      ) : (
        <span
          className={[
            "w-3.5 h-3.5 rounded border shrink-0",
            task.checked
              ? "border-amber-600 bg-amber-500"
              : "border-amber-400 bg-transparent",
          ].join(" ")}
          aria-hidden
        />
      )}

      {/* Label input */}
      <input
        type="text"
        value={task.label}
        onChange={handleLabelChange}
        placeholder="Task description…"
        className="flex-1 bg-transparent outline-none text-sm text-amber-900 placeholder-amber-600 min-w-0"
        aria-label="Task description"
      />

      {/* Mode toggle: checkbox ↔ list */}
      <button
        type="button"
        onClick={handleModeToggle}
        title={task.mode === "checkbox" ? "Switch to list item" : "Switch to checkbox"}
        aria-pressed={task.mode === "checkbox"}
        className={[
          "p-1.5 rounded-md transition cursor-pointer",
          task.mode === "checkbox"
            ? "bg-amber-200 text-amber-800"
            : "text-amber-600 hover:bg-amber-200",
        ].join(" ")}
      >
        {task.mode === "checkbox" ? <CheckSquare size={14} /> : <List size={14} />}
      </button>

      {/* Flag toggle */}
      <button
        type="button"
        onClick={handleFlagToggle}
        title={task.flagged ? "Remove flag" : "Flag as priority"}
        aria-pressed={task.flagged}
        className={[
          "p-1.5 rounded-md transition cursor-pointer",
          task.flagged
            ? "bg-red-100 text-red-500"
            : "text-amber-600 hover:bg-amber-200",
        ].join(" ")}
      >
        <Flag size={14} />
      </button>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        title="Remove task"
        aria-label="Remove task"
        className="p-1.5 rounded-md text-amber-600 hover:bg-red-100 hover:text-red-500 cursor-pointer transition"
      >
        <Trash2 size={14} />
      </button>
    </li>
  );
});

// ─── NewNotepadModal ──────────────────────────────────────────────────────────

interface NewNotepadModalProps {
  /** Controls visibility. */
  open: boolean;
  /** Called when the modal should close without submitting. */
  onClose: () => void;
  /**
   * Called on submit with the assembled `NotepadCardData`.
   * Empty-label tasks are automatically stripped before this fires.
   */
  onSubmit: (data: NotepadCardData) => void;
}

/**
 * Full-screen modal for creating a new notepad.
 *
 * - Renders `null` when `open` is false (zero DOM cost when hidden).
 * - Resets internal state each time `open` transitions to `true`.
 * - Validates that at least one task has a non-empty label before submitting.
 *
 * @example
 * ```tsx
 * <NewNotepadModal
 *   open={modalOpen}
 *   onClose={() => setModalOpen(false)}
 *   onSubmit={(data) => setNotepads((prev) => [data, ...prev])}
 * />
 * ```
 */
export function NewNotepadModal({ open, onClose, onSubmit }: NewNotepadModalProps) {
  const [state, dispatch] = useReducer(modalReducer, INITIAL_STATE);
  /** Inline validation message shown when submit conditions aren't met. */
  const [validationError, setValidationError] = useState<string | null>(null);

  /** Reset form each time the modal opens. */
  useEffect(() => {
    if (open) {
      dispatch({ type: "RESET" });
      setValidationError(null);
    }
  }, [open]);

  /** Builds `NotepadCardData` from the current draft and fires `onSubmit`. */
  const handleSubmit = useCallback(() => {
    const validTasks = state.tasks.filter((t) => t.label.trim() !== "");
    if (validTasks.length === 0) {
      setValidationError("Add at least one task with a label.");
      return;
    }
    setValidationError(null);
    const cardData: NotepadCardData = {
      id: `notepad-${Date.now()}`,
      title: state.title.trim() || "Untitled Notepad",
      tasks: validTasks.map((t): TaskItemData => ({
        label: t.label.trim(),
        checked: t.checked,
        flagged: t.flagged,
        mode: t.mode,
      })),
    };
    onSubmit(cardData);
    onClose();
  }, [state, onSubmit, onClose]);

  /** Stable callback for task row updates — avoids re-rendering siblings. */
  const handleUpdateTask = useCallback(
    (index: number, task: DraftTask) =>
      dispatch({ type: "UPDATE_TASK", index, task }),
    []
  );

  /** Stable callback for task removal. */
  const handleRemoveTask = useCallback(
    (index: number) => dispatch({ type: "REMOVE_TASK", index }),
    []
  );

  if (!open) return null;

  return (
    /* Backdrop — click outside the panel to dismiss */
    <div
      role="dialog"
      aria-modal="true"
      aria-label="New Notepad"
      className="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal panel — mirrors NotepadCard design language */}
      <div className="relative w-full max-w-lg mx-4 rounded-2xl bg-amber-100 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">

        {/* ── Header ── */}
        <div className="w-full h-16 border-b border-amber-300 flex flex-row items-center justify-between px-5 shrink-0">
          <h2 className="text-sm font-semibold text-amber-900 uppercase flex flex-row gap-2 items-center">
            <NotepadText size={16} className="shrink-0 text-amber-700" aria-hidden />
            New Notepad
          </h2>
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

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0 flex flex-col gap-4">

          {/* Notepad title */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="notepad-title"
              className="text-[10px] font-semibold uppercase tracking-wider text-amber-700"
            >
              Notepad Title
            </label>
            <input
              id="notepad-title"
              type="text"
              value={state.title}
              onChange={(e) => dispatch({ type: "SET_TITLE", title: e.target.value })}
              placeholder="e.g. Sprint Tasks, Grocery List…"
              className="w-full px-3 py-2 rounded-lg bg-amber-100 border border-amber-300 text-sm text-amber-900 placeholder-amber-600 outline-none focus:ring-2 focus:ring-amber-400 transition"
            />
          </div>

          {/* Task list */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                Tasks
                {/* Info tooltip — hover to see mode legend */}
                <span className="relative group/legend cursor-default">
                  <Info size={11} className="text-amber-500" aria-label="Task mode legend" />
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute left-0 bottom-full mb-2 z-50
                               w-44 rounded-lg bg-white border border-slate-200 shadow-lg px-3 py-2
                               flex flex-col gap-1
                               opacity-0 scale-95 group-hover/legend:opacity-100 group-hover/legend:scale-100
                               transition-all duration-150 origin-bottom-left"
                  >
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-600 normal-case tracking-normal font-normal">
                      <CheckSquare size={11} className="text-amber-600" aria-hidden /> Checkbox mode
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-600 normal-case tracking-normal font-normal">
                      <List size={11} className="text-amber-600" aria-hidden /> List mode
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-red-400 normal-case tracking-normal font-normal">
                      <Flag size={11} aria-hidden /> Flagged / priority
                    </span>
                  </span>
                </span>
              </span>
              <span className="text-[10px] text-amber-600">
                {state.tasks.length} item{state.tasks.length !== 1 ? "s" : ""}
              </span>
            </div>

            {state.tasks.length === 0 && (
              <p className="text-xs text-amber-500 italic">
                No tasks yet — add one below.
              </p>
            )}

            <ul className="flex flex-col gap-2" aria-label="Task list">
              {state.tasks.map((task, idx) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onChange={(updated) => handleUpdateTask(idx, updated)}
                  onRemove={() => handleRemoveTask(idx)}
                />
              ))}
            </ul>

            {/* Add task */}
            <button
              type="button"
              onClick={() => dispatch({ type: "ADD_TASK" })}
              className="mt-1 flex items-center gap-2 text-xs text-amber-700 hover:text-amber-900 hover:bg-amber-200 px-3 py-2 rounded-lg border border-dashed border-amber-300 transition w-full justify-center font-medium uppercase tracking-wide cursor-pointer"
            >
              <Plus size={13} />
              Add Task
            </button>

            {/* Validation error */}
            {validationError && (
              <p className="text-[11px] text-red-500 font-medium px-1">
                {validationError}
              </p>
            )}
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="shrink-0 border-t border-amber-300 px-5 py-3 flex items-center justify-end gap-2 bg-amber-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-amber-300 text-amber-800 hover:bg-amber-200 transition uppercase cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "RESET" })}
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
        </div>
      </div>
    </div>
  );
}
