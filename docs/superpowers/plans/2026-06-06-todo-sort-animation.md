# Todo Sort + FLIP Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completed todos sort to bottom with smooth FLIP animation; Active filter shows slide-to-bottom + fade-out before hiding.

**Architecture:** Frontend-only change. Sorting applied in App.tsx via `useMemo`. FLIP animation lives in TodoList.tsx via ref-based position tracking + `useLayoutEffect`. Fade-out for Active filter managed through a `leavingIds` Set with setTimeout cleanup.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4

---

### File Structure

| File | Role |
|------|------|
| `frontend/src/components/App.tsx` | Sort logic, `leavingIds` state, wire props |
| `frontend/src/components/TodoList.tsx` | FLIP animation orchestrator |
| `frontend/src/components/TodoItem.tsx` | Fade-out animation receiver |

---

### Task 1: Add sorted display logic to App.tsx

**Files:**
- Modify: `frontend/src/components/App.tsx`

- [ ] **Step 1: Replace `filteredTodos` with `displayTodos` that sorts and filters**

Replace the existing `filteredTodos` useMemo (lines 105-111) with this:

```tsx
// Sort: active before completed, each group by createdAt asc
const sortedTodos = useMemo(() => {
  return [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}, [todos]);

const displayTodos = useMemo(() => {
  switch (filter) {
    case 'active':    return sortedTodos.filter((t) => !t.completed);
    case 'completed': return sortedTodos.filter((t) => t.completed);
    default:          return sortedTodos;
  }
}, [sortedTodos, filter]);
```

- [ ] **Step 2: Update all references from `filteredTodos` to `displayTodos`**

In the JSX (lines 184, 196, 198), change `filteredTodos` to `displayTodos`.

- [ ] **Step 3: Verify the app compiles**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/App.tsx
git commit -m "feat: sort todos with completed items at bottom"
```

---

### Task 2: Add FLIP animation to TodoList.tsx

**Files:**
- Modify: `frontend/src/components/TodoList.tsx`

- [ ] **Step 1: Rewrite TodoList.tsx with FLIP animation hook**

```tsx
import React, { useRef, useEffect, useLayoutEffect } from 'react';
import TodoItem from './TodoItem';
import type { Todo } from './App';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string, currentCompleted: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
  leavingIds?: Set<string>;
}

interface RectMap {
  [id: string]: DOMRect;
}

const TodoList: React.FC<TodoListProps> = ({ todos, onToggle, onDelete, onEdit, leavingIds }) => {
  const elementsRef = useRef<Map<string, HTMLLIElement>>(new Map());
  const prevRectsRef = useRef<RectMap>({});

  // FLIP: capture old positions before render
  useEffect(() => {
    const rects: RectMap = {};
    elementsRef.current.forEach((el, id) => {
      rects[id] = el.getBoundingClientRect();
    });
    prevRectsRef.current = rects;
  });

  // FLIP: invert + play after render commits to DOM
  useLayoutEffect(() => {
    const prevRects = prevRectsRef.current;

    elementsRef.current.forEach((el, id) => {
      const oldRect = prevRects[id];
      if (!oldRect) return;

      const newRect = el.getBoundingClientRect();
      const deltaY = oldRect.top - newRect.top;

      if (deltaY !== 0) {
        // Invert: make it look like it's still at old position
        el.style.transition = 'none';
        el.style.transform = `translateY(${deltaY}px)`;

        // Play: animate to new position
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transition = 'transform 300ms ease';
            el.style.transform = '';
          });
        });
      }
    });

    // Update stored positions after animation setup
    const newRects: RectMap = {};
    elementsRef.current.forEach((el, id) => {
      newRects[id] = el.getBoundingClientRect();
    });
    prevRectsRef.current = newRects;
  }, [todos]);

  const registerElement = (id: string) => (el: HTMLLIElement | null) => {
    if (el) {
      elementsRef.current.set(id, el);
    } else {
      elementsRef.current.delete(id);
    }
  };

  return (
    <ul className="divide-y divide-[var(--color-border)]">
      {todos.map((todo, i) => (
        <li
          key={todo.id}
          ref={registerElement(todo.id)}
          className="animate-fade-in-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <TodoItem
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
            isLeaving={leavingIds?.has(todo.id) ?? false}
          />
        </li>
      ))}
    </ul>
  );
};

