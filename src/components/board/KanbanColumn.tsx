import React from "react";
import { useDroppable } from "@dnd-kit/core";
import type { Task } from "../../api/board";
import { TaskCard } from "./TaskCard";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tasks,
  onTaskClick,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: "Column",
      columnId: id,
    },
  });

  return (
    <div className="flex flex-col w-80 min-w-80 h-full bg-gray-50 rounded-lg shrink-0">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-100/50 rounded-t-lg">
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 p-3 flex flex-col gap-3 overflow-y-auto min-h-[200px] transition-colors ${isOver ? "bg-blue-50/50" : ""}`}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}
        {/* Placeholder if empty */}
        {tasks.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-md py-8">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};
