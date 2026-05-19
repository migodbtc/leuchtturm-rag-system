"use client";

import { useState, useReducer, useEffect, useCallback, memo } from "react";
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
import type { Notepad, Task, TaskMode } from "../types";
import { TaskRow } from "./NewNotepadTask";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/utils/motion";

// ### DRAFT REDUCER ###

// DraftState: Made from picking Notepad's title and tasks property for modal-only purposes
// DraftActions: Possible draft actions in order to modify the draft reducer (see below)
type DraftState = Pick<Notepad, "title" | "tasks">;
type DraftActions =
  | { type: "SET_TITLE"; title: string }
  | { type: "ADD_TASK" }
  | { type: "UPDATE_TASK"; index: number; task: Task }
  | { type: "REMOVE_TASK"; index: number }
  | { type: "RESET" };

// INITIAL_STATE: The initial state of the modal before any changes are updated.
const INITIAL_STATE: DraftState = { title: "", tasks: [] };

// emptyTask: An empty task, usually for initializing a new task.
const emptyTask = (): Task => ({
  id: 0,
  notepad_id: 0,
  label: "",
  checked: false,
  flagged: false,
  mode: "checkbox",
});

function isTaskDirty(task: Task): boolean {
  return task.label.trim() !== "";
}

function isDirty(state: DraftState): boolean {
  if (state.title.trim() !== "") return true;

  return state.tasks.some(isTaskDirty);
}

function draftReducer(state: DraftState, action: DraftActions): DraftState {
  switch (action.type) {
    case "SET_TITLE":
      return { ...state, title: action.title };
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, emptyTask()] };
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
      return { title: "", tasks: [] };
    default:
      return state;
  }
}

interface NewNotepadModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (title: string, tasks: Task[]) => void;
}

export function NewNotepadModal({
  open,
  onClose,
  onSubmit,
}: NewNotepadModalProps) {
  // State variables: useReducer contains the earlier draft reducer configurations,
  // while validation error exists for UI rendering + error callbacks.
  const [state, dispatch] = useReducer(draftReducer, INITIAL_STATE);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Reset Effect: Reset the contents of the modal every time it is opened again
  // Persistent saving is not yet implemented (let them suffer)
  useEffect(() => {
    if (open) {
      dispatch({ type: "RESET" });
      setValidationError(null);
    }
  }, [open]);

  // Additional properties
  const completedCount = state.tasks.filter((t) => t.checked).length;
  const totalCount = state.tasks.length;
  const hasChanges = isDirty(state);

  // handler-functions/submit: Handles the validation of the input before submission (see page.tsx)
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
    onSubmit(trimmedTitle, validTasks);
    onClose();
  }, [state, onSubmit, onClose]);

  // handler-functions/update: Handles the change of properties and/or values of the TaskRow
  const handleUpdateTask = useCallback(
    (index: number, task: Task) =>
      dispatch({ type: "UPDATE_TASK", index, task }),
    [],
  );

  // handler-functions/remove: Handles the deletion of (draft) tasks
  const handleRemoveTask = useCallback(
    (index: number) => dispatch({ type: "REMOVE_TASK", index }),
    [],
  );

  if (!open) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial={"hidden"}
      animate="visible"
      role="dialog"
      aria-modal="true"
      aria-label="New Notepad"
      className="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        variants={itemVariants}
        className="relative w-full max-w-lg mx-4 rounded-xl bg-amber-100 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="w-full h-12 flex flex-row items-center justify-between px-5 pt-4 shrink-0"
        >
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
              className="flex-1 bg-transparent outline-none text-sm font-semibold text-amber-900 placeholder-amber-500/50 min-w-0"
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
        </motion.div>

        {/* Body */}
        <motion.div
          variants={itemVariants}
          className="flex-1 overflow-y-auto px-5 py-4 min-h-0 flex flex-col"
        >
          <motion.div variants={itemVariants} className="flex flex-col">
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
                    className="pointer-events-none absolute left-0 bottom-full mb-2 z-50 w-52 rounded-lg bg-white border border-slate-200 shadow-lg px-3 py-2 flex flex-col gap-1 opacity-0 scale-95 group-hover/legend:opacity-100 group-hover/legend:scale-100 transition-all duration-150 origin-bottom-left"
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

            {state.tasks.length === 0 ? (
              <motion.p
                variants={itemVariants}
                className="text-xs text-amber-500 italic mb-3"
              >
                No tasks yet — add one below.
              </motion.p>
            ) : (
              <>
                {state.tasks.some((t) => t.flagged) && (
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col mb-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                        Flagged
                      </span>
                    </div>
                    <ul
                      className="flex flex-col gap-2"
                      aria-label="Flagged tasks"
                    >
                      {state.tasks
                        .map((task, index) => ({ task, index }))
                        .filter(({ task }) => task.flagged)
                        .map(({ task, index }) => (
                          <TaskRow
                            key={index}
                            task={task}
                            onChange={(updated) =>
                              handleUpdateTask(index, updated)
                            }
                            onRemove={() => handleRemoveTask(index)}
                          />
                        ))}
                    </ul>
                  </motion.div>
                )}

                {state.tasks.some((t) => !t.flagged) && (
                  <motion.div variants={itemVariants} className="flex flex-col">
                    <div className="flex items-center justify-between">
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
                            key={index}
                            task={task}
                            onChange={(updated) =>
                              handleUpdateTask(index, updated)
                            }
                            onRemove={() => handleRemoveTask(index)}
                          />
                        ))}
                    </ul>
                  </motion.div>
                )}
              </>
            )}

            <motion.button
              variants={itemVariants}
              type="button"
              onClick={() => dispatch({ type: "ADD_TASK" })}
              className="mt-3 flex items-center gap-2 text-xs text-amber-700 hover:text-amber-900 hover:bg-amber-200 px-3 py-2 rounded-lg border border-dashed border-amber-300 transition w-full justify-center font-medium uppercase tracking-wide cursor-pointer"
            >
              <Plus size={13} />
              Add Task
            </motion.button>

            {validationError && (
              <p className="mt-2 text-[11px] text-red-500 font-medium px-1">
                {validationError}
              </p>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="shrink-0 px-5 py-3 flex items-center justify-between gap-2 bg-amber-100 border-t border-amber-200"
        >
          {totalCount > 0 ? (
            <motion.div variants={itemVariants} className="flex-1 pr-4">
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
            </motion.div>
          ) : (
            <div className="flex-1" />
          )}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-end gap-2"
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-amber-300 text-amber-800 hover:bg-amber-200 transition uppercase cursor-pointer"
            >
              Close
            </button>
            {hasChanges && (
              <>
                <motion.button
                  variants={itemVariants}
                  type="button"
                  onClick={() => dispatch({ type: "RESET" })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-amber-800 hover:bg-amber-200 transition uppercase border border-amber-300 cursor-pointer"
                >
                  <RotateCcw size={13} aria-hidden />
                  Reset
                </motion.button>
                <motion.button
                  variants={itemVariants}
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 cursor-pointer transition uppercase shadow"
                >
                  <Send size={13} aria-hidden />
                  Submit
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
