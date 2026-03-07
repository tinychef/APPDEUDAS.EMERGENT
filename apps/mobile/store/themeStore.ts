import { create } from 'zustand';
import { DarkColors, LightColors } from '../constants/theme';

type ThemeMode = 'dark' | 'light';
type ThemeColors = typeof DarkColors;

interface ThemeState {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'dark',
  colors: DarkColors,

  toggleTheme: () =>
    set((state) => ({
      mode: state.mode === 'dark' ? 'light' : 'dark',
      colors: state.mode === 'dark' ? LightColors : DarkColors,
    })),

  setMode: (mode) =>
    set({ mode, colors: mode === 'dark' ? DarkColors : LightColors }),
}));
