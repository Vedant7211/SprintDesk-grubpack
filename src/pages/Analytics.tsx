import React, { useMemo } from "react";
import {
  BarChart, Bar,
  PieChart, Pie, Cell,
  LineChart, Line,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import { useBoardStore } from "../stores/board.store";
import type { Task } from "../api/board";
const STATUS_COLORS: Record<Task["status"], string> = {
  Backlog:       "#94a3b8",
  "In Progress": "#3b82f6",
  Review:        "#a855f7",
  Done:          "#22c55e",
};
const PRIORITY_COLORS: Record<Task["priority"], string> = {
  Low:    "#38bdf8",
  Medium: "#f59e0b",
  High:   "#ef4444",
};
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      {label && <p className="font-semibold text-gray-700 mb-1">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color ?? p.fill }} className="font-medium">
          {p.name}: <span className="text-gray-800">{p.value}</span>
        </p>
      ))}
    </div>
  );
};
const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700">{name}</p>
      <p className="text-gray-600">{value} task{value !== 1 ? "s" : ""}</p>
    </div>
  );
};
interface StatCardProps { label: string; value: string | number; sub?: string; color: string }
const StatCard: React.FC<StatCardProps> = ({ label, value, sub, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
    <p className="text-3xl font-bold" style={{ color }}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);
interface ChartCardProps { title: string; subtitle?: string; children: React.ReactNode }
const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);
export const Analytics: React.FC = () => {
  const { tasks } = useBoardStore();
  const taskList = useMemo(() => Object.values(tasks), [tasks]);
  const statusData = useMemo(() => {
    const counts: Record<string, number> = { Backlog: 0, "In Progress": 0, Review: 0, Done: 0 };
    taskList.forEach((t) => { if (counts[t.status] !== undefined) counts[t.status]++; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [taskList]);
  const priorityData = useMemo(() => {
    const counts: Record<string, number> = { Low: 0, Medium: 0, High: 0 };
    taskList.forEach((t) => { if (counts[t.priority] !== undefined) counts[t.priority]++; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [taskList]);
  const completionTrend = useMemo(() => {
    const weekMap = new Map<string, { total: number; done: number }>();
    taskList.forEach((t) => {
      const d = new Date(t.dueDate);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(d.setDate(diff));
      const key = weekStart.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
      if (!weekMap.has(key)) weekMap.set(key, { total: 0, done: 0 });
      const entry = weekMap.get(key)!;
      entry.total++;
      if (t.status === "Done") entry.done++;
    });
    return Array.from(weekMap.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([week, { total, done }]) => ({ week, total, done, pending: total - done }));
  }, [taskList]);
  const velocityData = useMemo(() => {
    const map = new Map<string, { done: number; inProgress: number; total: number }>();
    taskList.forEach((t) => {
      const name = t.assignee?.name ?? "Unknown";
      if (!map.has(name)) map.set(name, { done: 0, inProgress: 0, total: 0 });
      const entry = map.get(name)!;
      entry.total++;
      if (t.status === "Done") entry.done++;
      if (t.status === "In Progress") entry.inProgress++;
    });
    return Array.from(map.entries()).map(([name, v]) => ({
      name: name.split(" ")[0], 
      ...v,
    }));
  }, [taskList]);
  const totalTasks  = taskList.length;
  const doneTasks   = taskList.filter((t) => t.status === "Done").length;
  const inProgress  = taskList.filter((t) => t.status === "In Progress").length;
  const highPri     = taskList.filter((t) => t.priority === "High").length;
  const completionRate = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;
  if (totalTasks === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-sm">
        No task data yet. Visit the{" "}
        <a href="/board" className="text-blue-500 underline mx-1">Sprint Board</a>
        first to load tasks.
      </div>
    );
  }
  return (
    <div className="h-full overflow-y-auto bg-gray-50 px-8 py-7">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Sprint performance and task insights across your team.
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard label="Total Tasks"      value={totalTasks}       sub="across all columns"    color="#3b82f6" />
        <StatCard label="Completed"        value={doneTasks}        sub={`${completionRate}% done`} color="#22c55e" />
        <StatCard label="In Progress"      value={inProgress}       sub="actively worked on"    color="#a855f7" />
        <StatCard label="High Priority"    value={highPri}          sub="need attention"        color="#ef4444" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Task Status Distribution" subtitle="Current snapshot of all task statuses">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {statusData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[entry.name as Task["status"]]}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(v) => <span className="text-xs text-gray-600">{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Priority Breakdown" subtitle="Tasks split by priority level">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={priorityData} barSize={44} margin={{ top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="value" name="Tasks" radius={[6, 6, 0, 0]}>
                {priorityData.map((entry) => (
                  <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name as Task["priority"]]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Completion Trend" subtitle="Total vs. completed tasks by due-date week">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={completionTrend} margin={{ top: 8 }}>
              <defs>
                <linearGradient id="gradDone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
              <Area type="monotone" dataKey="total" name="Total"     stroke="#3b82f6" fill="url(#gradTotal)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="done"  name="Completed" stroke="#22c55e" fill="url(#gradDone)"  strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Sprint Velocity" subtitle="Tasks done vs. in-progress per team member">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={velocityData} barSize={18} barGap={4} margin={{ top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
              <Bar dataKey="done"       name="Done"        fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="inProgress" name="In Progress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};
