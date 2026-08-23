import React, { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  PointerSensor, 
  useSensor, 
  useSensors,
  KeyboardSensor,
  closestCorners
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useBoardStore } from '../../stores/board.store';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { TaskDrawer } from './TaskDrawer';
import type { Task } from '../../api/board';
const COLUMNS = ['Backlog', 'In Progress', 'Review', 'Done'];
export const KanbanBoard: React.FC = () => {
  const { tasks, columns, moveTask } = useBoardStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = selectedTaskId ? tasks[selectedTaskId] ?? null : null;
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, 
      },
    }),
    useSensor(KeyboardSensor)
  );
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks[active.id as string];
    if (task) {
      setActiveTask(task);
    }
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveTask(null);
      return;
    }
    const taskId = active.id as string;
    const task = tasks[taskId];
    const overId = over.id as string;
    let targetColumn: string | null = null;
    if (COLUMNS.includes(overId)) {
      targetColumn = overId;
    } else if (tasks[overId]) {
      targetColumn = tasks[overId].status;
    }
    if (targetColumn && task.status !== targetColumn) {
      const toIndex = columns[targetColumn].length;
      moveTask(taskId, task.status, targetColumn, toIndex);
    }
    setActiveTask(null);
  };
  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id);
  };
  return (
    <div className="flex h-[calc(100vh-8rem)] w-full overflow-x-auto p-6 gap-6 bg-white">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {COLUMNS.map(colId => {
          const columnTaskIds = columns[colId] || [];
          const columnTasks = columnTaskIds.map(id => tasks[id]).filter(Boolean);
          return (
            <KanbanColumn 
              key={colId} 
              id={colId} 
              title={colId} 
              tasks={columnTasks} 
              onTaskClick={handleTaskClick} 
            />
          );
        })}
        <DragOverlay>
          {activeTask ? (
            <div className="opacity-80 rotate-2 scale-105 transition-transform cursor-grabbing">
              <TaskCard task={activeTask} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <TaskDrawer
        task={selectedTask}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
};
