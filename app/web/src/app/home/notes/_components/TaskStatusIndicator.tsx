"use client";

import type { TaskItemData } from "../types";

interface TaskStatusIndicatorProps {
  mode: TaskItemData["mode"];
  checked: boolean;
  /** Show a checkmark SVG inside the filled box when checked. Default true. */
  showCheck?: boolean;
  className?: string;
  /** When provided the indicator becomes an interactive button that fires this handler. */
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
    checked ? "border-amber-600 bg-amber-500" : "border-amber-400 bg-transparent",
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
      </button>
    );
  }

  return (
    <span
      className={base}
      aria-label={checked ? "Completed" : "Pending"}
    >
      {checked && showCheck && (
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
  );
}
