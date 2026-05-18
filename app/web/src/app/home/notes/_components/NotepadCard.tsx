import { Eye, Trash2, NotepadText, FlagIcon } from "lucide-react";
import type { Notepad, Task, TaskMode } from "../types";
import { TaskStatusIndicator } from "./TaskStatusIndicator";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/utils/motion";
import { Dispatch, SetStateAction } from "react";

// ─── TaskItem ────────────────────────────────────────────────────────────────

interface TaskItemProps {
  task: Task;
}

function TaskItem({ task }: TaskItemProps) {
  return (
    <li className="flex items-center gap-2 text-sm text-amber-900">
      {/* Leading indicator */}
      <TaskStatusIndicator
        mode={task.mode}
        checked={task.checked}
        showCheck
        className="transition-colors"
      />

      {/* Label — crossed out when checked */}
      <span
        className={[
          "flex-1 leading-snug",
          task.checked == true ? "line-through opacity-40" : "",
        ].join(" ")}
      >
        {task.label}
      </span>

      {/* Priority flag dot */}
      {task.flagged && (
        <span
          title="Flagged"
          className="inline-block rounded-full bg-red-400 shrink-0 text-sm px-2 py-0.5"
        >
          <FlagIcon size={15} className="text-red-900" />
        </span>
      )}
    </li>
  );
}

// ─── NotepadCard ─────────────────────────────────────────────────────────────

interface NotepadCardProps {
  notepad: Notepad;
  setSelectedNotepad: Dispatch<SetStateAction<Notepad | null>>;
  onView?: (id: number) => void;
  onDelete: () => void;
}

export function NotepadCard({
  notepad,
  setSelectedNotepad,
  onView,
  onDelete,
}: NotepadCardProps) {
  const completedCount = notepad.tasks.filter((t) => t.checked).length;
  const totalCount = notepad.tasks.length;

  return (
    <motion.div
      className="rounded-xl bg-amber-100 aspect-square flex flex-col overflow-hidden"
      variants={containerVariants}
    >
      {/* ── Header ── */}
      <div className="w-full h-16 border-b border-amber-300 flex flex-row items-center justify-between px-4 shrink-0">
        <h3 className="text-sm font-semibold text-amber-900 truncate uppercase flex flex-row gap-2 items-center min-w-0">
          <NotepadText size={16} className="shrink-0" />
          <span className="truncate">{notepad.title}</span>
        </h3>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={() => onView?.(notepad.id)}
            className="cursor-pointer p-1 text-amber-700 hover:bg-amber-200 rounded transition"
            title="View notepad"
            aria-label={`View ${notepad.title}`}
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => {
              setSelectedNotepad(notepad);
              onDelete();
            }}
            className="cursor-pointer p-1 text-amber-700 hover:bg-amber-200 rounded transition"
            title="Delete notepad"
            aria-label={`Delete ${notepad.title}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* ── Task list ── */}
      <div className="flex-1 overflow-y-hidden px-4 py-3 min-h-0">
        {notepad.tasks.length === 0 ? (
          <p className="text-xs text-amber-600 italic">No tasks yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {notepad.tasks.map((task, idx) => (
              <TaskItem key={idx} task={task} />
            ))}
          </ul>
        )}
      </div>

      {/* ── Footer progress ── */}
      {totalCount > 0 && (
        <div className="px-4 pb-3 pt-1 shrink-0">
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
      )}
    </motion.div>
  );
}
