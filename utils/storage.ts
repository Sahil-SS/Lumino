import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface MonthData {
  habits: Habit[];
  completions: Record<string, string[]>;
}

export interface AppState {
  selectedMonth: string;
  monthData: Record<string, MonthData>;
}

const STORAGE_KEY = 'habit_tracker_state_v2';

export const HABIT_COLORS = [
  '#FF6B9D', '#C44DFF', '#4DFFDB', '#FFD93D',
  '#FF8E53', '#4DAFFF', '#A8FF78', '#FF4D4D',
];

export const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).substr(2);

export const getRandomColor = (): string =>
  HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)];

export const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const loadState = async (): Promise<AppState> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('loadState error', e);
  }
  return { selectedMonth: getCurrentMonth(), monthData: {} };
};

export const saveState = async (state: AppState): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('saveState error', e);
  }
};

export const getMonthData = (state: AppState, month: string): MonthData => {
  return state.monthData[month] || { habits: [], completions: {} };
};

export const getDaysInMonth = (month: string): number => {
  const [year, m] = month.split('-').map(Number);
  return new Date(year, m, 0).getDate();
};

export const formatDateKey = (month: string, day: number): string => {
  return `${month}-${String(day).padStart(2, '0')}`;
};

export const getGraphData = (monthData: MonthData, month: string): number[] => {
  const days = getDaysInMonth(month);
  return Array.from({ length: days }, (_, i) => {
    const key = formatDateKey(month, i + 1);
    return (monthData.completions[key] || []).length;
  });
};

export const getMonthLabel = (month: string): string => {
  const [year, m] = month.split('-').map(Number);
  return new Date(year, m - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
};

export const getShortMonthLabel = (month: string): string => {
  const [year, m] = month.split('-').map(Number);
  return new Date(year, m - 1, 1).toLocaleString('default', { month: 'long' });
};

export const getPrevMonth = (month: string): string => {
  const [year, m] = month.split('-').map(Number);
  const d = new Date(year, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const getNextMonth = (month: string): string => {
  const [year, m] = month.split('-').map(Number);
  const d = new Date(year, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
];