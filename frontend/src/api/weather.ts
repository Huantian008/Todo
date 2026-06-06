import axios from 'axios';
import type { TodayWeather } from '../types/weather';
import type { ApiResponse } from './todos';

const BASE_URL = 'http://localhost:3001/api/weather/today';

// Fetch today's weather proxying Gaode API through the Go server
export const getTodayWeather = async (
  lat: number,
  lng: number
): Promise<ApiResponse<TodayWeather>> => {
  const response = await axios.get<ApiResponse<TodayWeather>>(`${BASE_URL}?lat=${lat}&lng=${lng}`);
  return response.data;
};
