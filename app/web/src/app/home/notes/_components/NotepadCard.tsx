import { Eye, Trash2, NotepadText, type LucideIcon } from "lucide-react";

// ─── TaskItem ────────────────────────────────────────────────────────────────

export interface TaskItemData {
  /** A Lucide icon component for the task */
  icon: LucideIcon;
  /** Display label */
  label: string;
  /** Whether the task has been checked off */
  checked: boolean;
  /** Optional flag: marks the item as high-priority */
  flagged?: boolean;
}

interface TaskItemProps {
  task: TaskItemData;
}

function TaskItem({ task }: TaskItemProps) {
  const IconComponent = task.icon;

  return (
    <li className="flex items-center gap-2 text-sm text-amber-900 group">
      {/* Leading icon */}
      <IconComponent size={15} className="text-amber-700 shrink-0" />

      {/* Label — crossed out when checked */}
      <span
        className={[
          "flex-1 leading-snug",
          task.checked ? "line-through opacity-40" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {task.label}
      </span>

      {/* Trailing flags */}
      <span className="flex items-center gap-1 shrink-0">
        {/* Priority flag */}
        {task.flagged && (
          <span
            title="Flagged"
            className="inline-block w-1.5 h-1.5 rounded-full bg-red-400"
          />
        )}

        {/* Checkbox indicator */}
        <span
          className={[
            "w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors",
            task.checked
              ? "border-amber-600 bg-amber-500"
              : "border-amber-400 bg-transparent",
          ].join(" ")}
          aria-label={task.checked ? "Completed" : "Pending"}
        >
          {task.checked && (
            <svg
              viewBox="0 0 10 8"
              fill="none"
              className="w-2 h-2"
              aria-hidden="true"
            >
              <path
                d="M1 4l2.5 2.5L9 1"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </span>
    </li>
  );
}

// ─── NotepadCard ─────────────────────────────────────────────────────────────

export interface NotepadCardData {
  id: string;
  title: string;
  tasks: TaskItemData[];
}

interface NotepadCardProps {
  notepad: NotepadCardData;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NotepadCard({ notepad, onView, onDelete }: NotepadCardProps) {
  const completedCount = notepad.tasks.filter((t) => t.checked).length;
  const totalCount = notepad.tasks.length;

  return (
    <div className="rounded-xl bg-amber-100 aspect-square flex flex-col overflow-hidden">
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
            onClick={() => onDelete?.(notepad.id)}
            className="cursor-pointer p-1 text-amber-700 hover:bg-amber-200 rounded transition"
            title="Delete notepad"
            aria-label={`Delete ${notepad.title}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* ── Task list ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
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
    </div>
  );
}
