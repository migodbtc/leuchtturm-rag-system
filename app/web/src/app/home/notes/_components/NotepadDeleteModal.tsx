import React from "react";
import { Notepad } from "../types";
import { ShieldQuestionMark, Trash2, X } from "lucide-react";

interface NotepadDeleteModalProps {
  open: boolean;
  notepad: Notepad | null;
  onClose: () => void;
  onClick: () => void;
}

const NotepadDeleteModal = ({
  open,
  notepad,
  onClose,
  onClick,
}: NotepadDeleteModalProps) => {
  if (!open || !notepad) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Notepad"
      className="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/40"
    >
      <div className="relative w-full max-w-lg mx-4 rounded-xl bg-amber-100 shadow-2xl flex flex-col overflow-hidden min-h-[40vh]">
        {/* Header */}
        <div className="w-full h-12 flex flex-row align-middle items-center justify-end px-5  shrink-0">
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

        <div className="flex-1 w-full text-center align-middle justify-center items-center ">
          <p className="w-full h-full py-4 flex flex-col gap-2 justify-center items-center text-amber-800 font-semibold text-md">
            <ShieldQuestionMark size={36} />
            <span className="uppercase">Delete notepad?</span>
            <div className="max-w-xs font-normal text-justify ">
              Are you sure you want to delete the list titled `{notepad.title}`?
              In this list, you still have {notepad.tasks.length} tasks assigned
              written down on {new Date(notepad.created_at).toDateString()}.
            </div>
          </p>
        </div>

        {/* Footer */}
        <div className="w-full h-16 flex flex-row align-middle items-center justify-center px-5  shrink-0 ">
          <button
            className="flex items-center px-4 py-2 rounded-lg font-semibold bg-red-400 text-white hover:bg-red-500 cursor-pointer transition uppercase flex-row gap-2 text-sm"
            onClick={onClick}
          >
            <Trash2 />
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotepadDeleteModal;
