import React from 'react';

interface EmptyStateProps {
  filter: 'all' | 'active' | 'completed';
}

const EmptyState: React.FC<EmptyStateProps> = ({ filter }) => {
  const getMessage = () => {
    switch (filter) {
      case 'active':
        return 'No active tasks left for today. Splendid!';
      case 'completed':
        return 'No completed tasks yet. Keep moving forward!';
      default:
        return 'Your canvas is clear. Add your first task for today.';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none animate-fade-in">
      <div className="w-16 h-16 rounded-3xl weather-sheen flex items-center justify-center mb-4 border border-white/70 shadow-lg">
        <svg className="w-8 h-8 text-[var(--accent-dim)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <p className="text-[var(--color-text-dim)] text-sm font-semibold max-w-xs">
        {getMessage()}
      </p>
    </div>
  );
};

export default EmptyState;
