import React from 'react';
import type { TodayWeather, WeatherCondition } from '../types/weather';

interface TodayHeaderProps {
  todoCount: number;
  completedCount: number;
  weather: TodayWeather | null;
  loadingWeather: boolean;
  weatherError: string | null;
}

const WeatherIcon: React.FC<{ condition: WeatherCondition; className?: string }> = ({ condition, className = "w-6 h-6" }) => {
  switch (condition) {
    case 'sunny':
      return <svg className={`${className} text-amber-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.32 11.32l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>;
    case 'cloudy':
      return <svg className={`${className} text-slate-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>;
    case 'rainy':
      return <svg className={`${className} text-blue-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25M17 14v6m-4-6v6m-4-6v6m-4-6v6" /></svg>;
    case 'snowy':
      return <svg className={`${className} text-blue-200`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3m15.364-6.364l-12.728 12.728M18.364 18.364L5.636 5.636" /></svg>;
    case 'foggy':
      return <svg className={`${className} text-zinc-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;
    default:
      return <svg className={`${className} text-[var(--color-accent)]`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707" /></svg>;
  }
};

const TodayHeader: React.FC<TodayHeaderProps> = ({ todoCount, completedCount, weather, loadingWeather, weatherError }) => {
  const today = new Date();
  
  const dateOptions: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  };
  const formattedDate = today.toLocaleDateString('en-US', dateOptions);

  return (
    <header className="select-none mb-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h1 className="text-4xl md:text-[3.5rem] font-black leading-tight tracking-[-0.04em] font-[family-name:var(--font-display)] text-[var(--color-text)]">
          Today
        </h1>
        <p className="mt-1.5 text-[var(--color-text-dim)] text-[16px] font-medium tracking-wide">
          {formattedDate}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Weather Pill */}
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/40 border border-white/60 shadow-sm backdrop-blur-xl transition-all hover:bg-white/60">
          {loadingWeather ? (
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-6 h-6 rounded-full bg-slate-200/50"></div>
              <div className="w-20 h-4 rounded bg-slate-200/50"></div>
            </div>
          ) : weatherError ? (
             <div className="flex items-center gap-2 text-sm text-[var(--color-text-dim)] font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M7.5 5.6a8 8 0 1010 0" />
                </svg>
                <span>{weatherError}</span>
             </div>
          ) : weather ? (
            <>
              <WeatherIcon condition={weather.condition} className="w-7 h-7 drop-shadow-sm" />
              <div className="flex flex-col">
                <span className="text-[16px] leading-none font-bold text-[var(--color-text)]">
                  {weather.temperature}°C <span className="text-[var(--color-text-muted)] font-medium text-[14px] ml-1">{weather.weather}</span>
                </span>
                <span className="text-[11px] font-bold text-[var(--color-text-dim)] uppercase tracking-[0.15em] mt-1">
                  {weather.city || weather.province}
                </span>
              </div>
            </>
          ) : null}
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[var(--color-text)] text-white shadow-md transition-transform hover:-translate-y-0.5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">
              Progress
            </span>
            <span className="text-[16px] font-bold leading-none">
              {completedCount} <span className="text-slate-400 font-medium">/ {todoCount}</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TodayHeader;
