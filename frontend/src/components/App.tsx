import React, { useState, useEffect, useMemo } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { getTodos, createTodo, updateTodo, deleteTodo } from '../api/todos';
import { getTodayWeather } from '../api/weather';
import type { Todo } from '../types/todo';
import type { TodayWeather } from '../types/weather';

import TodayHeader from './TodayHeader';
import WeatherCard from './WeatherCard';
import EmptyState from './EmptyState';
import AddTodo from './AddTodo';
import TodoList from './TodoList';

type FilterType = 'all' | 'active' | 'completed';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [firstLoad, setFirstLoad] = useState(true);
  const [leavingIds, setLeavingIds] = useState<Set<string>>(new Set());

  // Weather States
  const [weather, setWeather] = useState<TodayWeather | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Get date in YYYY-MM-DD local format
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayDate = useMemo(() => getTodayDateString(), []);

  // Browser Geolocation
  const { coordinates, error: geoError, loading: geoLoading } = useGeolocation();

  // Load weather when location changes
  useEffect(() => {
    if (geoLoading) {
      setWeatherLoading(true);
      return;
    }

    if (geoError) {
      setWeatherError(`Location error: ${geoError}`);
      setWeatherLoading(false);
      return;
    }

    if (coordinates) {
      const fetchWeather = async () => {
        try {
          setWeatherLoading(true);
          const response = await getTodayWeather(coordinates.lat, coordinates.lng);
          if (response.success) {
            setWeather(response.data);
            setWeatherError(null);
          } else {
            setWeatherError(response.error || 'Failed to fetch weather');
          }
        } catch {
          setWeatherError('Weather server unreachable');
        } finally {
          setWeatherLoading(false);
        }
      };
      fetchWeather();
    }
  }, [coordinates, geoError, geoLoading]);

  // Load Todos on init
  useEffect(() => {
    const fetchTodayTodos = async () => {
      try {
        setLoading(true);
        const response = await getTodos(todayDate);
        if (response.success) {
          setTodos(response.data);
          setError(null);
        }
      } catch {
        setError('Could not reach the server. Please ensure the backend is running.');
      } finally {
        setLoading(false);
        setTimeout(() => setFirstLoad(false), 400);
      }
    };
    fetchTodayTodos();
  }, [todayDate]);

  const handleAddTodo = async (title: string) => {
    try {
      const response = await createTodo(title, todayDate);
      if (response.success) {
        setTodos((prev) => [...prev, response.data]);
        setError(null);
      }
    } catch {
      setError('Failed to add task. Try again.');
    }
  };

  const handleToggleTodo = async (id: string, currentCompleted: boolean) => {
    // Optimistic Update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !currentCompleted } : t))
    );

    // Active filter transition: slide down and fade out
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
      await updateTodo(id, { completed: !currentCompleted });
    } catch {
      setError('Failed to update task. Reverting…');
      // Revert on fail
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
      await deleteTodo(id);
    } catch {
      setError('Failed to delete. Refreshing…');
      const response = await getTodos(todayDate);
      if (response.success) setTodos(response.data);
    }
  };

  const handleEditTodo = async (id: string, newTitle: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo || newTitle === todo.title) return;

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: newTitle } : t))
    );

    try {
      await updateTodo(id, { title: newTitle });
    } catch {
      setError('Failed to update title.');
      const response = await getTodos(todayDate);
      if (response.success) setTodos(response.data);
    }
  };

  // Backend already sorts them by completed and createdAt, but we do it client-side too for robust UI sorting during state transitions
  const sortedTodos = useMemo(() => {
    return [...todos].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [todos]);

  const displayTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return sortedTodos.filter((t) => !t.completed || leavingIds.has(t.id));
      case 'completed':
        return sortedTodos.filter((t) => t.completed);
      default:
        return sortedTodos;
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
    <div className={`app-shell weather-${weather?.condition ?? 'default'} flex flex-col items-center px-4 py-12 md:py-20 transition-all duration-800`}>
      {/* Ambient gradient orbs */}
      <div className="fixed top-1/4 -left-32 w-96 h-96 rounded-full blur-[180px] opacity-[0.05] pointer-events-none transition-all duration-800"
        style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }} />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 rounded-full blur-[180px] opacity-[0.04] pointer-events-none transition-all duration-800"
        style={{ background: 'radial-gradient(circle, var(--accent-light, var(--accent)) 0%, transparent 70%)' }} />

      <div className={`w-full max-w-4xl transition-all duration-700 ${firstLoad ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        
        {/* Title and Stats Header */}
        <TodayHeader todoCount={todos.length} completedCount={completedCount} />

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          
          {/* Main Todo Area */}
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl shadow-black/30 overflow-hidden transition-all duration-500">
              
              {/* Add Todo input */}
              <div className="p-5 pb-0">
                <AddTodo onAdd={handleAddTodo} />
              </div>

              {/* Filter pills */}
              <div className="flex gap-2 px-5 py-4 border-b border-[var(--color-border)]">
                {filters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`relative px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                      filter === f.key
                        ? 'bg-[var(--color-copper)]/15 text-[var(--color-copper-light)] border border-[var(--color-copper)]/30'
                        : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--color-card)] border border-transparent'
                    }`}
                  >
                    {f.label}
                    <span className={`ml-1.5 px-1.5 py-0.5 text-[10px] rounded-full transition-all ${
                      filter === f.key ? 'bg-[var(--color-copper)]/25 text-[var(--color-text)]' : 'bg-[var(--color-card)] text-[var(--color-text-muted)]'
                    }`}>
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Error Notification */}
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

              {/* Todo List Content */}
              <div className="min-h-[260px]">
                {loading ? (
                  <div className="flex flex-col gap-3 p-6 animate-pulse">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 py-2">
                        <div className="w-[22px] h-[22px] rounded bg-white/10 flex-shrink-0" />
                        <div className="h-5 bg-white/10 rounded flex-1" />
                      </div>
                    ))}
                  </div>
                ) : displayTodos.length === 0 ? (
                  <EmptyState filter={filter} />
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

            <p className="mt-6 text-center text-[var(--color-text-muted)] text-xs tracking-wide font-medium">
              Double-click a task to edit · Click the circle to complete
            </p>
          </div>

          {/* Right Sidebar Area: Weather & Stats */}
          <div className="flex flex-col gap-6">
            
            {/* Weather Card */}
            <WeatherCard
              weather={weather}
              loading={weatherLoading || geoLoading}
              error={weatherError || (geoError ? `Location error: ${geoError}` : null)}
            />

            {/* Todo Statistics Card */}
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl backdrop-blur-md transition-all duration-500">
              <h4 className="text-[var(--color-text)] font-bold text-sm mb-4">
                Today's Stats
              </h4>
              <div className="flex flex-col gap-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--color-text-muted)]">Completion Rate</span>
                  <span className="font-semibold text-[var(--color-text-dim)]">
                    {todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-[var(--color-card)]/60 rounded-full h-2 overflow-hidden border border-[var(--color-border)]/55">
                  <div
                    className="bg-[var(--accent)] h-full transition-all duration-500 ease-out rounded-full"
                    style={{
                      width: `${todos.length > 0 ? (completedCount / todos.length) * 100 : 0}%`,
                      boxShadow: '0 0 8px var(--accent)',
                    }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-[var(--color-border)]/50 text-xs">
                  <div>
                    <span className="text-[var(--color-text-muted)]">Active</span>
                    <p className="text-xl font-bold text-[var(--color-text)] mt-1">{activeCount}</p>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-muted)]">Completed</span>
                    <p className="text-xl font-bold text-[var(--color-text)] mt-1">{completedCount}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default App;
