import axios from 'axios';
import type { Todo } from '../types/todo';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const BASE_URL = `${API_BASE_URL}/api/todos`;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  error?: string;
}

// Fetch todos, optionally filtered by YYYY-MM-DD date
export const getTodos = async (date?: string): Promise<ApiResponse<Todo[]>> => {
  const url = date ? `${BASE_URL}?date=${date}` : BASE_URL;
  const response = await axios.get<ApiResponse<Todo[]>>(url);
  return response.data;
};

// Fetch a single todo by ID
export const getTodo = async (id: string): Promise<ApiResponse<Todo>> => {
  const response = await axios.get<ApiResponse<Todo>>(`${BASE_URL}/${id}`);
  return response.data;
};

// Create a new Todo
export const createTodo = async (
  title: string,
  taskDate: string,
  description?: string
): Promise<ApiResponse<Todo>> => {
  const response = await axios.post<ApiResponse<Todo>>(BASE_URL, {
    title,
    taskDate,
    description,
  });
  return response.data;
};

// Partially update an existing Todo
export const updateTodo = async (
  id: string,
  updates: Partial<Pick<Todo, 'title' | 'description' | 'completed' | 'taskDate'>>
): Promise<ApiResponse<Todo>> => {
  const response = await axios.put<ApiResponse<Todo>>(`${BASE_URL}/${id}`, updates);
  return response.data;
};

// Delete a Todo by ID
export const deleteTodo = async (id: string): Promise<ApiResponse<null>> => {
  const response = await axios.delete<ApiResponse<null>>(`${BASE_URL}/${id}`);
  return response.data;
};
