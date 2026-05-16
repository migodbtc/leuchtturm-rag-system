export type TaskItemData = {
  label: string;
  checked: boolean;
  flagged: boolean;
  mode: "checkbox" | "list";
};

export type NotepadCardData = {
  id: string;
  title: string;
  tasks: TaskItemData[];
};
