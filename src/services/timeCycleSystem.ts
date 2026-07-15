export interface TimeState {
  day: number;
  hour: number;
  minute: number;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  isDaytime: boolean;
  isRushHour: boolean;
}

export function createTimeState(startDay: number = 1, startHour: number = 8): TimeState {
  return {
    day: startDay,
    hour: startHour,
    minute: 0,
    season: getSeason(startDay),
    isDaytime: startHour >= 6 && startHour < 20,
    isRushHour: (startHour >= 7 && startHour <= 9) || (startHour >= 17 && startHour <= 19),
  };
}

export function advanceTime(state: TimeState, minutes: number): TimeState {
  let newMinute = state.minute + minutes;
  let newHour = state.hour;
  let newDay = state.day;

  while (newMinute >= 60) {
    newMinute -= 60;
    newHour++;
  }

  while (newHour >= 24) {
    newHour -= 24;
    newDay++;
  }

  return {
    ...state,
    day: newDay,
    hour: newHour,
    minute: newMinute,
    season: getSeason(newDay),
    isDaytime: newHour >= 6 && newHour < 20,
    isRushHour: (newHour >= 7 && newHour <= 9) || (newHour >= 17 && newHour <= 19),
  };
}

function getSeason(day: number): TimeState['season'] {
  const dayOfYear = day % 365;
  if (dayOfYear < 90) return 'spring';
  if (dayOfYear < 180) return 'summer';
  if (dayOfYear < 270) return 'autumn';
  return 'winter';
}

export function getTimeString(state: TimeState): string {
  const h = state.hour.toString().padStart(2, '0');
  const m = state.minute.toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function getDayString(state: TimeState): string {
  return `Day ${state.day}`;
}

export function getSeasonEmoji(season: TimeState['season']): string {
  const emojis = {
    spring: '🌸',
    summer: '☀️',
    autumn: '🍂',
    winter: '❄️',
  };
  return emojis[season];
}

export function getCustomerMultiplier(state: TimeState): number {
  let multiplier = 1.0;
  
  // Rush hour bonus
  if (state.isRushHour) multiplier *= 1.5;
  
  // Night slowdown
  if (!state.isDaytime) multiplier *= 0.3;
  
  // Season effects
  const seasonMultipliers = {
    spring: 1.1,
    summer: 1.3,
    autumn: 1.0,
    winter: 0.8,
  };
  multiplier *= seasonMultipliers[state.season];
  
  return multiplier;
}
