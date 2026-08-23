import React, { useState, useEffect, useRef } from "react";
import type { Task } from "../../api/board";
import { useBoardStore } from "../../stores/board.store";
interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const STATUSES: Task["status"][]   = ["Backlog", "In Progress", "Review", "Done"];
const PRIORITIES: Task["priority"][] = ["Low", "Medium", "High"];
const STATUS_COLORS: Record<Task["status"], string> = {
  Backlog:        "bg-gray-100 text-gray-700 border-gray-300",
  "In Progress":  "bg-blue-100 text-blue-700 border-blue-300",
  Review:         "bg-purple-100 text-purple-700 border-purple-300",
  Done:           "bg-green-100 text-green-700 border-green-300",
};
const PRIORITY_COLORS: Record<Task["priority"], string> = {
  Low:    "bg-sky-100 text-sky-700 border-sky-300",
  Medium: "bg-amber-100 text-amber-700 border-amber-300",
  High:   "bg-red-100 text-red-700 border-red-300",
};
export const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask } = useBoardStore();
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus]         = useState<Task["status"]>("Backlog");
  const [priority, setPriority]     = useState<Task["priority"]>("Medium");
  const [dueDate, setDueDate]       = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [error, setError]           = useState("");
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setStatus("Backlog");
      setPriority("Medium");
      setDueDate(() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d.toISOString().split("T")[0];
      });
      setError("");
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      titleRef.current?.focus();
      return;
    }
    const newTask: Task = {
      id:          `task-${Date.now()}`,
      title:       title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate,
      assignee:    { name: "Unassigned" },
      comments:    [],
    };
    addTask(newTask);
    onClose();
  };
  if (!isOpen) return null;
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create new task"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col animate-[fadeSlideUp_0.2s_ease-out]"
          style={{ animation: "fadeSlideUp 0.2s ease-out" }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Create new task</h2>
            <button
              id="new-task-modal-close"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-5 space-y-5">
              <div>
                <label htmlFor="new-task-title" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="new-task-title"
                  ref={titleRef}
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setError(""); }}
                  placeholder="What needs to be done?"
                  className={`w-full text-sm text-gray-900 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
                    error ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>
              <div>
                <label htmlFor="new-task-description" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  id="new-task-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Add more details…"
                  className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                  <div className="flex flex-col gap-1">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        id={`new-task-status-${s.toLowerCase().replace(" ", "-")}`}
                        onClick={() => setStatus(s)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full border text-left transition-all ${
                          status === s
                            ? `${STATUS_COLORS[s]} ring-2 ring-offset-1 ring-current`
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Priority</label>
                  <div className="flex flex-col gap-1">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        id={`new-task-priority-${p.toLowerCase()}`}
                        onClick={() => setPriority(p)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full border text-left transition-all ${
                          priority === p
                            ? `${PRIORITY_COLORS[p]} ring-2 ring-offset-1 ring-current`
                            : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label htmlFor="new-task-due-date" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Due Date
                </label>
                <input
                  id="new-task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <button
                type="button"
                id="new-task-cancel"
                onClick={onClose}
                className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="new-task-submit"
                className="px-5 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all"
              >
                Create task
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
    </>
  );
};
