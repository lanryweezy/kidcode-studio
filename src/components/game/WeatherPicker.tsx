import React from 'react';
import { useStore } from '../../store/useStore';
import { SpriteState } from '../../types';

interface WeatherOption {
  type: string;
  emoji: string;
  label: string;
  description: string;
}

const WEATHER_OPTIONS: WeatherOption[] = [
  { type: 'none', emoji: '☀️', label: 'Clear', description: 'Sunny skies' },
  { type: 'rain', emoji: '🌧️', label: 'Rain', description: 'Falling raindrops' },
  { type: 'snow', emoji: '❄️', label: 'Snow', description: 'Gentle snowfall' },
  { type: 'fog', emoji: '🌫️', label: 'Fog', description: 'Mysterious mist' },
  { type: 'storm', emoji: '⛈️', label: 'Storm', description: 'Lightning and thunder' },
  { type: 'wind', emoji: '💨', label: 'Wind', description: 'Blowing particles' },
  { type: 'ash', emoji: '🌋', label: 'Ash', description: 'Volcanic ash fall' },
  { type: 'fireflies', emoji: '✨', label: 'Fireflies', description: 'Magical glowing dots' },
];

export const WeatherPicker: React.FC = React.memo(() => {
  const { spriteState, updateSpriteState } = useStore();
  const currentWeather = spriteState.weather || 'none';

  const handleWeatherClick = React.useCallback((e: React.MouseEvent) => {
    const type = (e.currentTarget as HTMLElement).dataset.weatherType;
    if (type) updateSpriteState({ weather: type as SpriteState['weather'] });
  }, [updateSpriteState]);

  return (
    <div className="space-y-3" aria-label="Weather picker">
      <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Weather</div>
      <div className="grid grid-cols-2 gap-2">
        {WEATHER_OPTIONS.map(weather => (
          <button
            key={weather.type}
            data-weather-type={weather.type}
            onClick={handleWeatherClick}
            aria-label={`Set weather to ${weather.label}`}
            className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all ${
              currentWeather === weather.type
                ? 'bg-violet-100 border-2 border-violet-400 shadow-sm'
                : 'bg-slate-100 border-2 border-transparent hover:border-slate-300'
            }`}
          >
            <span className="text-xl">{weather.emoji}</span>
            <div>
              <div className="text-xs font-bold text-slate-700">{weather.label}</div>
              <div className="text-[10px] text-slate-500">{weather.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});
