import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center select-none">
      <div className="inline-flex items-center gap-3 mb-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-copper-dim), var(--color-copper))',
          }}
        >
          <svg className="w-4 h-4 text-[var(--color-void)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold tracking-tight font-[family-name:var(--font-display)]"
          style={{
            background: 'linear-gradient(135deg, var(--color-text) 0%, var(--color-text-dim) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Nocturne
        </h1>
      </div>
      <p className="text-[var(--color-text-muted)] text-sm font-[family-name:var(--font-body)] tracking-wide">
        Tasks, refined
      </p>
    </header>
  );
};

export default Header;
