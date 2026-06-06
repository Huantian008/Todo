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
      <div className="flex flex-col gap-5 rounded-[2rem] glass-panel glass-hairline px-6 py-6 md:px-8 md:py-7">
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            boxShadow: '0 14px 34px var(--accent-glow)',
          }}
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[var(--color-text-muted)] text-xs font-bold uppercase tracking-[0.26em]">
            Today focus
          </p>
          <h1
            className="pb-1 text-4xl md:text-5xl font-black leading-[1.15] tracking-tight font-[family-name:var(--font-display)]"
            style={{
              background: 'linear-gradient(135deg, var(--color-text) 0%, var(--accent-dim) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Today's Todo
          </h1>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center border-t border-white/70 pt-4">
        <p className="text-[var(--color-text-dim)] text-base md:text-lg font-semibold tracking-wide">
          {formattedDate}
        </p>
        <p className="w-fit rounded-full border border-white/80 bg-white/28 px-4 py-2 text-xs font-bold tracking-wider uppercase text-[var(--color-text-dim)] shadow-sm backdrop-blur-xl">
          {completedCount} / {todoCount} Completed
        </p>
      </div>
      </div>
    </header>
  );
};

export default TodayHeader;
