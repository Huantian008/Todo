import React, { useState, useEffect, useMemo } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { getTodos, createTodo, updateTodo, deleteTodo } from '../api/todos';
import { getTodayWeather } from '../api/weather';
import type { Todo } from '../types/todo';
import type { TodayWeather } from '../types/weather';

import TodayHeader from './TodayHeader';
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
      setWeatherError(geoError);
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
      }, 600);
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
    <div className={`app-shell weather-${weather?.condition ?? 'default'} flex flex-col items-center px-4 py-8 md:py-16 transition-colors duration-1000`}>
      <div className={`relative z-10 w-full max-w-2xl transition-all duration-700 ease-out ${firstLoad ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'}`}>
        
        {/* Title and Stats Header */}
        <TodayHeader
          todoCount={todos.length}
          completedCount={completedCount}
          weather={weather}
          loadingWeather={weatherLoading || geoLoading}
          weatherError={weatherError || geoError}
        />

        {/* Central Todo Area */}
        <div className="todo-panel overflow-hidden transition-all duration-300">
          
          {/* Add Todo input */}
          <div className="p-5 md:p-6 border-b border-[var(--color-border)]/70">
            <AddTodo onAdd={handleAddTodo} />
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 overflow-x-auto px-5 py-4 border-b border-[var(--color-border)]/70 bg-white/20">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`btn-spring relative shrink-0 px-5 py-2 text-[13px] font-bold rounded-full cursor-pointer ${
                  filter === f.key
                    ? 'bg-[var(--color-text)] text-white shadow-md'
                    : 'bg-white/50 text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-white border border-transparent hover:border-white/80'
                }`}
              >
                {f.label}
                <span className={`ml-2 px-1.5 py-0.5 text-[10px] rounded-full transition-all ${
                  filter === f.key ? 'bg-white/20 text-white' : 'bg-black/5 text-[var(--color-text-dim)]'
                }`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Error Notification */}
          {error && (
            <div className="mx-5 mt-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 animate-fade-in">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
              <button onClick={() => setError(null)} className="btn-spring ml-auto text-red-400 hover:text-red-700">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          {/* Todo List Content */}
          <div className="min-h-[400px] p-2">
            {loading ? (
              <div className="flex flex-col gap-2 p-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 py-4 px-3">
                    <div className="w-[26px] h-[26px] rounded-full bg-slate-200/60 flex-shrink-0" />
                    <div className="h-5 bg-slate-200/60 rounded flex-1" />
                  </div>
                ))}
              </div>
            ) : displayTodos.length === 0 ? (
              <div className="py-12">
                <EmptyState filter={filter} />
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

        <p className="mt-8 text-center text-[var(--color-text-muted)] text-[13px] font-medium tracking-wide opacity-80">
          Double-click a task to edit · Click the circle to complete
        </p>

      </div>
    </div>
  );
};

export default App;
