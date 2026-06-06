import React from 'react';
import type { TodayWeather, WeatherCondition } from '../types/weather';

interface WeatherCardProps {
  weather: TodayWeather | null;
  loading: boolean;
  error: string | null;
}

const WeatherIcon: React.FC<{ condition: WeatherCondition; className?: string }> = ({ condition, className = "w-10 h-10" }) => {
  switch (condition) {
    case 'sunny':
      return (
        <svg className={`${className} text-amber-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.32 11.32l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      );
    case 'cloudy':
      return (
        <svg className={`${className} text-slate-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      );
    case 'rainy':
      return (
        <svg className={`${className} text-blue-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25M17 14v6m-4-6v6m-4-6v6m-4-6v6" />
        </svg>
      );
    case 'snowy':
      return (
        <svg className={`${className} text-blue-200`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3m15.364-6.364l-12.728 12.728M18.364 18.364L5.636 5.636" />
        </svg>
      );
    case 'foggy':
      return (
        <svg className={`${className} text-zinc-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      );
    default:
      return (
        <svg className={`${className} text-[var(--accent)]`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707" />
        </svg>
      );
  }
};

const WeatherCard: React.FC<WeatherCardProps> = ({ weather, loading, error }) => {
  if (loading) {
    return (
      <div className="rounded-[1.75rem] glass-panel-soft p-5 animate-pulse flex flex-col gap-3 min-h-[180px] justify-center">
        <div className="h-5 bg-white/55 rounded-full w-1/3" />
        <div className="h-12 bg-white/55 rounded-2xl w-1/2" />
        <div className="h-4 bg-white/45 rounded-full w-3/4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[1.75rem] glass-panel-soft glass-hairline p-5 min-h-[180px] flex flex-col items-center justify-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl weather-sheen shadow-lg">
          <svg className="w-6 h-6 text-[var(--accent-dim)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M7.5 5.6a8 8 0 1010 0" />
          </svg>
        </div>
        <p className="text-[var(--color-text)] text-sm font-bold">
          {error.includes('denied') || error.includes('User denied') || error.includes('timeout')
            ? 'Location permission needed for weather'
            : 'Weather info unavailable'}
        </p>
        <p className="text-[var(--color-text-muted)] text-xs mt-1.5 leading-relaxed">
          Todo features remain fully functional.
        </p>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] glass-panel-soft glass-hairline p-5 transition-all duration-500 hover:-translate-y-0.5">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-40 blur-2xl"
        style={{ background: 'var(--accent-light)' }}
      />
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-[0.24em] font-black">
            Local weather
          </span>
          <h3 className="text-[var(--color-text)] font-black text-xl mt-1">
            {weather.city || weather.province}
          </h3>
        </div>
        <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl weather-sheen shadow-lg">
          <WeatherIcon condition={weather.condition} className="w-8 h-8 drop-shadow-md" />
        </div>
      </div>

      <div className="relative z-10 flex items-baseline gap-1 mt-5">
        <span className="text-5xl font-black text-[var(--color-text)] tracking-tight">
          {weather.temperature}
        </span>
        <span className="text-xl font-black text-[var(--accent)]">
          °C
        </span>
        <span className="ml-auto text-xs font-bold text-[var(--color-text-dim)] bg-white/28 px-3 py-1.5 rounded-full border border-white/80 shadow-sm backdrop-blur-xl">
          {weather.weather}
        </span>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-white/70 text-xs">
        <div>
          <span className="text-[var(--color-text-muted)]">Humidity</span>
          <p className="font-semibold text-[var(--color-text-dim)] mt-0.5">{weather.humidity}%</p>
        </div>
        <div>
          <span className="text-[var(--color-text-muted)]">Wind</span>
          <p className="font-semibold text-[var(--color-text-dim)] mt-0.5">
            {weather.windDirection} {weather.windPower}
          </p>
        </div>
      </div>

      <div className="relative z-10 text-[10px] font-semibold text-[var(--color-text-muted)] mt-4 text-right">
        Updated: {weather.reportTime.split(' ')[1] || weather.reportTime}
      </div>
    </div>
  );
};

export default WeatherCard;
