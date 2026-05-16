/**
 * @file NewNotepadModal.tsx
 * @description Modal dialog for creating a new notepad with a dynamic task list.
 */

"use client";

import {
  useState,
  useReducer,
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
import type { NotepadCardData, TaskItemData } from "../types";
import { TaskStatusIndicator } from "./TaskStatusIndicator";

// ─── DraftTask ────────────────────────────────────────────────────────────────

/**
 * Working copy of a task being edited inside the modal.
 * Maps 1-to-1 with `TaskItemData` once submitted, minus the stable `id` key.
 */
interface DraftTask {
  id: string;
  label: string;
  checked: boolean;
  flagged: boolean;
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

function hasDraftChanges(state: ModalState) {
  if (state.title.trim() !== "") return true;
  if (state.tasks.length !== 1) return true;
  const base = state.tasks[0];
  return (
    base.label.trim() !== "" ||
    base.checked ||
    base.flagged ||
    base.mode !== "checkbox"
  );
}

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
        tasks: state.tasks.map((t, i) =>
          i === action.index ? action.task : t,
        ),
      };
    case "REMOVE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((_, i) => i !== action.index),
      };
    case "RESET":
      return { title: "", tasks: [blankTask()] };
    default:
      return state;
  }
}

// ─── TaskRow ──────────────────────────────────────────────────────────────────

interface TaskRowProps {
  task: DraftTask;
  onChange: (updated: DraftTask) => void;
  onRemove: () => void;
}

const TaskRow = memo(function TaskRow({
  task,
  onChange,
  onRemove,
}: TaskRowProps) {
  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...task, label: e.target.value }),
    [task, onChange],
  );

  /** Toggling to list mode always resets checked state. */
  const handleModeToggle = useCallback(
    () =>
      onChange({
        ...task,
        mode: task.mode === "checkbox" ? "list" : "checkbox",
        // reset completion when leaving checkbox mode
        checked: task.mode === "checkbox" ? false : task.checked,
      }),
    [task, onChange],
  );

  const handleCheckToggle = useCallback(
    () => onChange({ ...task, checked: !task.checked }),
    [task, onChange],
  );

  const handleFlagToggle = useCallback(
    () => onChange({ ...task, flagged: !task.flagged }),
    [task, onChange],
  );

  return (
    <li className="flex items-center gap-2 group py-2 bg-amber-100 border-b border-amber-300">
      {/* Left indicator — clicks toggle checked (only active in checkbox mode) */}
      <TaskStatusIndicator
        mode={task.mode}
        checked={task.checked}
        onClick={task.mode === "checkbox" ? handleCheckToggle : undefined}
      />

      {/* Label input */}
      <input
        type="text"
        value={task.label}
        onChange={handleLabelChange}
        placeholder="Task description…"
        className={[
          "flex-1 bg-transparent outline-none text-sm text-amber-900 placeholder-amber-600 min-w-0",
          task.checked ? "line-through opacity-40" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Task description"
      />

      {/* Mode toggle: checkbox ↔ list */}
      <button
        type="button"
        onClick={handleModeToggle}
        title={
          task.mode === "checkbox"
            ? "Switch to list item"
            : "Switch to checkbox"
        }
        aria-pressed={task.mode === "checkbox"}
        className={[
          "p-1.5 rounded-md transition cursor-pointer",
          task.mode === "checkbox"
            ? "text-amber-600 hover:bg-amber-200"
            : "text-amber-600 hover:bg-amber-200",
        ].join(" ")}
      >
        {task.mode === "checkbox" ? (
          <CheckSquare size={13} />
        ) : (
          <List size={13} />
        )}
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
        <Flag size={13} />
      </button>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        title="Remove task"
        aria-label="Remove task"
        className="p-1.5 rounded-md text-amber-600 hover:bg-red-100 hover:text-red-500 cursor-pointer transition"
      >
        <Trash2 size={13} />
      </button>
    </li>
  );
});

// ─── NewNotepadModal ──────────────────────────────────────────────────────────

interface NewNotepadModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NotepadCardData) => void;
}

