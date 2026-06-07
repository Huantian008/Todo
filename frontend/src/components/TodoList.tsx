import React, { useRef, useEffect, useLayoutEffect } from 'react';
import TodoItem from './TodoItem';
import type { Todo } from '../types/todo';

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
        el.style.zIndex = '20'; // Float above others during move

        // Play: animate to new position
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            el.style.transform = '';
            
            // Clean up z-index after animation
            setTimeout(() => {
              el.style.zIndex = '';
              el.style.transition = ''; // Restore CSS class transition
            }, 600);
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
    <ul className="divide-y divide-[var(--color-border)]/70">
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
