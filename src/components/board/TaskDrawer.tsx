import React, { useState, useEffect, useCallback } from "react";
import type { Task } from "../../api/board";
import { useBoardStore } from "../../stores/board.store";
interface TaskDrawerProps {
  task: Task | null;
  onClose: () => void;
}
const STATUSES: Task["status"][] = ["Backlog", "In Progress", "Review", "Done"];
const PRIORITIES: Task["priority"][] = ["Low", "Medium", "High"];
const STATUS_COLORS: Record<Task["status"], string> = {
  Backlog: "bg-gray-100 text-gray-700 border-gray-300",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-300",
  Review: "bg-purple-100 text-purple-700 border-purple-300",
  Done: "bg-green-100 text-green-700 border-green-300",
};
const PRIORITY_COLORS: Record<Task["priority"], string> = {
  Low: "bg-sky-100 text-sky-700 border-sky-300",
  Medium: "bg-amber-100 text-amber-700 border-amber-300",
  High: "bg-red-100 text-red-700 border-red-300",
};
export const TaskDrawer: React.FC<TaskDrawerProps> = ({ task, onClose }) => {
  const { updateTask, deleteTask } = useBoardStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Task["status"]>("Backlog");
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [isDirty, setIsDirty] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setIsDirty(false);
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [task]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDirty]);
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);
  const handleSave = () => {
    if (!task) return;
    updateTask(task.id, { title, description, status, priority });
    setIsDirty(false);
  };
  const handleDelete = () => {
    if (!task) return;
    if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
      deleteTask(task.id);
      handleClose();
    }
  };
  if (!task) return null;
  const dueDate = new Date(task.dueDate).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return (
    <>
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: "rgba(15,23,42,0.4)",
          opacity: isVisible ? 1 : 0,
          backdropFilter: "blur(2px)",
        }}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Task details"
        className="fixed top-0 right-0 z-50 h-full w-full max-w-[480px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out"
        style={{ transform: isVisible ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
              #{String(task.id).replace("task-", "")}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full border ${STATUS_COLORS[status]}`}
            >
              {status}
            </span>
          </div>
          <button
            id="task-drawer-close"
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close drawer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Title
            </label>
            <input
              id="task-drawer-title"
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setIsDirty(true); }}
              className="w-full text-lg font-semibold text-gray-900 border-0 border-b-2 border-transparent focus:border-blue-500 focus:outline-none bg-transparent pb-1 transition-colors"
              placeholder="Task title"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Status
              </label>
              <div className="flex flex-col gap-1">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    id={`task-drawer-status-${s.toLowerCase().replace(" ", "-")}`}
                    onClick={() => { setStatus(s); setIsDirty(true); }}
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
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Priority
              </label>
              <div className="flex flex-col gap-1">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    id={`task-drawer-priority-${p.toLowerCase()}`}
                    onClick={() => { setPriority(p); setIsDirty(true); }}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Assignee
              </label>
              <div className="flex items-center gap-2">
                {task.assignee?.avatar ? (
                  <img
                    src={task.assignee.avatar}
                    alt={task.assignee.name}
                    className="w-8 h-8 rounded-full ring-2 ring-gray-100"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                    {task.assignee?.name?.charAt(0) ?? "?"}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {task.assignee?.name ?? "Unassigned"}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Due Date
              </label>
              <div className="flex items-center gap-1.5 text-sm text-gray-700">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="font-medium">{dueDate}</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              id="task-drawer-description"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setIsDirty(true); }}
              rows={5}
              className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow leading-relaxed"
              placeholder="Add a description…"
            />
          </div>
          {task.comments && task.comments.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Comments ({task.comments.length})
              </label>
              <div className="space-y-3">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-xs shrink-0 mt-0.5">
                      {comment.author?.charAt(0) ?? "?"}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-700">{comment.author}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            id="task-drawer-delete"
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
            Delete task
          </button>
          <div className="flex items-center gap-2">
            <button
              id="task-drawer-cancel"
              onClick={handleClose}
              className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              id="task-drawer-save"
              onClick={handleSave}
              disabled={!isDirty}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                isDirty
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
