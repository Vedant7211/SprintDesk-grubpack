import mockData from '../../utils/mock-data.json'
export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Backlog' | 'In Progress' | 'Review' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  assignee: { name: string; avatar?: string };
  dueDate: string;
  comments: Comment[];
}
interface User {
  id: number;
  name: string;
  avatar: string;
}
export interface MockData {
  users: User[];
  tasks: (Omit<Task, 'assignee'> & { assigneeId: number })[];
}
const STATUS_MAP: Record<string, Task['status']> = {
  'backlog':     'Backlog',
  'in-progress': 'In Progress',
  'review':      'Review',
  'done':        'Done',
};
const PRIORITY_MAP: Record<string, Task['priority']> = {
  'low':    'Low',
  'medium': 'Medium',
  'high':   'High',
};
export const fetchTasks = async (): Promise<Task[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  const typedMockData = mockData as unknown as MockData;
  const usersMap = new Map(typedMockData.users.map(u => [u.id, u]));
  const mappedTasks: Task[] = typedMockData.tasks.slice(0, 30).map(task => {
    const user = usersMap.get(task.assigneeId);
    const normalizedStatus   = STATUS_MAP[task.status as string]   ?? 'Backlog';
    const normalizedPriority = PRIORITY_MAP[task.priority as string] ?? 'Medium';
    return {
      ...task,
      status:   normalizedStatus,
      priority: normalizedPriority,
      assignee: user ? { name: user.name, avatar: user.avatar } : { name: 'Unknown' }
    } as Task;
  });
  return mappedTasks;
};
