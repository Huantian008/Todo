# Todo Completion Sort + Animation Design

**Date:** 2026-06-06
**Status:** Approved

## Problem

1. Completed todos appear in-place, mixed with active todos
2. No visual feedback when a todo transitions from active → completed state
3. In "Active" filter, completing a todo makes it vanish abruptly

## Goal

- Completed todos always sort to bottom (active first, completed last)
- Smooth FLIP animation when toggling completion
- In Active filter: slide to bottom first → show completed style briefly → fade out

## Non-Goals

- No backend changes (sorting is a presentation concern)
- No new data fields (no `sortOrder` or `completedAt`)
- No drag-and-drop reordering (that's a separate feature)

---

## Architecture

### Frontend-Only Change

Sorting lives entirely in the React layer. The backend continues to return todos in insertion order; the frontend re-sorts based on `completed` status.

### Sort Logic

```
sortedTodos = [
  ...todos.filter(t => !t.completed).sort(by createdAt asc),
  ...todos.filter(t => t.completed).sort(by createdAt asc)
]
```

When `completed` changes:
- `false → true`: todo moves from active group → end of completed group
- `true → false`: todo moves from completed group → end of active group

### FLIP Animation (First-Last-Invert-Play)

On every render where todos change order:

1. **First** — Read current DOM positions via `getBoundingClientRect()` on each `<li>`
2. **Last** — React re-renders with new sorted order, items jump to new positions
3. **Invert** — Calculate `deltaY = oldTop - newTop`; apply `transform: translateY(deltaY)` to cancel the jump
4. **Play** — `requestAnimationFrame` → remove transform → CSS `transition: transform 300ms` does the rest

### Active Filter Fade-Out

When filter is "active" and a todo gets completed:
1. FLIP moves it to the bottom (visible in the "completed" area briefly)
2. After 200ms delay, add `animate-fade-out` class → opacity 0 + height collapse
3. On `transitionend`, remove from the rendered list

---

## Files Changed

| File | Change |
|------|--------|
| `frontend/src/components/App.tsx` | Add sortedTodos computation; pass sorted list to TodoList |
| `frontend/src/components/TodoList.tsx` | Add FLIP ref management + animation orchestration |
| `frontend/src/components/TodoItem.tsx` | Add fade-out animation support for Active filter |

### No Changes To

- `backend/` — all files unchanged
- `frontend/src/components/AddTodo.tsx`
- `frontend/src/components/Header.tsx`

---

## Component Details

### App.tsx

```tsx
// New: sorted todos with active-first, completed-last
const sortedTodos = useMemo(() => {
  const active = todos.filter(t => !t.completed);
  const completed = todos.filter(t => t.completed);
  return [...active, ...completed];
}, [todos]);
```

`filteredTodos` and `sortedTodos` compose: filter first, then `sortedTodos` is already in the right order so filtering preserves it.

Actually, simpler: just apply the sort directly on the raw todos, and the filter pills just show/hide items without changing order:

```tsx
const displayTodos = useMemo(() => {
  const sorted = [...todos].sort((a, b) => {
    // active before completed
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    // within each group, by createdAt asc
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
  
  if (filter === 'active') return sorted.filter(t => !t.completed);
  if (filter === 'completed') return sorted.filter(t => t.completed);
  return sorted;
}, [todos, filter]);
```

### TodoList.tsx — FLIP Hook

A custom `useFlipAnimation(todos)` hook:

```tsx
function useFlipAnimation(items: Todo[]) {
  const positionsRef = useRef<Map<string, DOMRect>>(new Map());
  const elementsRef = useRef<Map<string, HTMLElement>>(new Map());

  // Called before render: capture old positions
  useEffect(() => {
    // Reconcile stored positions with current items
  });

  // Called after render: invert + play
  useLayoutEffect(() => {
    // Read new positions → calculate delta → apply invert → play
  });

  return { registerElement, registerElement };
}
```

### TodoItem.tsx — Fade Out

```tsx
// Props: isLeaving (boolean) — true when item completed in Active filter
<div className={cn(
  "todo-item",
  todo.completed && "opacity-40",
  isLeaving && "animate-fade-out"
)}>
```

---

## Edge Cases

1. **Rapid toggle** — Previous animation is interrupted; new FLIP starts from current positions
2. **Multiple completions** — Each item independently FLIPs to its new position
3. **Empty list** — No-op
4. **API failure on toggle** — Optimistic update is reverted; FLIP reverses the item back
5. **Filter switch while animating** — Animation completes naturally; new filter applies cleanly

---

## Testing

- Manually verify: toggle completion, see smooth transition to bottom
- Manually verify: Active filter → complete todo → slide down + fade out
- Manually verify: revert toggle (uncomplete) → item moves back up
- Backend tests remain unchanged (no backend changes)
