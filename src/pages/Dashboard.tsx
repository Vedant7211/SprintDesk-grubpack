import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ListTodo, Circle, Clock, CheckCircle2, ArrowRight, Check } from "lucide-react";
import { useAuthStore } from "../stores/auth.store";
import { useBoardStore } from "../stores/board.store";
import { fetchTasks } from "../api/board";
import type { Task } from "../api/board";
const PRIORITY_COLORS: Record<Task["priority"], string> = {
  High:   "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low:    "bg-sky-100 text-sky-700",
};
const STATUS_DOT: Record<Task["status"], string> = {
  Backlog:        "bg-gray-400",
  "In Progress":  "bg-blue-500",
  Review:         "bg-purple-500",
  Done:           "bg-green-500",
};
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}
const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, bg }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg}`}>
      <span className={color}>{icon}</span>
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold mt-0.5 ${color}`}>{value}</p>
    </div>
  </div>
);
const Dashboard: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { seedInitialData, isInitialized, tasks } = useBoardStore();
  const { data } = useQuery({
    queryKey: ["tasks", "initial"],
    queryFn: fetchTasks,
    enabled: !isInitialized,
    staleTime: Infinity,
  });
  useEffect(() => {
    if (data && !isInitialized) seedInitialData(data);
  }, [data, isInitialized, seedInitialData]);
  const taskList = useMemo(() => Object.values(tasks), [tasks]);
  const total      = taskList.length;
  const todo       = taskList.filter((t) => t.status === "Backlog").length;
  const inProgress = taskList.filter((t) => t.status === "In Progress").length;
  const review     = taskList.filter((t) => t.status === "Review").length;
  const done       = taskList.filter((t) => t.status === "Done").length;
  const pct        = total ? Math.round((done / total) * 100) : 0;
  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  const activeTasks = taskList
    .filter((t) => t.status === "In Progress" || t.status === "Review" || t.status === "Backlog")
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 5);
  const recentDone = taskList
    .filter((t) => t.status === "Done")
    .slice(0, 3);
  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName ?? "there"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here's your sprint overview for today.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Tasks"
            value={total}
            color="text-slate-600"
            bg="bg-slate-100"
            icon={<ListTodo size={20} />}
          />
          <StatCard
            label="To Do"
            value={todo}
            color="text-gray-600"
            bg="bg-gray-100"
            icon={<Circle size={20} />}
          />
          <StatCard
            label="In Progress"
            value={inProgress + review}
            color="text-blue-600"
            bg="bg-blue-100"
            icon={<Clock size={20} />}
          />
          <StatCard
            label="Completed"
            value={done}
            color="text-green-600"
            bg="bg-green-100"
            icon={<CheckCircle2 size={20} />}
          />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Active Tasks</h2>
              <span className="text-xs text-gray-400">{activeTasks.length} tasks</span>
            </div>
            <div className="flex-1 divide-y divide-gray-50">
              {activeTasks.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-sm text-gray-400">
                  No active tasks — great work!
                </div>
              ) : (
                activeTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[task.status]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {task.assignee?.name} · due {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
            <div className="px-6 py-3 border-t border-gray-100">
              <button
                id="dashboard-view-board-btn"
                onClick={() => navigate("/board")}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
              >
                View Sprint Board
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-800">Sprint Progress</h2>
                <span className="text-2xl font-bold text-blue-600">{pct}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                <span>{done} of {total} tasks completed</span>
                <span>{total - done} remaining</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-5">
                {[
                  { label: "Backlog", count: todo,       dot: "bg-gray-400" },
                  { label: "In Progress", count: inProgress, dot: "bg-blue-500" },
                  { label: "Review",  count: review,     dot: "bg-purple-500" },
                ].map(({ label, count, dot }) => (
                  <div key={label} className="bg-gray-50 rounded-xl px-3 py-3 text-center">
                    <div className={`w-2 h-2 rounded-full mx-auto mb-1.5 ${dot}`} />
                    <p className="text-lg font-bold text-gray-800">{count}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  id="dashboard-view-analytics-btn"
                  onClick={() => navigate("/analytics")}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                >
                  View Analytics
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800">Recently Completed</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {recentDone.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">Nothing completed yet.</p>
                ) : (
                  recentDone.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 px-6 py-3.5">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <Check size={10} color="#16a34a" strokeWidth={3} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600 truncate line-through">{task.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{task.assignee?.name}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
