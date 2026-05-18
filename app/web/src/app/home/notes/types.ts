
// TaskMode: Mirrors Task model's 'mode' property.
export type TaskMode = "checkbox" | "list";

// Task: Mirrors Task model (and by proxy, `tasks` MySQL table)
export type Task = {
  id: number;
  notepad_id: number;
  label: string;
  checked: boolean;
  flagged: boolean;
  mode: TaskMode;
};

// Notepad: Mirrors Notepad model (and by proxy, `notepads` MySQL table)
export type Notepad = {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  tasks: Task[];
};