import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Task } from '../../api/board';
interface TaskCardProps {
  task: Task;
  onClick: () => void;
}
export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });
  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 1,
    position: 'relative', 
  };
  const priorityColors = {
    'Low': 'bg-blue-100 text-blue-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-red-100 text-red-800'
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white p-4 rounded-md shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${isDragging ? 'shadow-lg border-blue-500 ring-2 ring-blue-500' : ''}`}
      onClick={(e) => {
        if (isDragging) return;
        onClick();
      }}
      {...listeners}
      {...attributes}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-800 text-sm">{task.title}</h4>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority] || priorityColors['Low']}`}>
          {task.priority}
        </span>
      </div>
      <p className="text-xs text-gray-500 line-clamp-2 mb-3">
        {task.description}
      </p>
      <div className="flex justify-between items-center text-xs text-gray-500 mt-4">
        <div className="flex items-center gap-2">
          {(task.assignee?.avatar) ? (
            <img src={task.assignee.avatar} alt={task.assignee.name} className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
              {task.assignee?.name?.charAt(0) || '?'}
            </div>
          )}
          <span>{task.assignee?.name || 'Unknown'}</span>
        </div>
        <div>
          {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
      </div>
    </div>
  );
};
