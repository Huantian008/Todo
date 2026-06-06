import React from 'react';

interface TodayHeaderProps {
  todoCount: number;
  completedCount: number;
}

const TodayHeader: React.FC<TodayHeaderProps> = ({ todoCount, completedCount }) => {
  const today = new Date();
  
  // Format: Saturday, Jun 6
  const dateOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  };
  const formattedDate = today.toLocaleDateString('en-US', dateOptions);

  return (
    <header className="mb-8 select-none">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-all duration-500"
          style={{
            background: 'linear-gradient(135deg, var(--accent), #c97f54)',
          }}
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1
          className="text-3xl font-extrabold tracking-tight font-[family-name:var(--font-display)]"
          style={{
            background: 'linear-gradient(135deg, var(--color-text) 0%, var(--color-text-dim) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Nocturne
        </h1>
      </div>
      <div className="flex justify-between items-baseline mt-4 border-b border-[var(--color-border)] pb-2">
        <p className="text-[var(--color-text-dim)] text-lg font-semibold tracking-wide">
          {formattedDate}
        </p>
        <p className="text-xs font-semibold tracking-wider uppercase text-[var(--color-text-muted)]">
          {completedCount} / {todoCount} Completed
        </p>
      </div>
    </header>
  );
};

export default TodayHeader;
