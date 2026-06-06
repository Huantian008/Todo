import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Header from './Header';
import AddTodo from './AddTodo';
import TodoList from './TodoList';

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

type FilterType = 'all' | 'active' | 'completed';

const API_BASE_URL = 'http://localhost:3001/api/todos';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [firstLoad, setFirstLoad] = useState(true);
  const [leavingIds, setLeavingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        const response = await axios.get<ApiResponse<Todo[]>>(API_BASE_URL);
        if (response.data.success) {
          setTodos(response.data.data);
          setError(null);
        }
      } catch {
        setError('Could not reach the server. Please ensure the backend is running.');
      } finally {
        setLoading(false);
        setTimeout(() => setFirstLoad(false), 400);
      }
    };
    fetchTodos();
  }, []);

  const handleAddTodo = async (title: string) => {
    try {
      const response = await axios.post<ApiResponse<Todo>>(API_BASE_URL, { title });
      if (response.data.success) {
        setTodos((prev) => [...prev, response.data.data]);
        setError(null);
      }
    } catch {
      setError('Failed to add task. Try again.');
    }
  };

  const handleToggleTodo = async (id: string, currentCompleted: boolean) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !currentCompleted } : t))
    );

    // Active filter: keep item visible for slide-to-bottom + fade-out
    if (filter === 'active' && !currentCompleted) {
      setLeavingIds((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setLeavingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 600); // 300ms slide + 200ms visible + 100ms buffer
    }

    try {
      await axios.put<ApiResponse<Todo>>(`${API_BASE_URL}/${id}`, {
        completed: !currentCompleted,
      });
    } catch {
      setError('Failed to update. Reverting…');
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: currentCompleted } : t))
      );
      setLeavingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDeleteTodo = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      await axios.delete<ApiResponse<null>>(`${API_BASE_URL}/${id}`);
    } catch {
      setError('Failed to delete. Refreshing…');
      const response = await axios.get<ApiResponse<Todo[]>>(API_BASE_URL);
      if (response.data.success) setTodos(response.data.data);
    }
  };

  const handleEditTodo = async (id: string, newTitle: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo || newTitle === todo.title) return;
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: newTitle } : t))
    );
    try {
      await axios.put<ApiResponse<Todo>>(`${API_BASE_URL}/${id}`, { title: newTitle });
    } catch {
      setError('Failed to update title.');
      const response = await axios.get<ApiResponse<Todo[]>>(API_BASE_URL);
      if (response.data.success) setTodos(response.data.data);
    }
  };

  // Sort: active before completed, each group by createdAt asc
  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [todos]);

  const displayTodos = useMemo(() => {
    switch (filter) {
      case 'active':    return sortedTodos.filter((t) => !t.completed || leavingIds.has(t.id));
      case 'completed': return sortedTodos.filter((t) => t.completed);
      default:          return sortedTodos;
    }
  }, [sortedTodos, filter, leavingIds]);

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all',       label: 'All',        count: todos.length },
    { key: 'active',    label: 'Active',     count: activeCount },
    { key: 'completed', label: 'Completed',  count: completedCount },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 md:py-20 font-[family-name:var(--font-body)]">
      {/* Ambient gradient orbs */}
      <div className="fixed top-1/4 -left-32 w-96 h-96 rounded-full blur-[180px] opacity-[0.04] pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--color-copper) 0%, transparent 70%)' }} />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 rounded-full blur-[180px] opacity-[0.03] pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--color-copper-light) 0%, transparent 70%)' }} />

      <div className={`w-full max-w-xl transition-all duration-700 ${firstLoad ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <Header />

        {/* Card */}
        <div className="mt-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl shadow-black/40 overflow-hidden">
          {/* Add bar */}
          <div className="p-5 pb-0">
            <AddTodo onAdd={handleAddTodo} />
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 px-5 py-4 border-b border-[var(--color-border)]">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                  filter === f.key
                    ? 'bg-[var(--color-copper)]/15 text-[var(--color-copper-light)]'
                    : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--color-card)]'
                }`}
              >
                {f.label}
                <span className={`ml-1.5 text-xs ${filter === f.key ? 'opacity-70' : 'opacity-40'}`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Error toast */}
          {error && (
            <div className="mx-5 mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-danger-glow)] border border-[var(--color-danger)]/20 text-sm text-[var(--color-danger)] animate-fade-in">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          {/* Content */}
          <div className="min-h-[260px]">
            {loading ? (
              <div className="flex flex-col gap-3 p-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="shimmer-bar rounded-md" style={{ width: 22, height: 22, flexShrink: 0 }} />
                    <div className="shimmer-bar rounded-md flex-1" style={{ height: 20 }} />
                  </div>
                ))}
              </div>
            ) : displayTodos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-card)] flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <p className="text-[var(--color-text-dim)] text-sm font-[family-name:var(--font-body)]">
                  {filter === 'all' ? 'Your canvas awaits. Add your first task.' : `No ${filter} tasks.`}
                </p>
              </div>
            ) : (
              <TodoList
                todos={displayTodos}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
                onEdit={handleEditTodo}
                leavingIds={leavingIds}
              />
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-[var(--color-text-muted)] text-xs tracking-wide font-[family-name:var(--font-body)]">
          Double-click a task to edit · Click the circle to complete
        </p>
      </div>
    </div>
  );
};

export default App;
