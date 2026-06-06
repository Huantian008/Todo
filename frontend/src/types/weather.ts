export type WeatherCondition =
  | 'sunny'
  | 'cloudy'
  | 'rainy'
  | 'snowy'
  | 'foggy'
  | 'default';

export interface TodayWeather {
  province: string;
  city: string;
  adcode: string;
  weather: string;
  condition: WeatherCondition;
  temperature: string;
  humidity: string;
  windDirection: string;
  windPower: string;
  reportTime: string;
}
