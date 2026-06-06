import React, { useState, useRef, useEffect } from 'react';

interface AddTodoProps {
  onAdd: (title: string) => void;
}

const AddTodo: React.FC<AddTodoProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
      inputRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
          focused
            ? 'border-[var(--color-copper)]/40 bg-[var(--color-card)] shadow-[0_0_0_4px_var(--color-copper-glow)]'
            : 'border-[var(--color-border)] bg-[var(--color-card)]'
        }`}
      >
        {/* Plus icon */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
          title.trim() ? 'bg-[var(--color-copper)]/20 text-[var(--color-copper-light)]' : 'text-[var(--color-text-muted)]'
        }`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="What needs to be done?"
          className="flex-1 bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] text-base outline-none font-[family-name:var(--font-body)]"
        />

        {title.trim() && (
          <button
            type="submit"
            className="flex-shrink-0 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 font-[family-name:var(--font-body)]"
            style={{
              background: 'linear-gradient(135deg, var(--color-copper-dim), var(--color-copper))',
              color: 'var(--color-void)',
            }}
          >
            Add
          </button>
        )}
      </div>
    </form>
  );
};

export default AddTodo;
