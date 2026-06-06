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
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl animate-pulse flex flex-col gap-3 min-h-[160px] justify-center">
        <div className="h-5 bg-white/10 rounded w-1/3" />
        <div className="h-10 bg-white/10 rounded w-1/2" />
        <div className="h-4 bg-white/10 rounded w-3/4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl min-h-[160px] flex flex-col items-center justify-center text-center">
        <svg className="w-8 h-8 text-[var(--color-text-muted)] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-[var(--color-text-dim)] text-sm font-medium">
          {error.includes('denied') || error.includes('User denied') || error.includes('timeout')
            ? 'Location permission needed for weather'
            : 'Weather info unavailable'}
        </p>
        <p className="text-[var(--color-text-muted)] text-xs mt-1">
          Todo features remain fully functional.
        </p>
      </div>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl backdrop-blur-md transition-all duration-500 hover:shadow-2xl">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-wider font-bold">
            Current Weather
          </span>
          <h3 className="text-[var(--color-text)] font-bold text-lg mt-0.5">
            {weather.city || weather.province}
          </h3>
        </div>
        <WeatherIcon condition={weather.condition} className="w-10 h-10 drop-shadow-md" />
      </div>

      <div className="flex items-baseline gap-1 mt-4">
        <span className="text-4xl font-extrabold text-[var(--color-text)] tracking-tight">
          {weather.temperature}
        </span>
        <span className="text-lg font-bold text-[var(--accent)]">
          °C
        </span>
        <span className="ml-auto text-xs font-semibold text-[var(--color-text-dim)] bg-[var(--color-card)]/50 px-2.5 py-1 rounded-full border border-[var(--color-border)]/30">
          {weather.weather}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-[var(--color-border)]/50 text-xs">
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

      <div className="text-[9px] text-[var(--color-text-muted)] mt-4 text-right">
        Updated: {weather.reportTime.split(' ')[1] || weather.reportTime}
      </div>
    </div>
  );
};

export default WeatherCard;