export function NewNotepadModal({
  open,
  onClose,
  onSubmit,
}: NewNotepadModalProps) {
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

  const completedCount = state.tasks.filter((t) => t.checked).length;
  const totalCount = state.tasks.length;
  const hasChanges = hasDraftChanges(state);

  /** Validates then builds `NotepadCardData` from the current draft and fires `onSubmit`. */
  const handleSubmit = useCallback(() => {
    const trimmedTitle = state.title.trim();
    const validTasks = state.tasks.filter((t) => t.label.trim() !== "");

    if (trimmedTitle === "") {
      setValidationError("Please add a title before submitting.");
      return;
    }
    if (validTasks.length === 0) {
      setValidationError("Add at least one task with a label.");
      return;
    }

    setValidationError(null);
    const cardData: NotepadCardData = {
      id: `notepad-${Date.now()}`,
      title: trimmedTitle,
      tasks: validTasks.map(
        (t): TaskItemData => ({
          label: t.label.trim(),
          checked: t.checked,
          flagged: t.flagged,
          mode: t.mode,
        }),
      ),
    };
    console.log("[NewNotepadModal] handleSubmit payload:", cardData);
    onSubmit(cardData);
    onClose();
  }, [state, onSubmit, onClose]);

  /** Stable callback for task row updates — avoids re-rendering siblings. */
  const handleUpdateTask = useCallback(
    (index: number, task: DraftTask) =>
      dispatch({ type: "UPDATE_TASK", index, task }),
    [],
  );

  /** Stable callback for task removal. */
  const handleRemoveTask = useCallback(
    (index: number) => dispatch({ type: "REMOVE_TASK", index }),
    [],
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
      <div className="relative w-full max-w-lg mx-4 rounded-xl bg-amber-100 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* ── Header ── */}
        <div className="w-full h-12 flex flex-row items-center justify-between px-5 pt-4 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <NotepadText
              size={16}
              className="shrink-0 text-amber-700"
              aria-hidden
            />
            <input
              type="text"
              value={state.title}
              onChange={(e) =>
                dispatch({ type: "SET_TITLE", title: e.target.value })
              }
              placeholder="Untitled Notepad"
              className="flex-1 bg-transparent outline-none text-sm font-semibold text-amber-900 placeholder-amber-600 min-w-0"
              aria-label="Notepad title"
            />
          </div>
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
        <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0 flex flex-col">
          {/* Task list */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 text-md font-semibold uppercase tracking-wider text-amber-700">
                Notepad List
                <span className="relative group/legend cursor-default">
                  <Info
                    size={11}
                    className="text-amber-500"
                    aria-label="Task mode legend"
                  />
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute left-0 bottom-full mb-2 z-50
                               w-52 rounded-lg bg-white border border-slate-200 shadow-lg px-3 py-2
                               flex flex-col gap-1
                               opacity-0 scale-95 group-hover/legend:opacity-100 group-hover/legend:scale-100
                               transition-all duration-150 origin-bottom-left"
                  >
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-600 normal-case tracking-normal font-normal">
                      <CheckSquare
                        size={11}
                        className="text-amber-600"
                        aria-hidden
                      />{" "}
                      Checkbox mode — click the left box to complete
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-slate-600 normal-case tracking-normal font-normal">
                      <List size={11} className="text-amber-600" aria-hidden />{" "}
                      List mode (no completion)
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-red-400 normal-case tracking-normal font-normal">
                      <Flag size={11} aria-hidden /> Flagged / priority
                    </span>
                  </span>
                </span>
              </span>
              <span className="text-[10px] text-amber-600">
                {totalCount} item{totalCount !== 1 ? "s" : ""}
              </span>
            </div>

            {state.tasks.length === 0 && (
              <p className="text-xs text-amber-500 italic mb-3">
                No tasks yet — add one below.
              </p>
            )}

            {/* Flagged section */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                  Flagged
                </span>
              </div>
              {state.tasks.some((task) => task.flagged) ? (
                <ul className="flex flex-col gap-2" aria-label="Flagged tasks">
                  {state.tasks
                    .map((task, index) => ({ task, index }))
                    .filter(({ task }) => task.flagged)
                    .map(({ task, index }) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onChange={(updated) => handleUpdateTask(index, updated)}
                        onRemove={() => handleRemoveTask(index)}
                      />
                    ))}
                </ul>
              ) : (
                <p className="text-xs text-amber-500 italic mt-3">
                  No flagged tasks yet.
                </p>
              )}
            </div>

            {/* Unflagged section */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mt-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                  Unflagged
                </span>
              </div>
              <ul className="flex flex-col gap-2" aria-label="Task list">
                {state.tasks
                  .map((task, index) => ({ task, index }))
                  .filter(({ task }) => !task.flagged)
                  .map(({ task, index }) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onChange={(updated) => handleUpdateTask(index, updated)}
                      onRemove={() => handleRemoveTask(index)}
                    />
                  ))}
              </ul>
            </div>

            {/* Add task */}
            <button
              type="button"
              onClick={() => dispatch({ type: "ADD_TASK" })}
              className="mt-3 flex items-center gap-2 text-xs text-amber-700 hover:text-amber-900 hover:bg-amber-200 px-3 py-2 rounded-lg border border-dashed border-amber-300 transition w-full justify-center font-medium uppercase tracking-wide cursor-pointer"
            >
              <Plus size={13} />
              Add Task
            </button>

            {/* Validation error */}
            {validationError && (
              <p className="mt-2 text-[11px] text-red-500 font-medium px-1">
                {validationError}
              </p>
            )}
          </div>
        </div>

        {/* ── Footer actions ── */}
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
              <button
                type="button"
                onClick={() => dispatch({ type: "RESET" })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-amber-800 hover:bg-amber-200 transition uppercase border border-amber-300 cursor-pointer"
              >
                <RotateCcw size={13} aria-hidden />
                Reset
              </button>
            )}
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
    </div>
  );
}
