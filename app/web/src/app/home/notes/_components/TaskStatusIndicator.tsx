"use client";

import { Check } from "lucide-react";
import { Task, TaskMode } from "../types";

interface TaskStatusIndicatorProps {
  mode: TaskMode;
  checked: boolean;
  showCheck?: boolean;
  className?: string;
  onClick?: () => void;
}

export function TaskStatusIndicator({
  mode,
  checked,
  showCheck = true,
  className,
  onClick,
}: TaskStatusIndicatorProps) {
  if (mode === "list") {
    // Bullet — never interactive
    return (
      <span
        className={["w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0", className]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      />
    );
  }

  const base = [
    "w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center",
    checked
      ? "border-amber-600 bg-amber-500"
      : "border-amber-400 bg-transparent",
    onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (onClick) {
    return (
      <button
        type="button"
        className={base}
        onClick={onClick}
        title={checked ? "Mark pending" : "Mark completed"}
        aria-label={checked ? "Mark pending" : "Mark completed"}
        aria-pressed={checked}
      >
        {checked && showCheck && (
          <Check size={8} strokeWidth={2.5} className="w-2 h-2 text-white" />
        )}
      </button>
    );
  }

  return (
    <span className={base} aria-label={checked ? "Completed" : "Pending"}>
      {checked && showCheck && (
        <Check size={8} strokeWidth={2.5} className="w-2 h-2 text-white" />
      )}
    </span>
  );
}
