import React from 'react';
import { ProcessingTask } from '../services/imageProcessor';

interface ProgressIndicatorProps {
  tasks: ProcessingTask[];
  isDarkMode: boolean;
  isPaused: boolean;
  onCancel: (taskId: string) => void;
  onCancelAll: () => void;
  onPauseResume: () => void;
  onRetry: (taskId: string) => void;
  onRetryAll: () => void;
}

export default function ProgressIndicator({
  tasks,
  isDarkMode,
  isPaused,
  onCancel,
  onCancelAll,
  onPauseResume,
  onRetry,
  onRetryAll
}: ProgressIndicatorProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const errorTasks = tasks.filter(t => t.status === 'error').length;
  const cancelledTasks = tasks.filter(t => t.status === 'cancelled').length;
  const activeTasks = tasks.filter(t => t.status === 'processing').length;
  const queuedTasks = tasks.filter(t => t.status === 'queued').length;
  
  const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0) / totalTasks;
  
  return (
    <div className={`space-y-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Overall Progress</h3>
          <span>{Math.round(totalProgress)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${totalProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span>{completedTasks} of {totalTasks} completed</span>
          {errorTasks > 0 && (
            <span className="text-red-500">{errorTasks} failed</span>
          )}
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex space-x-2">
        <button
          onClick={onPauseResume}
          className={`
            px-3 py-1 rounded-md transition-colors
            ${isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-gray-200 hover:bg-gray-300'
            }
          `}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        {errorTasks > 0 && (
          <button
            onClick={onRetryAll}
            className={`
              px-3 py-1 rounded-md transition-colors text-white
              bg-indigo-600 hover:bg-indigo-700
            `}
          >
            Retry Failed
          </button>
        )}
        {(activeTasks > 0 || queuedTasks > 0) && (
          <button
            onClick={onCancelAll}
            className={`
              px-3 py-1 rounded-md transition-colors
              bg-red-600 hover:bg-red-700 text-white
            `}
          >
            Cancel All
          </button>
        )}
      </div>
      
      {/* Task List */}
      <div className="space-y-2">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`
              p-3 rounded-lg
              ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}
            `}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium truncate flex-1">
                {task.file.name}
              </span>
              <div className="flex items-center space-x-2">
                {task.status === 'error' && (
                  <button
                    onClick={() => onRetry(task.id)}
                    className="text-indigo-500 hover:text-indigo-400"
                  >
                    Retry
                  </button>
                )}
                {(task.status === 'processing' || task.status === 'queued') && (
                  <button
                    onClick={() => onCancel(task.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
            
            {/* Task Progress */}
            {task.status === 'processing' && (
              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            )}
            
            {/* Task Status */}
            <div className="mt-1 text-sm">
              {task.status === 'completed' && (
                <span className="text-green-500">Completed</span>
              )}
              {task.status === 'error' && (
                <span className="text-red-500">
                  Error: {task.error}
                </span>
              )}
              {task.status === 'cancelled' && (
                <span className="text-gray-500">Cancelled</span>
              )}
              {task.status === 'queued' && (
                <span>Queued</span>
              )}
              {task.status === 'processing' && (
                <span>{Math.round(task.progress)}%</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 