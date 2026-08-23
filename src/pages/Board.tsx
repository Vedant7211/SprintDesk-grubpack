import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTasks } from '../api/board';
import { useBoardStore } from '../stores/board.store';
import { KanbanBoard } from '../components/board/KanbanBoard';
import { NewTaskModal } from '../components/board/NewTaskModal';

export const Board: React.FC = () => {
  const { seedInitialData, isInitialized } = useBoardStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', 'initial'],
    queryFn: fetchTasks,
    enabled: !isInitialized,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data && !isInitialized) {
      seedInitialData(data);
    }
  }, [data, isInitialized, seedInitialData]);

  if (!isInitialized && isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Loading board data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-md shadow">
          Failed to load board data: {(error as Error).message}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sprint Board</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your active sprint tasks.</p>
        </div>
        <button
          id="new-task-open-btn"
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-sm"
        >
          + New Task
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>

      <NewTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
