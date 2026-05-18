// ─── TaskRow ──────────────────────────────────────────────────────────────────

import { memo, useCallback } from "react";
import { Task, TaskMode } from "../types";
import { TaskStatusIndicator } from "./TaskStatusIndicator";
import { CheckSquare, Flag, List, Trash2 } from "lucide-react";

interface TaskRowProps {
  task: Task;
  onChange: (updated: Task) => void;
  onRemove: () => void;
}

export const TaskRow = memo(function TaskRow({ task, onChange, onRemove }: TaskRowProps) {
  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...task, label: e.target.value }),
    [task, onChange],
  );

  const handleModeToggle = useCallback(() =>
    onChange({
      ...task,
      mode: (task.mode === "checkbox" ? "list" : "checkbox") as TaskMode,
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
      <TaskStatusIndicator
        mode={task.mode}
        checked={task.checked}
        onClick={task.mode === "checkbox" ? handleCheckToggle : undefined}
      />

      <input
        type="text"
        value={task.label}
        onChange={handleLabelChange}
        placeholder="Task description…"
        className={[
          "flex-1 bg-transparent outline-none text-sm text-amber-900 placeholder-amber-600 min-w-0",
          task.checked ? "line-through opacity-40" : "",
        ].filter(Boolean).join(" ")}
        aria-label="Task description"
      />

      <button
        type="button"
        onClick={handleModeToggle}
        title={task.mode === "checkbox" ? "Switch to list item" : "Switch to checkbox"}
        aria-pressed={task.mode === "checkbox"}
        className="p-1.5 rounded-md transition cursor-pointer text-amber-600 hover:bg-amber-200"
      >
        {task.mode === "checkbox" ? <CheckSquare size={13} /> : <List size={13} />}
      </button>

      <button
        type="button"
        onClick={handleFlagToggle}
        title={task.flagged ? "Remove flag" : "Flag as priority"}
        aria-pressed={task.flagged}
        className={["p-1.5 rounded-md transition cursor-pointer", task.flagged ? "bg-red-100 text-red-500" : "text-amber-600 hover:bg-amber-200"].join(" ")}
      >
        <Flag size={13} />
      </button>

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
