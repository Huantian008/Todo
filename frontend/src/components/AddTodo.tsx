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
        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-200 ${
          focused
            ? 'border-[var(--accent)]/45 bg-white shadow-[0_0_0_4px_var(--accent-glow)]'
            : 'border-[var(--color-input-border)] bg-white/82'
        }`}
      >
        {/* Plus icon */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
          title.trim() ? 'bg-[var(--action-glow)] text-[var(--action-hover)]' : 'text-[var(--color-text-muted)]'
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
          className="flex-1 bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] text-base outline-none font-semibold font-[family-name:var(--font-body)]"
        />

        {title.trim() && (
          <button
            type="submit"
            className="btn-spring flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold font-[family-name:var(--font-body)] shadow-sm"
            style={{
              background: 'linear-gradient(135deg, var(--action), var(--action-hover))',
              boxShadow: '0 10px 22px var(--action-glow)',
              color: '#ffffff',
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
