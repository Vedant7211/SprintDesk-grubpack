import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task } from '../api/board';
interface BoardState {
  tasks: Record<string, Task>;
  columns: Record<string, string[]>;
  isInitialized: boolean;
  seedInitialData: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, fromCol: string, toCol: string, toIndex: number) => void;
}
const initialColumns = {
  'Backlog': [],
  'In Progress': [],
  'Review': [],
  'Done': []
};
export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      tasks: {},
      columns: initialColumns,
      isInitialized: false,
      seedInitialData: (fetchedTasks: Task[]) => set((state) => {
        if (state.isInitialized) return state; 
        const newTasks: Record<string, Task> = {};
        const newColumns: Record<string, string[]> = {
          'Backlog': [],
          'In Progress': [],
          'Review': [],
          'Done': []
        };
        fetchedTasks.forEach(task => {
          newTasks[task.id] = task;
          if (newColumns[task.status]) {
            newColumns[task.status].push(task.id);
          } else {
            newColumns['Backlog'].push(task.id);
          }
        });
        return { tasks: newTasks, columns: newColumns, isInitialized: true };
      }),
      addTask: (task) => set((state) => {
        const status = task.status || 'Backlog';
        return {
          tasks: { ...state.tasks, [task.id]: task },
          columns: {
            ...state.columns,
            [status]: [...state.columns[status], task.id]
          }
        };
      }),
      updateTask: (id, updates) => set((state) => {
        const task = state.tasks[id];
        if (!task) return state;
        const updatedTask = { ...task, ...updates };
        const newState = {
          tasks: { ...state.tasks, [id]: updatedTask },
          columns: { ...state.columns }
        };
        if (updates.status && updates.status !== task.status) {
          const oldCol = newState.columns[task.status].filter(tId => tId !== id);
          const newCol = [...newState.columns[updates.status], id];
          newState.columns[task.status] = oldCol;
          newState.columns[updates.status] = newCol;
        }
        return newState;
      }),
      deleteTask: (id) => set((state) => {
        const task = state.tasks[id];
        if (!task) return state;
        const newTasks = { ...state.tasks };
        delete newTasks[id];
        const newColumns = { ...state.columns };
        newColumns[task.status] = newColumns[task.status].filter(tId => tId !== id);
        return { tasks: newTasks, columns: newColumns };
      }),
      moveTask: (taskId, fromCol, toCol, toIndex) => set((state) => {
        const task = state.tasks[taskId];
        if (!task) return state;
        const sourceCol = state.columns[fromCol].filter(id => id !== taskId);
        const destColWithoutTask = state.columns[toCol].filter(id => id !== taskId);
        const destCol = [
          ...destColWithoutTask.slice(0, toIndex),
          taskId,
          ...destColWithoutTask.slice(toIndex)
        ];
        const newColumns = {
          ...state.columns,
          [fromCol]: sourceCol,
          [toCol]: destCol,
        };
        let newTasks = state.tasks;
        if (fromCol !== toCol) {
          newTasks = {
            ...state.tasks,
            [taskId]: {
              ...task,
              status: toCol as Task['status']
            }
          };
        }
        return { columns: newColumns, tasks: newTasks };
      })
    }),
    {
      name: 'sprintdesk-board-storage',
      version: 3, 
    }
  )
);
