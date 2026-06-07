import axios from 'axios';
import type { TodayWeather } from '../types/weather';
import type { ApiResponse } from './todos';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const BASE_URL = `${API_BASE_URL}/api/weather/today`;

// Fetch today's weather proxying Gaode API through the Go server
export const getTodayWeather = async (
  lat: number,
  lng: number
): Promise<ApiResponse<TodayWeather>> => {
  const response = await axios.get<ApiResponse<TodayWeather>>(`${BASE_URL}?lat=${lat}&lng=${lng}`);
  return response.data;
};