export default TodoList;
```

- [ ] **Step 2: Verify TypeScript compilation**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/TodoList.tsx
git commit -m "feat: add FLIP animation for todo list reordering"
```

---

### Task 3: Add fade-out support to TodoItem.tsx

**Files:**
- Modify: `frontend/src/components/TodoItem.tsx`

- [ ] **Step 1: Add `isLeaving` prop**

Change the interface (line 4-9) to include `isLeaving`:

```tsx
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, currentCompleted: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
  isLeaving?: boolean;
}
```

Update destructuring on line 11:

```tsx
const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onEdit, isLeaving }) => {
```

- [ ] **Step 2: Add fade-out animation classes**

On the root `<div>` (line 52), add `isLeaving` conditional classes:

```tsx
<div
  className={`group flex items-center gap-4 px-5 py-4 transition-all duration-300 hover:bg-[var(--color-card)]/50 ${
    todo.completed ? 'opacity-40 hover:opacity-50' : ''
  } ${
    isLeaving
      ? 'opacity-0 max-h-0 py-0 overflow-hidden scale-y-0'
      : ''
  }`}
>
```

- [ ] **Step 3: Verify TypeScript compilation**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/TodoItem.tsx
git commit -m "feat: add fade-out animation support for leaving todo items"
```

---

### Task 4: Add leaving-state management in App.tsx for Active filter

**Files:**
- Modify: `frontend/src/components/App.tsx`

- [ ] **Step 1: Add `leavingIds` state**

Add after existing `useState` declarations (line 30):

```tsx
const [leavingIds, setLeavingIds] = useState<Set<string>>(new Set());
```

- [ ] **Step 2: Modify `handleToggleTodo` to handle Active filter leaving**

Replace the existing `handleToggleTodo` (lines 63-77):

```tsx
const handleToggleTodo = async (id: string, currentCompleted: boolean) => {
  setTodos((prev) =>
    prev.map((t) => (t.id === id ? { ...t, completed: !currentCompleted } : t))
  );

  // Active filter: keep item visible for slide-to-bottom + fade-out
  if (filter === 'active' && !currentCompleted) {
    // adding to completed → should leave
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
```

- [ ] **Step 3: Modify `displayTodos` to show leaving items in Active filter**

Replace the `displayTodos` useMemo (created in Task 1) with:

```tsx
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
```

- [ ] **Step 4: Pass `leavingIds` to TodoList**

Update the `<TodoList>` usage (line 196-201):

```tsx
<TodoList
  todos={displayTodos}
  onToggle={handleToggleTodo}
  onDelete={handleDeleteTodo}
  onEdit={handleEditTodo}
  leavingIds={leavingIds}
/>
```

- [ ] **Step 5: Verify TypeScript compilation**

```bash
cd frontend && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/App.tsx
git commit -m "feat: handle Active filter leaving with slide-then-fade animation"
```

---

### Task 5: Integration verification

**Files:**
- (none modified — verification only)

- [ ] **Step 1: Start backend**

```bash
cd backend && npm start &
```

- [ ] **Step 2: Build frontend to verify no errors**

```bash
cd frontend && npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 3: Manual smoke test checklist**

1. Open frontend in browser
2. Add 3 todos: "One", "Two", "Three"
3. Complete "Two" → verify it slides to bottom with smooth animation
4. Complete "Three" → verify it joins "Two" at the bottom
5. Un-complete "Two" → verify it slides back up among active items
6. Switch to "Active" filter
7. Complete a todo → verify it slides to bottom, shows completed style briefly, then fades out
8. Switch to "All" → verify completed items are at the bottom

- [ ] **Step 4: Commit any cleanup**

```bash
git add .
git commit -m "chore: final integration verification"
```
