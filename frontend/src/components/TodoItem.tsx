import React, { useState, useRef, useEffect } from 'react';
import type { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, currentCompleted: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
  isLeaving?: boolean;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onEdit, isLeaving }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (confirmDelete) {
      const t = setTimeout(() => setConfirmDelete(false), 3000);
      return () => clearTimeout(t);
    }
  }, [confirmDelete]);

  const handleSave = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== todo.title) {
      onEdit(todo.id, trimmed);
    } else {
      setEditTitle(todo.title);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    else if (e.key === 'Escape') handleCancel();
  };

  return (
    <div
      className={`todo-item group flex items-center gap-4 px-5 py-[1.25rem] ${
        todo.completed ? 'opacity-60' : ''
      } ${
        isLeaving
          ? 'opacity-0 max-h-0 py-0 overflow-hidden scale-y-0'
          : 'opacity-100 max-h-[120px]'
      }`}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id, todo.completed)}
        className="custom-checkbox mt-0.5"
        aria-label={todo.completed ? 'Mark as active' : 'Mark as completed'}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[var(--color-text)] text-[16px] md:text-[17px] font-medium outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent-glow)] transition-all font-[family-name:var(--font-body)] shadow-sm"
          />
        ) : (
          <span
            className={`block truncate text-[16px] md:text-[18px] transition-all duration-300 cursor-default font-medium font-[family-name:var(--font-body)] leading-relaxed ${
              todo.completed
                ? 'line-through decoration-slate-400/50 text-[var(--color-text-muted)]'
                : 'text-[var(--color-text)]'
            }`}
            onDoubleClick={() => !todo.completed && setIsEditing(true)}
            title={todo.title + (todo.createdAt ? ` · Created ${new Date(todo.createdAt).toLocaleDateString()}` : '')}
          >
            {todo.title}
          </span>
        )}
      </div>

      {/* Actions — visible on hover or when editing */}
      <div className={`flex items-center gap-1 transition-all duration-200 ${
        isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        {isEditing ? (
          <>
            <button
              onMouseDown={(e) => { e.preventDefault(); handleSave(); }}
              className="btn-spring p-2.5 rounded-xl text-[var(--color-success)] hover:bg-emerald-50"
              title="Save"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); handleCancel(); }}
              className="btn-spring p-2.5 rounded-xl text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-slate-100"
              title="Cancel"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-spring p-2.5 rounded-xl text-[var(--color-text-dim)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-light)]"
              title="Edit"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => {
                if (confirmDelete) {
                  onDelete(todo.id);
                  setConfirmDelete(false);
                } else {
                  setConfirmDelete(true);
                }
              }}
              className={`btn-spring p-2.5 rounded-xl ${
                confirmDelete
                  ? 'bg-red-50 text-red-600'
                  : 'text-[var(--color-text-dim)] hover:text-[var(--color-danger)] hover:bg-red-50'
              }`}
              title={confirmDelete ? 'Click again to confirm' : 'Delete'}
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0117.138 21H6.862a2 2 0 01-1.995-1.858L4 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TodoItem;
